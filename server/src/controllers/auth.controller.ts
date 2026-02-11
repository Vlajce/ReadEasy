import type { CookieOptions, Request, Response } from "express";
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
import type { UserDTO } from "../types/user.dto.js";
import { isMongoDuplicateError } from "../utils/db.errors.js";
import { BadRequestError } from "../errors/bad-request.error.js";

const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: config.env === "production" ? true : false,
  sameSite: config.env === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

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
  const cookies = req.cookies;
  const { email, password } = loginSchema.parse(req.body);

  const foundUser = await User.findOne({ email })
    .select("+password +refreshToken")
    .exec();
  if (!foundUser) {
    throw new BadRequestError("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, foundUser.password);
  if (!isMatch) {
    throw new BadRequestError("Invalid email or password");
  }

  const accessToken = signAccessToken(foundUser._id.toString());
  const newRefreshToken = signRefreshToken(foundUser._id.toString());

  let newRefreshTokenArray = !cookies.refreshToken
    ? foundUser.refreshToken
    : foundUser.refreshToken.filter((rt) => rt !== cookies.refreshToken);

  if (cookies.refreshToken) {
    const refreshToken = cookies.refreshToken as string;

    const foundToken = await User.findOne({ refreshToken }).exec();
    if (!foundToken) {
      newRefreshTokenArray = [];
    }
  }

  foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
  await foundUser.save();

  res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS);
  res.cookie("accessToken", accessToken, COOKIE_OPTIONS);

  return sendSuccess<UserDTO>(
    res,
    toUserDTO(foundUser),
    "Login successful",
    200,
  );
});

const refresh = asyncHandler(async (req: Request, res: Response) => {
  const cookies = req.cookies;
  if (!cookies?.refreshToken) {
    throw new UnauthorizedError("No refresh token provided");
  }

  const refreshToken = cookies.refreshToken as string;

  // clear cookie immediately; will set a new one if refresh succeeds
  res.clearCookie("refreshToken", COOKIE_OPTIONS);
  res.clearCookie("accessToken", COOKIE_OPTIONS);

  const foundUser = await User.findOne({ refreshToken })
    .select("+refreshToken")
    .exec();

  // Token not in DB => possible reuse
  if (!foundUser) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      // revoke all tokens for that userId
      const hackedUser = await User.findById(decoded.userId)
        .select("+refreshToken")
        .exec();
      if (hackedUser) {
        hackedUser.refreshToken = [];
        await hackedUser.save();
      }
    } catch {
      console.log("⚠️ Invalid or expired refresh token during reuse detection");
    }
    throw new UnauthorizedError("Invalid or expired refresh token");
  }

  // remove current token for rotation
  const newRefreshTokenArray = foundUser.refreshToken.filter(
    (rt) => rt !== refreshToken,
  );

  try {
    const decoded = verifyRefreshToken(refreshToken);

    if (decoded.userId !== foundUser._id.toString()) {
      // mismatch -> remove token and forbid
      foundUser.refreshToken = [...newRefreshTokenArray];
      await foundUser.save();
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    // valid -> issue new tokens
    const accessToken = signAccessToken(decoded.userId);
    const newRefreshToken = signRefreshToken(decoded.userId);

    foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
    await foundUser.save();

    res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS);
    res.cookie("accessToken", accessToken, COOKIE_OPTIONS);

    return sendSuccess(res, null, "Token refreshed successfully", 200);
  } catch {
    // expired/invalid -> remove token from DB and forbid
    foundUser.refreshToken = [...newRefreshTokenArray];
    await foundUser.save();
    throw new UnauthorizedError("Invalid or expired refresh token");
  }
});

const logout = asyncHandler(async (req: Request, res: Response) => {
  const cookies = req.cookies;
  if (!cookies?.refreshToken) {
    return sendSuccess(res, null, "Logged out successfully", 204);
  }
  const refreshToken = cookies.refreshToken;

  res.clearCookie("refreshToken", COOKIE_OPTIONS);
  res.clearCookie("accessToken", COOKIE_OPTIONS);
  // Is refresh token in DB?
  const foundUser = await User.findOne({ refreshToken })
    .select("+refreshToken")
    .exec();

  if (foundUser) {
    // Delete refresh token in DB
    foundUser.refreshToken = foundUser.refreshToken.filter(
      (rt) => rt !== refreshToken,
    );
    await foundUser.save();
  }

  return sendSuccess(res, null, "Logged out successfully", 200);
});

export const authController = { register, login, refresh, logout };
