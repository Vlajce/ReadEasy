import { Router } from "express";
import { bookController } from "../controllers/book.controller.js";
import isAuthenticated from "../middlewares/auth.middleware.js";
import validateObjectId from "../middlewares/validateObjectId.middleware.js";
import {
  uploadPrivateBook,
  handleUploadError,
} from "../middlewares/multer.middleware.js";

const {
  getPublicBooks,
  getPublicBookById,
  getPublicBookContent,
  uploadMyBook,
  getMyBooks,
  getMyBookById,
  getMyBookContent,
  updateMyBookMetadata,
  deleteMyBook,
} = bookController;

const router = Router();

router.use(isAuthenticated);

// Specific routes FIRST
router.get("/", getPublicBooks);
router.get("/my", getMyBooks);
router.get("/my/:id/content", validateObjectId("id"), getMyBookContent);
router.get("/my/:id", validateObjectId("id"), getMyBookById);
router.patch("/my/:id", validateObjectId("id"), updateMyBookMetadata);
router.delete("/my/:id", validateObjectId("id"), deleteMyBook);
router.post(
  "/private",
  uploadPrivateBook.single("book"),
  handleUploadError,
  uploadMyBook,
);

// Parameterized routes AFTER
router.get("/:id/content", validateObjectId("id"), getPublicBookContent);
router.get("/:id", validateObjectId("id"), getPublicBookById);

export const bookRoutes = router;
