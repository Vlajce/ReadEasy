import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { rateLimiter } from "../middlewares/rate-limit.middleware.js";
import config from "../config/config.js";

const { register, login, refresh, logout } = authController;
const { login: loginLimit, register: registerLimit } = config.rateLimit;

const loginLimiter = rateLimiter(
  loginLimit.maxRequests,
  loginLimit.windowMs,
  "login",
);

const registerLimiter = rateLimiter(
  registerLimit.maxRequests,
  registerLimit.windowMs,
  "register",
);

const router = Router();

router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);
router.post("/refresh", refresh);
router.post("/logout", logout);

export const authRoutes = router;
