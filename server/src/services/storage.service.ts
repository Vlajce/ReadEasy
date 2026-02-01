import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import { NotFoundError } from "../errors/not.found.error.js";
import { InternalServerError } from "../errors/internal.server.error.js";

// Možemo ovo izvući u config.ts kasnije, ali za sad je OK
const STORAGE_ROOT = path.resolve(process.cwd(), "storage");

export class StorageService {
  private getAbsolutePath(relativePath: string): string {
    const absolute = path.resolve(STORAGE_ROOT, relativePath);
    const rel = path.relative(STORAGE_ROOT, absolute);

    if (rel.startsWith("..") || path.isAbsolute(rel)) {
      throw new InternalServerError("Invalid file path: Access denied");
    }
    return absolute;
  }

  async getFileStream(
    relativePath: string,
  ): Promise<{ stream: fs.ReadStream; size: number }> {
    const absolutePath = this.getAbsolutePath(relativePath);

    try {
      const stats = await fsPromises.stat(absolutePath);
      if (!stats.isFile()) {
        throw new NotFoundError(`Path is not a regular file: ${relativePath}`);
      }

      await fsPromises.access(absolutePath, fs.constants.R_OK);

      const stream = fs.createReadStream(absolutePath, { encoding: "utf8" });
      return { stream, size: stats.size };
    } catch (error) {
      if (error instanceof NotFoundError) throw error;

      const err = error as NodeJS.ErrnoException;
      if (err.code === "ENOENT") {
        throw new NotFoundError(`File not found: ${relativePath}`);
      }
      throw new InternalServerError(`Failed to access file: ${err.message}`);
    }
  }

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
      stream.on("error", (err) =>
        reject(
          new InternalServerError(
            `Error reading file for word count: ${err.message}`,
          ),
        ),
      );
    });
  }
}

export const storageService = new StorageService();
