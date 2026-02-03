import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.js";
import { UnauthorizedError } from "../errors/unauthorized.error.js";
import { asyncHandler } from "../utils/async.handler.js";

export const isAuthenticated = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError("Missing Authorization header");
    }

    const [type, token] = authHeader.trim().split(/\s+/);

    if (type?.toLowerCase() !== "bearer" || !token) {
      throw new UnauthorizedError("Invalid authorization format");
    }

    const payload = verifyAccessToken(token);

    req.user = { userId: payload.userId };
    next();
  },
);
