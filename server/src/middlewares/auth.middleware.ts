import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.js";
import { UnauthorizedError } from "../errors/unauthorized.error.js";
import { ForbiddenError } from "../errors/forbidden.error.js";
import { asyncHandler } from "../utils/async.handler.js";
import { User } from "../models/user.model.js";

export const isAuthenticated = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      throw new UnauthorizedError("Missing access token");
    }

    const payload = verifyAccessToken(accessToken);

    const user = await User.findById(payload.userId)
      .select("role isBanned")
      .exec();
    if (!user) throw new UnauthorizedError("User not found");
    if (user.isBanned) throw new ForbiddenError("Your account has been banned");

    req.user = { userId: payload.userId, role: user.role };
    next();
  },
);

export const isAdmin = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    if (req.user?.role !== "admin") {
      throw new ForbiddenError("Admin access required");
    }
    next();
  },
);
