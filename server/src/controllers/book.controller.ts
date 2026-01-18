import type { Request, Response } from "express";
import { Book } from "../models/book.model.js";

const getAllBooks = async (req: Request, res: Response) => {
  try {
    const books = await Book.find().select("-filepath -__v");
    return res.status(200).json(books);
  } catch (error) {
    console.error("Get books error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getBookById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id).select("-filepath -__v");
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    return res.status(200).json(book);
  } catch (error) {
    console.error("Get book error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const bookController = {
  getAllBooks,
  getBookById,
};
