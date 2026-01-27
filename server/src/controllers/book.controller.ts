import path from "path";
import type { Request, Response } from "express";
import {
  findBooksQuerySchema,
  uploadMetadataSchema,
  updatePrivateBookSchema,
} from "../validation/book.schema.js";
import { bookRepository } from "../repositories/book.repository.js";

// --- ERROR HELPERS ---

// Proverava da li je greška Mongo Duplicate Key Error (code 11000)
const isDuplicateKeyError = (err: unknown): err is { code: number } => {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: unknown }).code === 11000
  );
};

// Proverava da li je greška naša custom greška (ima status i message)
const isAppError = (
  err: unknown,
): err is { status: number; message: string } => {
  return (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    typeof (err as { status: unknown }).status === "number"
  );
};

// --- CONTROLLERS ---

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
    if (isAppError(err)) {
      return res.status(err.status).json({ message: err.message });
    }
    console.error("Get book content error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const uploadMyBook = async (req: Request, res: Response) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const userId = req.user!.userId;
  const relativePath = path.join("private-books", userId, file.filename);

  try {
    // 1. Validacija Metadata Inputa
    const metadataResult = uploadMetadataSchema.safeParse(req.body);

    if (!metadataResult.success) {
      await bookRepository.deleteFile(relativePath);
      return res.status(400).json({
        message: "Invalid metadata",
        errors: metadataResult.error.flatten(),
      });
    }

    const { title, author, language } = metadataResult.data;

    // 2. Brojanje reči
    const wordCount = await bookRepository.countWordsInFile(relativePath);

    // 3. Kreiranje u bazi
    const book = await bookRepository.createPrivateBook({
      title,
      author,
      language,
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
  } catch (error: unknown) {
    // CLEANUP: Uvek brišemo fajl na grešku
    await bookRepository.deleteFile(relativePath);

    // Handling Duplikata preko Type Guard-a (nema više 'any')
    if (isDuplicateKeyError(error)) {
      return res.status(409).json({
        message:
          "Book with this title and language already exists in your library",
      });
    }

    console.error("Upload private book error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getMyBooks = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const books = await bookRepository.findPrivateBooks(userId);

    return res.status(200).json(books);
  } catch (error) {
    console.error("Get my books error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getMyBookById = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const book = await bookRepository.findPrivateBookById(id as string, userId);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    return res.status(200).json(book);
  } catch (error) {
    console.error("Get my book by id error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getMyBookContent = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const { stream, size } = await bookRepository.findPrivateBookContentById(
      id as string,
      userId,
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
    if (isAppError(err)) {
      return res.status(err.status).json({ message: err.message });
    }
    console.error("Get my book content error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateMyBookMetadata = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const parsed = updatePrivateBookSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid update payload",
        errors: parsed.error.flatten(),
      });
    }

    const updates = parsed.data;
    // ensure language lowered (zod transform already does it)

    const updated = await bookRepository.updatePrivateBookMetadata(
      id as string,
      userId,
      updates,
    );

    if (!updated) {
      return res.status(404).json({ message: "Book not found" });
    }

    return res.status(200).json({ message: "Book updated", book: updated });
  } catch (err: unknown) {
    if (isDuplicateKeyError(err)) {
      return res.status(409).json({
        message:
          "Another book with this title and language already exists in your library",
      });
    }
    console.error("Update private book metadata error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteMyBook = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const deleted = await bookRepository.deletePrivateBook(
      id as string,
      userId,
    );

    if (!deleted) {
      return res.status(404).json({ message: "Book not found" });
    }

    try {
      if (deleted.filepath) {
        await bookRepository.deleteFile(deleted.filepath);
      }
    } catch (fsErr) {
      console.error("File deletion failed after DB delete:", fsErr);
      return res.status(200).json({
        message: "Book deleted from database, but file cleanup failed",
        cleanupFailed: true,
      });
    }

    return res.status(200).json({ message: "Book deleted successfully" });
  } catch (err) {
    console.error("Delete private book error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const bookController = {
  getPublicBooks,
  getPublicBookById,
  getPublicBookContent,
  uploadMyBook,
  getMyBooks,
  getMyBookById,
  getMyBookContent,
  updateMyBookMetadata,
  deleteMyBook,
};
