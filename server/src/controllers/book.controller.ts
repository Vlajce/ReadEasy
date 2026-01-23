import path from "path";
import type { Request, Response } from "express";
import { findBooksQuerySchema } from "../validation/book.schema.js";
import { bookRepository } from "../repositories/book.repository.js";

const getPublicBooks = async (req: Request, res: Response) => {
  try {
    const queryParsed = findBooksQuerySchema.safeParse(req.query);
    if (!queryParsed.success) {
      return res.status(400).json({
        message: "Invalid query parameters",
        errors: queryParsed.error.flatten(),
      });
    }
    const result = await bookRepository.findPublicBooks(queryParsed.data);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get books error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getPublicBookById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // mozemo ovo da uradimo jer vec imamo middleware koji validira id
    const book = await bookRepository.findPublicBookById(id as string);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    return res.status(200).json(book);
  } catch (error) {
    console.error("Get book error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getPublicBookContent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { stream, size } = await bookRepository.findPublicBookContentById(
      id as string,
    );

    res.type("text/plain; charset=utf-8");
    res.setHeader("Content-Length", String(size));

    stream.pipe(res);

    stream.on("error", (err) => {
      console.error("Stream error:", err);
      if (!res.headersSent) {
        res.status(500).json({ message: "Could not read book content" });
      } else {
        res.end();
      }
    });
  } catch (err: unknown) {
    if (isRepoError(err)) {
      return res.status(err.status).json({ message: err.message });
    }
    console.error("Get book content error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const uploadPrivateBook = async (req: Request, res: Response) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const userId = req.user!.userId;

  try {
    const wordCount = await bookRepository.countWordsInFile(file.path);

    const relativePath = path.join("private-books", userId, file.filename);

    const { title, author, language } = req.body;

    if (!title || !author || !language) {
      await bookRepository.deleteFile(file.path);
      return res
        .status(400)
        .json({ message: "Missing required book metadata" });
    }

    const book = await bookRepository.createPrivateBook({
      title: String(title).trim().slice(0, 255),
      author: String(author).trim().slice(0, 100),
      language: String(language).trim().toLowerCase().slice(0, 2),
      filepath: relativePath,
      wordCount,
      ownerId: userId,
    });

    return res.status(201).json({
      message: "Private book uploaded successfully",
      book: {
        id: book._id,
        title: book.title,
        author: book.author,
        language: book.language,
        wordCount: book.wordCount,
        createdAt: book.createdAt,
      },
    });
  } catch (error) {
    await bookRepository.deleteFile(file.path);
    console.error("Upload private book error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const isRepoError = (e: unknown): e is { status: number; message?: string } => {
  if (typeof e !== "object" || e === null) return false;
  const r = e as Record<string, unknown>;
  return typeof r.status === "number";
};

export const bookController = {
  getPublicBooks,
  getPublicBookById,
  getPublicBookContent,
  uploadPrivateBook,
};
