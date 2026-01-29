import type { Request, Response, NextFunction } from "express";
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

const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password } = registerSchema.parse(req.body);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    sendSuccess(
      res,
      { id: user._id, username: user.username, email: user.email },
      "User registered successfully",
      201,
    );
  } catch (error) {
    next(error);
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
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

    sendSuccess(
      res,
      {
        accessToken,
        user: { id: user._id, username: user.username, email: user.email },
      },
      "Login successful",
      200,
    );
  } catch (error) {
    next(error);
  }
};

const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
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

    sendSuccess(res, { accessToken }, "Token refreshed successfully", 200);
  } catch (error) {
    next(error);
  }
};

const logout = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.clearCookie("refreshToken", { path: "/auth/refresh" });
    sendSuccess(res, null, "Logged out successfully", 200);
  } catch (error) {
    next(error);
  }
};

export const authController = { register, login, refresh, logout };
