import { Router } from "express";
import { bookController } from "../controllers/book.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { validateObjectId } from "../middlewares/validate-object-id.middleware.js";
import {
  uploadPrivateBook,
  handleUploadError,
} from "../middlewares/multer.middleware.js";
import config from "../config/config.js";
import { rateLimiter } from "../middlewares/rate-limit.middleware.js";

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
  getBooksLanguages,
} = bookController;

const strictLimiter = rateLimiter(
  config.rateLimit.strict.maxRequests,
  config.rateLimit.strict.windowMs,
  "strict",
);

const router = Router();

router.use(isAuthenticated);

// Specific routes FIRST
router.get("/", getPublicBooks);
router.get("/languages", getBooksLanguages);
router.get("/my", getMyBooks);
router.get("/my/:id/content", validateObjectId("id"), getMyBookContent);
router.get("/my/:id", validateObjectId("id"), getMyBookById);
router.patch(
  "/my/:id",
  strictLimiter,
  validateObjectId("id"),
  updateMyBookMetadata,
);
router.delete("/my/:id", strictLimiter, validateObjectId("id"), deleteMyBook);
router.post(
  "/private",
  strictLimiter,
  uploadPrivateBook.single("book"),
  handleUploadError,
  uploadMyBook,
);

// Parameterized routes AFTER
router.get("/:id/content", validateObjectId("id"), getPublicBookContent);
router.get("/:id", validateObjectId("id"), getPublicBookById);
export const bookRoutes = router;
