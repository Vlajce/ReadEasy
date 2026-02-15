import fs from "fs/promises";
import path from "path";
import { connectDB } from "../config/db.js";
import config from "../config/config.js";
import crypto from "crypto";
import { bookRepository } from "../repositories/book.repository.js";
import {
  gutendexBookSchema,
  type GutendexBook,
  bookSchema,
  type BookInput,
} from "../validation/book.schema.js";

// === CONFIG ===
const GUTENDEX_BASE = "https://gutendex.com/books";
const BATCH_SIZE = Number(config.importConcurrency) || 5;
const ROOT = path.resolve(process.cwd());
const IDS_FILE = path.join(ROOT, "data/gutenberg-ids.txt");
const STORAGE_DIR = path.join(ROOT, "storage/public-books");
const LOG_FILE = path.join(ROOT, "data/import-log.json");

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1000;
const DELAY_BETWEEN_BATCHES_MS = 2000;
const STAGGER_DELAY_MS = 500;
const FETCH_TIMEOUT_MS = 20_000; // 20 seconds

// ============================

interface ImportLog {
  success: string[];
  failed: { id: string; reason: string }[];
}

interface FetchResult {
  id: string;
  success: boolean;
  book?: BookInput;
  reason?: string;
}

// ============================
// UTILS
// ============================

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const readIds = async (): Promise<string[]> => {
  const raw = await fs.readFile(IDS_FILE, "utf-8");
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
};

const ensureDir = async () => {
  await fs.mkdir(STORAGE_DIR, { recursive: true });
};

const cleanGutenbergText = (text: string) => {
  const startMatch = text.match(/\*\*\* START OF.*\*\*\*/);
  const endMatch = text.match(/\*\*\* END OF.*\*\*\*/);
  const startIndex = startMatch ? startMatch.index! + startMatch[0].length : 0;
  const endIndex = endMatch ? endMatch.index! : text.length;
  return text.slice(startIndex, endIndex).trim();
};

const cleanGutenbergHtml = (html: string): string => {
  // Extract body content
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  let content = bodyMatch?.[1] ?? html;

  // Remove everything up to and including the START marker and its containing element
  content = content.replace(
    /[\s\S]*?\*\*\*\s*START OF (?:THE |THIS )?PROJECT GUTENBERG[^*]*\*\*\*\s*(?:<\/[^>]+>)?/i,
    "",
  );

  // Remove everything from the END marker's containing element onward
  content = content.replace(
    /(?:<[^>]+>)?\s*\*\*\*\s*END OF (?:THE |THIS )?PROJECT GUTENBERG[\s\S]*/i,
    "",
  );

  // Remove img tags (images are not downloaded/stored locally)
  content = content.replace(/<img[^>]*>/gi, "");

  return content.trim();
};

const stripHtmlTags = (html: string): string => {
  return html.replace(/<[^>]*>/g, " ");
};

const countWords = (text: string) => {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (!trimmed) return 0;
  return trimmed.split(" ").length;
};

const getHtmlUrl = (formats: Record<string, string>): string | null => {
  for (const [key, url] of Object.entries(formats)) {
    if (/^text\/html/i.test(key)) return url;
  }
  return null;
};

const getTxtUrl = (formats: Record<string, string>): string | null => {
  for (const [key, url] of Object.entries(formats)) {
    if (/^text\/plain/i.test(key)) return url;
  }
  return null;
};

const getImageUrl = (formats: Record<string, string>): string | null => {
  for (const [key, url] of Object.entries(formats)) {
    if (/^image\/jpeg/i.test(key)) return url;
  }
  return null;
};

const loadLog = async (): Promise<ImportLog> => {
  try {
    const raw = await fs.readFile(LOG_FILE, "utf-8");
    return JSON.parse(raw) as ImportLog;
  } catch {
    return { success: [], failed: [] };
  }
};

const saveLog = async (log: ImportLog) => {
  await fs.writeFile(LOG_FILE, JSON.stringify(log, null, 2));
};

const formatAuthor = (raw?: string): string => {
  if (!raw) return "Unknown";
  const name = raw.trim();
  if (!name) return "Unknown";

  if (name.includes(",")) {
    const parts = name
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length >= 2) {
      const last = parts[0];
      const rest = parts.slice(1).join(" ");
      return `${rest} ${last}`.replace(/\s+/g, " ").trim();
    }
  }

  return name.replace(/\s+/g, " ").trim();
};

// ============================
// FETCH WITH RETRY
// ============================

const fetchWithRetry = async (
  url: string,
  retries = MAX_RETRIES,
): Promise<Response> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.status === 429) {
        const retryAfter = res.headers.get("retry-after");
        const waitMs = retryAfter
          ? parseInt(retryAfter, 10) * 1000
          : INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        console.warn(
          `  Rate limited on ${url}, waiting ${waitMs}ms (attempt ${attempt}/${retries})`,
        );
        await sleep(waitMs);
        continue;
      }

      if (res.status >= 500 && attempt < retries) {
        const waitMs = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        console.warn(
          `  Server error ${res.status}, retrying in ${waitMs}ms (attempt ${attempt}/${retries})`,
        );
        await sleep(waitMs);
        continue;
      }

      return res;
    } catch (err: unknown) {
      if (attempt < retries) {
        const waitMs = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(
          `  Network error: ${msg}, retrying in ${waitMs}ms (attempt ${attempt}/${retries})`,
        );
        await sleep(waitMs);
      } else {
        throw err;
      }
    }
  }

  throw new Error(`Max retries (${retries}) exceeded for ${url}`);
};

