import { Router } from "express";
import config from "../config/config.js";
import { translationController } from "../controllers/translation.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { rateLimiter } from "../middlewares/rate-limit.middleware.js";

const strictLimiter = rateLimiter(
  config.rateLimit.strict.maxRequests,
  config.rateLimit.strict.windowMs,
  "strict",
);

const router = Router();

router.use(isAuthenticated);
router.post("/", strictLimiter, translationController.translate);

export const translationRoutes = router;
