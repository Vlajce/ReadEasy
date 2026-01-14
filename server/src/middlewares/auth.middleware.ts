import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.js";

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "Missing Authorization header" });

  const [type, token] = authHeader.split(" ");

  if (type !== "Bearer" || !token)
    return res.status(401).json({ message: "Invalid authorization format" });

  try {
    const payload = verifyAccessToken(token);
    req.user = { userId: payload.userId };
    return next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default isAuthenticated;
