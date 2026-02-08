import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.js";
import { UnauthorizedError } from "../errors/unauthorized.error.js";
import { asyncHandler } from "../utils/async.handler.js";

export const isAuthenticated = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      throw new UnauthorizedError("Missing access token");
    }

    const payload = verifyAccessToken(accessToken);

    req.user = { userId: payload.userId };
    next();
  },
);
