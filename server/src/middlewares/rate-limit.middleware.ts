import type { Request, Response, NextFunction } from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import config from "../config/config.js";

const formatRetryAfter = (seconds: number): string => {
  const mins = Math.max(1, Math.ceil((seconds || 0) / 60));
  return `${mins} minute${mins === 1 ? "" : "s"}`;
};

export const rateLimiter = (
  maxRequests: number,
  windowMs: number,
  actionKey = "global",
) =>
  rateLimit({
    windowMs,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => !config.rateLimit.enabled,

    keyGenerator: (req: Request): string => {
      if (req.user?.userId) return `${actionKey}:user:${req.user.userId}`;

      if (!req.ip) {
        return `${actionKey}:ip:${req.socket.remoteAddress}`;
      }

      return `${actionKey}:ip:${ipKeyGenerator(req.ip)}`;
    },

    handler: (req: Request, res: Response, _next: NextFunction, options) => {
      const retryAfterSec = res.getHeader("Retry-After")
        ? parseInt(res.getHeader("Retry-After") as string, 10)
        : null;

      res.status(options.statusCode).json({
        error: "Rate limit exceeded",
        message: retryAfterSec
          ? `Too many requests. Please try again in ${formatRetryAfter(retryAfterSec)}.`
          : "Too many requests, please try again later.",
        retryAfter: retryAfterSec,
        type: actionKey,
      });
    },
  });

export const globalLimiter = rateLimiter(
  config.rateLimit.global.maxRequests,
  config.rateLimit.global.windowMs,
  "global",
);
