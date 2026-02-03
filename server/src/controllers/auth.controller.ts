import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/user.model.js";
import { registerSchema, loginSchema } from "../validation/auth.schema.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import config from "../config/config.js";
import { ConflictError } from "../errors/conflict.error.js";
import { sendSuccess } from "../utils/response.handler.js";
import { UnauthorizedError } from "../errors/unauthorized.error.js";
import { asyncHandler } from "../utils/async.handler.js";
import { toUserDTO } from "../mappers/user.mapper.js";
import type { AuthResponseDTO } from "../types/user.dto.js";
import { isMongoDuplicateError } from "../utils/db.errors.js";

const register = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password } = registerSchema.parse(req.body);

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    return sendSuccess(
      res,
      toUserDTO(user),
      "User registered successfully",
      201,
    );
  } catch (error) {
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

const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new UnauthorizedError("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new UnauthorizedError("Invalid credentials");
  }

  const accessToken = signAccessToken(user._id.toString());
  const refreshToken = signRefreshToken(user._id.toString());

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: config.env === "production",
    sameSite: config.env === "production" ? "none" : "lax",
    path: "/auth/refresh",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return sendSuccess<AuthResponseDTO>(
    res,
    {
      accessToken,
      user: toUserDTO(user),
    },
    "Login successful",
    200,
  );
});

const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    throw new UnauthorizedError("No refresh token");
  }

  const payload = verifyRefreshToken(token);
  if (!payload || !payload.userId) {
    throw new UnauthorizedError("Invalid refresh token");
  }

  const accessToken = signAccessToken(payload.userId);
  const newRefreshToken = signRefreshToken(payload.userId);

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: config.env === "production",
    sameSite: config.env === "production" ? "none" : "lax",
    path: "/auth/refresh",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return sendSuccess(res, { accessToken }, "Token refreshed successfully", 200);
});

const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie("refreshToken", { path: "/auth/refresh" });
  return sendSuccess(res, null, "Logged out successfully", 200);
});

export const authController = { register, login, refresh, logout };
