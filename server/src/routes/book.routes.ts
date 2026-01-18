import { Router } from "express";
import { bookController } from "../controllers/book.controller.js";
import isAuthenticated from "../middlewares/auth.middleware.js";

const { getAllBooks, getBookById } = bookController;

const router = Router();

// Protect all routes in this router
router.use(isAuthenticated);

router.get("/", getAllBooks);
router.get("/:id", getBookById);

export const bookRoutes = router;
