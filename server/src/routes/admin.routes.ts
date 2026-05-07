import { Router } from "express";
import { isAuthenticated, isAdmin } from "../middlewares/auth.middleware.js";
import { validateObjectId } from "../middlewares/validate-object-id.middleware.js";
import { adminController } from "../controllers/admin.controller.js";

const router = Router();

router.use(isAuthenticated, isAdmin);

router.get("/users", adminController.getUsers);
router.delete("/users/:id", validateObjectId("id"), adminController.deleteUser);
router.patch("/users/:id/ban", validateObjectId("id"), adminController.banUser);
router.patch("/users/:id/unban", validateObjectId("id"), adminController.unbanUser);
router.get("/stats", adminController.getStats);

export const adminRoutes = router;
