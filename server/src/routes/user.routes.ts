import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { userController } from "../controllers/user.controller.js";
import { rateLimiter } from "../middlewares/rate-limit.middleware.js";
import config from "../config/config.js";

const {
  getCurrentUser,
  updateCurrentUser,
  addToReadingList,
  getReadingList,
  removeFromReadingList,
} = userController;

const strictLimiter = rateLimiter(
  config.rateLimit.strict.maxRequests,
  config.rateLimit.strict.windowMs,
  "strict",
);

const router = Router();

router.get("/me", getCurrentUser);

router.use(isAuthenticated);

router.put("/me", strictLimiter, updateCurrentUser);

router.get("/me/reading-list", getReadingList);
router.post("/me/reading-list/:bookId", addToReadingList);
router.delete("/me/reading-list/:bookId", removeFromReadingList);

export const userRoutes = router;
