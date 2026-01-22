import { Router } from "express";
import { bookController } from "../controllers/book.controller.js";
import isAuthenticated from "../middlewares/auth.middleware.js";
import validateObjectId from "../middlewares/validateObjectId.middleware.js";

const { getPublicBooks, getPublicBookById, getPublicBookContent } =
  bookController;

const router = Router();

// Protect all routes in this router
router.use(isAuthenticated);

router.get("/", getPublicBooks);
router.get("/:id", validateObjectId("id"), getPublicBookById);
router.get("/:id/content", validateObjectId("id"), getPublicBookContent);

export const bookRoutes = router;
