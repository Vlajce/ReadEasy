import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { userController } from "../controllers/user.controller.js";

const { getCurrentUser, updateCurrentUser } = userController;

const router = Router();

// Protect all routes in this router
router.use(isAuthenticated);

router.get("/me", getCurrentUser);
router.put("/me/username", updateCurrentUser);

export { router as userRoutes };