// ============================
// FETCH & SAVE TO DISK
// ============================

const fetchBook = async (id: string): Promise<FetchResult> => {
  console.log(`Fetching book ${id}...`);

  try {
    const res = await fetchWithRetry(`${GUTENDEX_BASE}/${id}/`);
    if (!res.ok)
      throw new Error(`Metadata fetch failed (status ${res.status})`);

    const rawData = await res.json();
    const data: GutendexBook = gutendexBookSchema.parse(rawData);

    const htmlUrl = getHtmlUrl(data.formats);
    const txtUrl = getTxtUrl(data.formats);
    const contentUrl = htmlUrl || txtUrl;
    const isHtml = !!htmlUrl;

    if (!contentUrl)
      return { id, success: false, reason: "No HTML or TXT format" };

    const contentRes = await fetchWithRetry(contentUrl);
    if (!contentRes.ok)
      throw new Error(`Content download failed (status ${contentRes.status})`);

    const rawContent = await contentRes.text();
    const cleanContent = isHtml
      ? cleanGutenbergHtml(rawContent)
      : cleanGutenbergText(rawContent);
    const wordCount = isHtml
      ? countWords(stripHtmlTags(cleanContent))
      : countWords(cleanContent);

    const extension = isHtml ? "html" : "txt";
    const fileName = `${data.id}.${extension}`;
    const localPath = path.join(STORAGE_DIR, fileName);
    await fs.writeFile(localPath, cleanContent);

    const imageUrl = getImageUrl(data.formats);
    const description = data.summaries?.[0]?.slice(0, 2000);

    const book: BookInput = bookSchema.parse({
      title: data.title,
      author: formatAuthor(data.authors?.[0]?.name),
      language: data.languages?.[0] || "en",
      description,
      filepath: `public-books/${fileName}`,
      imageUrl: imageUrl || undefined,
      wordCount,
      visibility: "public",
      subjects: data.subjects || [],
    });

    return { id, success: true, book };
  } catch (err: unknown) {
    const reason =
      err instanceof Error ? err.message : String(err || "Unknown error");
    console.error(`  Failed to fetch book ${id}: ${reason}`);
    return { id, success: false, reason };
  }
};

// Clean up disk file for a book that failed DB insert
const cleanupFile = async (book: BookInput) => {
  try {
    await bookRepository.deleteFile(book.filepath);
  } catch {
    /* best-effort cleanup */
  }
};

// ============================
// MAIN
// ============================

const main = async () => {
  await connectDB();
  await ensureDir();

  const ids = await readIds();
  const uniqueIds = Array.from(new Set(ids));

  const log = await loadLog();
  const successSet = new Set(log.success);
  const failedMap = new Map(
    log.failed.map((f) => [f.id, f.reason] as [string, string]),
  );

  const remainingIds = uniqueIds.filter((id) => !successSet.has(id));

  console.log(
    `Total: ${uniqueIds.length} | Already imported: ${successSet.size} | Remaining: ${remainingIds.length}\n`,
  );

  for (let i = 0; i < remainingIds.length; i += BATCH_SIZE) {
    const batch = remainingIds.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    console.log(`--- Batch ${batchNum} (${batch.length} books) ---`);

    // Phase 1: Fetch all books in batch (staggered)
    const results = await Promise.all(
      batch.map((id, idx) =>
        sleep(idx * STAGGER_DELAY_MS).then(() => fetchBook(id)),
      ),
    );

    // Separate fetch successes from failures
    const fetched = results.filter((r) => r.success && r.book);
    const fetchFailed = results.filter((r) => !r.success);

    // Mark fetch failures immediately
    for (const r of fetchFailed) {
      failedMap.set(r.id, r.reason || "Unknown");
    }

    // Phase 2: Insert fetched books into DB
    if (fetched.length > 0) {
      try {
        await bookRepository.insertManyBooks(fetched.map((r) => r.book!));

        // DB insert succeeded — mark all as success
        for (const r of fetched) {
          successSet.add(r.id);
          failedMap.delete(r.id);
        }
      } catch (err) {
        console.error("  DB insert failed:", err);

        // DB insert failed — clean up all disk files, mark as failed
        for (const r of fetched) {
          await cleanupFile(r.book!);
          failedMap.set(r.id, "DB insert failed");
        }
      }
    }

    // Save log after each batch
    log.success = Array.from(successSet);
    log.failed = Array.from(failedMap.entries()).map(([id, reason]) => ({
      id,
      reason,
    }));
    await saveLog(log);

    console.log(
      `  Done — ${fetched.length} saved, ${fetchFailed.length} failed\n`,
    );

    // Pause between batches
    if (i + BATCH_SIZE < remainingIds.length) {
      await sleep(DELAY_BETWEEN_BATCHES_MS);
    }
  }

  console.log(
    `\nImport complete — Success: ${log.success.length}, Failed: ${log.failed.length}`,
  );
  process.exit(0);
};

main();
