import { Router } from "express";
import { vocabularyController } from "../controllers/vocabulary.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { validateObjectId } from "../middlewares/validate-object-id.middleware.js";
import config from "../config/config.js";
import { rateLimiter } from "../middlewares/rate-limit.middleware.js";

const {
  getVocabularyEntries,
  getVocabularyEntryById,
  createVocabularyEntry,
  updateVocabularyEntry,
  deleteVocabularyEntry,
  vocabularyStats,
  getBookWords,
} = vocabularyController;

const strictLimiter = rateLimiter(
  config.rateLimit.strict.maxRequests,
  config.rateLimit.strict.windowMs,
  "strict",
);

const router = Router();

router.use(isAuthenticated);

router.get("/", getVocabularyEntries);
router.post("/", strictLimiter, createVocabularyEntry);
router.get("/stats", vocabularyStats);
router.get("/books/:bookId/words", validateObjectId("bookId"), getBookWords);
router.get("/:id", validateObjectId("id"), getVocabularyEntryById);
router.put(
  "/:id",
  strictLimiter,
  validateObjectId("id"),
  updateVocabularyEntry,
);
router.delete(
  "/:id",
  strictLimiter,
  validateObjectId("id"),
  deleteVocabularyEntry,
);
export const vocabularyRoutes = router;
