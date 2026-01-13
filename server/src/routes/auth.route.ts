import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";

const { register } = authController;

const router = Router();

router.post("/register", register);

export { router as authRoutes };
