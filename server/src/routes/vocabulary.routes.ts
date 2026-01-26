import { Router } from "express";
import { vocabularyController } from "../controllers/vocabulary.controller.js";
import isAuthenticated from "../middlewares/auth.middleware.js";
import validateObjectId from "../middlewares/validateObjectId.middleware.js";

const {
  getVocabularyEntries,
  getVocabularyEntryById,
  createVocabularyEntry,
  updateVocabularyEntry,
  deleteVocabularyEntry,
  vocabularyStats,
} = vocabularyController;

const router = Router();

router.use(isAuthenticated);

router.get("/", getVocabularyEntries);
router.post("/", createVocabularyEntry);
router.get("/stats", vocabularyStats);
router.get("/:id", validateObjectId("id"), getVocabularyEntryById);
router.put("/:id", validateObjectId("id"), updateVocabularyEntry);
router.delete("/:id", validateObjectId("id"), deleteVocabularyEntry);

export const vocabularyRoutes = router;
