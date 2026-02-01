import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";

const { register, login, refresh, logout } = authController;

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);

export const authRoutes = router;
