import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";

// Možemo ovo izvući u config.ts kasnije, ali za sad je OK
const STORAGE_ROOT = path.resolve(process.cwd(), "storage");

export class StorageService {
  /**
   * Resolve and validate safety of a relative path
   */
  private getAbsolutePath(relativePath: string): string {
    const absolute = path.resolve(STORAGE_ROOT, relativePath);
    const rel = path.relative(STORAGE_ROOT, absolute);

    // Path traversal check
    if (rel.startsWith("..") || path.isAbsolute(rel)) {
      throw new Error("Invalid file path: Access denied");
    }
    return absolute;
  }

  /**
   * Get file stream for reading content
   */
  async getFileStream(
    relativePath: string,
  ): Promise<{ stream: fs.ReadStream; size: number }> {
    const absolutePath = this.getAbsolutePath(relativePath);

    // Nema try/catch, ako pukne, error ide direktno caller-u (to i zelimo)
    const stats = await fsPromises.stat(absolutePath);
    if (!stats.isFile()) {
      throw new Error("Path is not a regular file");
    }

    await fsPromises.access(absolutePath, fs.constants.R_OK);

    const stream = fs.createReadStream(absolutePath, { encoding: "utf8" });
    return { stream, size: stats.size };
  }

  /**
   * Delete file safely. Supports silent fail if file missing (optional)
   */
  async deleteFile(relativePath: string): Promise<void> {
    try {
      const absolutePath = this.getAbsolutePath(relativePath);
      await fsPromises.unlink(absolutePath);
    } catch (error) {
      // Ako fajl već ne postoji, to je OK za cleanup operacije
      const err = error as NodeJS.ErrnoException;
      if (err.code !== "ENOENT") {
        console.error(
          `StorageService: Failed to delete file ${relativePath}`,
          error,
        );
      }
    }
  }

  /**
   * Memory-efficient word counting using streams
   */
  async countWordsStream(relativePath: string): Promise<number> {
    const absolutePath = this.getAbsolutePath(relativePath);

    return new Promise((resolve, reject) => {
      let count = 0;
      let inWord = false;

      const stream = fs.createReadStream(absolutePath, {
        encoding: "utf8",
        highWaterMark: 64 * 1024, // 64KB chunks
      });

      stream.on("data", (chunk: string | Buffer) => {
        const str = chunk.toString();
        for (let i = 0; i < str.length; i++) {
          // Provera whitespace-a prema standardnim ASCII kodovima
          // Space (32), Tab (9), LF (10), CR (13), Form Feed (12), Vertical Tab (11)
          const code = str.charCodeAt(i);
          const isWhitespace =
            code === 32 ||
            code === 10 ||
            code === 13 ||
            code === 9 ||
            code === 12 ||
            code === 11;

          if (isWhitespace) {
            inWord = false;
          } else if (!inWord) {
            inWord = true;
            count++;
          }
        }
      });

      stream.on("end", () => resolve(count));
      stream.on("error", (err) => reject(err));
    });
  }
}

export const storageService = new StorageService();
