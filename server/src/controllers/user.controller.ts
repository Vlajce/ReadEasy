import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async.handler.js";
import { userRepository } from "../repositories/user.repository.js";
import { updateUserSchema } from "../validation/user.schema.js";
import { sendSuccess } from "../utils/response.handler.js";
import { NotFoundError } from "../errors/not.found.error.js";
import { ConflictError } from "../errors/conflict.error.js";
import { toUserDTO } from "../mappers/user.mapper.js";

const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return sendSuccess(res, toUserDTO(user), "User fetched successfully", 200);
});

const updateCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const updateData = updateUserSchema.parse(req.body);

  if (updateData.email) {
    const existingUser = await userRepository.findByEmail(updateData.email);
    if (existingUser && existingUser._id.toString() !== userId) {
      throw new ConflictError("Email already in use");
    }
  }

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
});

export const userController = { getCurrentUser, updateCurrentUser };
