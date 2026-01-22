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
    const content = await bookRepository.findPublicBookContent(id as string);

    if (!content) {
      return res.status(404).json({ message: "Book content not found" });
    }

    return res.status(200).json({ text: content });
  } catch (error) {
    console.error("Get book content error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const bookController = {
  getPublicBooks,
  getPublicBookById,
  getPublicBookContent,
};
