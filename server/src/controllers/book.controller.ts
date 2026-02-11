import path from "path";
import type { Request, Response } from "express";
import {
  findBooksQuerySchema,
  uploadMetadataSchema,
  updatePrivateBookSchema,
} from "../validation/book.schema.js";
import { bookRepository } from "../repositories/book.repository.js";
import { asyncHandler } from "../utils/async.handler.js";
import { toBookDetailDTO, toBookListDTO } from "../mappers/book.mapper.js";
import { sendError, sendSuccess } from "../utils/response.handler.js";
import type { PaginatedBooksDTO } from "../types/book.dto.js";
import { NotFoundError } from "../errors/not-found.error.js";
import { BadRequestError } from "../errors/bad-request.error.js";
import { isMongoDuplicateError } from "../utils/db.errors.js";
import { ConflictError } from "../errors/conflict.error.js";
import { ErrorCodes } from "../utils/error.codes.js";

const getPublicBooks = asyncHandler(async (req: Request, res: Response) => {
  const query = findBooksQuerySchema.parse(req.query);
  const result = await bookRepository.findPublicBooks(query);

  const paginatedDTO: PaginatedBooksDTO = {
    data: result.data.map(toBookListDTO),
    meta: result.meta,
  };

  return sendSuccess<PaginatedBooksDTO>(
    res,
    paginatedDTO,
    "Public books retrieved successfully",
    200,
  );
});

const getPublicBookById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const book = await bookRepository.findPublicBookById(id as string);

  if (!book) {
    throw new NotFoundError("Book not found");
  }

  return sendSuccess(
    res,
    toBookDetailDTO(book),
    "Book retrieved successfully",
    200,
  );
});

const getPublicBookContent = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await bookRepository.findPublicBookContentById(id as string);

    if (!result) {
      throw new NotFoundError("Book content not found");
    }

    const { stream, size } = result;

    res.type("text/plain; charset=utf-8");
    res.setHeader("Content-Length", String(size));
    stream.pipe(res);

    stream.on("error", (error) => {
      console.error("Stream error:", error);
      if (!res.headersSent) {
        return sendError(
          res,
          "Could not read book content",
          ErrorCodes.SYS_INTERNAL_ERROR,
          500,
        );
      } else {
        res.end();
      }
    });
  },
);

const uploadMyBook = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file;

  if (!file) {
    throw new BadRequestError("No file uploaded");
  }

  const userId = req.user!.userId;
  const relativePath = path.join("private-books", userId, file.filename);

  const metadata = uploadMetadataSchema.parse(req.body);

  const wordCount = await bookRepository.countWordsInFile(relativePath);

  try {
    const book = await bookRepository.createPrivateBook({
      ...metadata,
      filepath: relativePath,
      wordCount,
      ownerId: userId,
    });

    return sendSuccess(
      res,
      toBookDetailDTO(book),
      "Private book uploaded successfully",
      201,
    );
  } catch (error) {
    await bookRepository.deleteFile(relativePath).catch((cleanupError) => {
      console.error(
        "Failed to cleanup uploaded file after error:",
        cleanupError,
      );
    });

    if (isMongoDuplicateError(error)) {
      throw new ConflictError(
        "Book with this title and language already exists in your library",
      );
    }

    throw error;
  }
});

const getMyBooks = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const query = findBooksQuerySchema.parse(req.query);

  const result = await bookRepository.findPrivateBooks(userId, query);

  const paginatedDTO: PaginatedBooksDTO = {
    data: result.data.map(toBookListDTO),
    meta: result.meta,
  };

  return sendSuccess<PaginatedBooksDTO>(
    res,
    paginatedDTO,
    "Private books retrieved successfully",
    200,
  );
});

const getMyBookById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const book = await bookRepository.findPrivateBookById(id as string, userId);
  if (!book) {
    throw new NotFoundError("Book not found");
  }

  return sendSuccess(
    res,
    toBookDetailDTO(book),
    "Book retrieved successfully",
    200,
  );
});

const getMyBookContent = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const result = await bookRepository.findPrivateBookContentById(
    id as string,
    userId,
  );

  if (!result) {
    throw new NotFoundError("Book content not found");
  }

  const { stream, size } = result;

  res.type("text/plain; charset=utf-8");
  res.setHeader("Content-Length", String(size));
  stream.pipe(res);

  stream.on("error", (error) => {
    console.error("Stream error:", error);
    if (!res.headersSent) {
      return sendError(
        res,
        "Could not read book content",
        ErrorCodes.SYS_INTERNAL_ERROR,
        500,
      );
    } else {
      res.end();
    }
  });
});

const updateMyBookMetadata = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;

    const updates = updatePrivateBookSchema.parse(req.body);

    try {
      const updated = await bookRepository.updatePrivateBookMetadata(
        id as string,
        userId,
        updates,
      );

      if (!updated) {
        throw new NotFoundError("Book not found");
      }

      return sendSuccess(
        res,
        toBookDetailDTO(updated),
        "Book updated successfully",
        200,
      );
    } catch (error) {
      if (isMongoDuplicateError(error)) {
        throw new ConflictError(
          "Another book with this title and language already exists in your library",
        );
      }
      throw error;
    }
  },
);

const deleteMyBook = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const deleted = await bookRepository.deletePrivateBook(id as string, userId);

  if (!deleted) {
    throw new NotFoundError("Book not found");
  }

  try {
    if (deleted.filepath) {
      await bookRepository.deleteFile(deleted.filepath);
    }
  } catch (fsError) {
    console.error("File deletion failed after DB delete:", fsError);
  }

  return sendSuccess(res, null, "Book deleted successfully", 200);
});

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
