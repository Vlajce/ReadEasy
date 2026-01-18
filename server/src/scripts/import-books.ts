import fs from "fs/promises";
import path from "path";
import { connectDB } from "../config/db.js";
import config from "../config/config.js";
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

// ============================

interface ImportLog {
  success: string[];
  failed: { id: string; reason: string }[];
}

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

// === UTILS ===

const cleanGutenbergText = (text: string) => {
  const startMatch = text.match(/\*\*\* START OF.*\*\*\*/);
  const endMatch = text.match(/\*\*\* END OF.*\*\*\*/);

  const startIndex = startMatch ? startMatch.index! + startMatch[0].length : 0;
  const endIndex = endMatch ? endMatch.index! : text.length;

  return text.slice(startIndex, endIndex).trim();
};

const countWords = (text: string) => {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (!trimmed) return 0;
  return trimmed.split(" ").length;
};

// Robust getTxtUrl: traži bilo koji key koji sadrži text/plain
const getTxtUrl = (formats: Record<string, string>): string | null => {
  for (const [key, url] of Object.entries(formats)) {
    if (/^text\/plain/i.test(key)) return url;
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

// ============================

interface ImportResult {
  id: string;
  success: boolean;
  reason?: string;
}

const importBook = async (id: string): Promise<ImportResult> => {
  console.log(`Importing book ${id}`);

  try {
    const res = await fetch(`${GUTENDEX_BASE}/${id}/`);
    if (!res.ok)
      throw new Error(`Failed to fetch book ID ${id} (status ${res.status})`);

    const rawData = await res.json();
    const data: GutendexBook = gutendexBookSchema.parse(rawData); // TS + runtime safe

    const txtUrl = getTxtUrl(data.formats);
    if (!txtUrl) {
      return { id, success: false, reason: "No TXT format" };
    }

    const txtRes = await fetch(txtUrl);
    if (!txtRes.ok)
      throw new Error(`Failed to download TXT file (status ${txtRes.status})`);
    const rawText = await txtRes.text();
    const cleanText = cleanGutenbergText(rawText);
    const wordCount = countWords(cleanText);

    const safeTitle = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const fileName = `${id}-${safeTitle}.txt`;
    const localPath = path.join(STORAGE_DIR, fileName);

    await fs.writeFile(localPath, cleanText);

    const relativePath = `public-books/${fileName}`;

    // === PRIPREMI BOOKINPUT ===
    const description = data.summaries?.[0]
      ? data.summaries[0].slice(0, 2000)
      : undefined;

    const bookInput: BookInput = bookSchema.parse({
      title: data.title,
      author: data.authors?.[0]?.name || "Unknown",
      language: data.languages?.[0] || "en",
      description,
      filepath: relativePath,
      wordCount,
      isPublicDomain: true,
    });

    await bookRepository.createBook(bookInput);

    console.log(`Imported: ${data.title}`);
    return { id, success: true };
  } catch (err: unknown) {
    let reason = "Unknown error";
    if (err instanceof Error) reason = err.message;
    else if (typeof err === "string") reason = err;

    console.error(`Error importing ${id}: ${reason}`);
    return { id, success: false, reason };
  }
};

// ============================

const main = async () => {
  await connectDB();
  await ensureDir();

  const ids = await readIds();
  const log = await loadLog();
  const successSet = new Set(log.success);
  const failedMap = new Map(
    log.failed.map((f) => [f.id, f.reason] as [string, string]),
  );

  // Filtriramo one koje smo već uvezli
  const remainingIds = ids.filter((id) => !successSet.has(id));

  console.log(`Total books to import: ${remainingIds.length}`);

  for (let i = 0; i < remainingIds.length; i += BATCH_SIZE) {
    const batch = remainingIds.slice(i, i + BATCH_SIZE);
    console.log(
      `Processing batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} books)`,
    );

    const results = await Promise.all(batch.map((id) => importBook(id)));

    for (const r of results) {
      if (r.success) successSet.add(r.id);
      else failedMap.set(r.id, r.reason || "Unknown");
    }

    // Persist deduped arrays back to log and save
    log.success = Array.from(successSet);
    log.failed = Array.from(failedMap.entries()).map(([id, reason]) => ({
      id,
      reason,
    }));

    await saveLog(log);

    console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1} done`);
  }

  console.log("Import finished");
  console.log(`Success: ${log.success.length}, Failed: ${log.failed.length}`);
  process.exit(0);
};

main();
