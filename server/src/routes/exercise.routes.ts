import { Router } from "express";
import config from "../config/config.js";
import { exerciseController } from "../controllers/exercise.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { rateLimiter } from "../middlewares/rate-limit.middleware.js";

const strictLimiter = rateLimiter(
  config.rateLimit.strict.maxRequests,
  config.rateLimit.strict.windowMs,
  "strict",
);

const router = Router();

router.use(isAuthenticated);
router.get("/", strictLimiter, exerciseController.generateExercises);
router.post("/submit", strictLimiter, exerciseController.submitExerciseResults);

export const exerciseRoutes = router;
