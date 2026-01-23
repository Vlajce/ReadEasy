import { Router } from "express";
import { bookController } from "../controllers/book.controller.js";
import isAuthenticated from "../middlewares/auth.middleware.js";
import validateObjectId from "../middlewares/validateObjectId.middleware.js";
import { upload, handleUploadError } from "../middlewares/multer.middleware.js";

const {
  getPublicBooks,
  getPublicBookById,
  getPublicBookContent,
  uploadPrivateBook,
} = bookController;

const router = Router();

// Protect all routes in this router
router.use(isAuthenticated);

router.get("/", getPublicBooks);
router.post(
  "/private",
  upload.single("book"), // 2. Handles file upload
  handleUploadError, // 3. Catches multer errors);
  uploadPrivateBook,
);
router.get("/:id/content", validateObjectId("id"), getPublicBookContent);
router.get("/:id", validateObjectId("id"), getPublicBookById);

export const bookRoutes = router;
