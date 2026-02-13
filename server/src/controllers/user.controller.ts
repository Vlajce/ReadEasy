import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async.handler.js";
import { userRepository } from "../repositories/user.repository.js";
import { updateUserSchema } from "../validation/user.schema.js";
import { sendSuccess } from "../utils/response.handler.js";
import { NotFoundError } from "../errors/not-found.error.js";
import { ConflictError } from "../errors/conflict.error.js";
import { toUserDTO } from "../mappers/user.mapper.js";
import { isMongoDuplicateError } from "../utils/db.errors.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { bookRepository } from "../repositories/book.repository.js";

const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    return sendSuccess(res, null, "No user authenticated", 200);
  }

  const payload = verifyAccessToken(accessToken);

  const user = await userRepository.findById(payload.userId);

  if (!user) {
    return sendSuccess(res, null, "No user authenticated", 200);
  }

  return sendSuccess(res, toUserDTO(user), "User retrieved successfully", 200);
});

const updateCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const updateData = updateUserSchema.parse(req.body);

  if (updateData.email) {
    const existingUser = await userRepository.findByEmail(updateData.email);
    if (existingUser && existingUser._id.toString() !== userId) {
      throw new ConflictError("User with this email already exists");
    }
  }

  if (updateData.username) {
    const existingUser = await userRepository.findByUsername(
      updateData.username,
    );
    if (existingUser && existingUser._id.toString() !== userId) {
      throw new ConflictError("User with this username already exists");
    }
  }
  try {
    const updatedUser = await userRepository.update(userId, updateData);

    if (!updatedUser) {
      throw new NotFoundError("User not found");
    }

    return sendSuccess(
      res,
      toUserDTO(updatedUser),
      "Profile updated successfully",
      200,
    );
  } catch (error: unknown) {
    if (isMongoDuplicateError(error)) {
      const field = Object.keys(error.keyPattern)[0] || "unknown";

      const messages: Record<string, string> = {
        email: "User with this email already exists",
        username: "User with this username already exists",
      };

      throw new ConflictError(
        messages[field] || "User with this information already exists",
      );
    }
    throw error;
  }
});

const getReadingList = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const readingList = await userRepository.getReadingList(userId);

  return sendSuccess(res, readingList, "Reading list retrieved", 200);
});

const addToReadingList = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { bookId } = req.params;

  let book = await bookRepository.findPublicBookById(bookId as string);
  if (!book) {
    book = await bookRepository.findPrivateBookById(bookId as string, userId);
  }
  if (!book) {
    throw new NotFoundError("Book not found");
  }

  const updatedBookIds = await userRepository.addBookToReadingList(
    userId,
    bookId as string,
  );

  return sendSuccess(res, updatedBookIds, "Reading list updated", 200);
});

const removeFromReadingList = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { bookId } = req.params;

    let book = await bookRepository.findPublicBookById(bookId as string);
    if (!book) {
      book = await bookRepository.findPrivateBookById(bookId as string, userId);
    }
    if (!book) {
      throw new NotFoundError("Book not found");
    }

    const updatedBookIds = await userRepository.removeBookFromReadingList(
      userId,
      bookId as string,
    );

    return sendSuccess(res, updatedBookIds, "Reading list updated", 200);
  },
);

export const userController = {
  getCurrentUser,
  updateCurrentUser,
  getReadingList,
  addToReadingList,
  removeFromReadingList,
};
