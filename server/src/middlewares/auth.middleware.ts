import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.js";
import { UnauthorizedError } from "../errors/unauthorized.error.js";

export const isAuthenticated = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next(new UnauthorizedError("Missing Authorization header"));
  }

  const parts = authHeader.trim().split(/\s+/);
  const type = parts[0];
  const token = parts[1];
  if (type?.toLowerCase() !== "bearer" || !token) {
    return next(new UnauthorizedError("Invalid authorization format"));
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { userId: payload.userId };
    return next();
  } catch {
    return next(new UnauthorizedError("Invalid or expired token"));
  }
};
