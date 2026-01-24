import { Router } from "express";
import { vocabularyController } from "../controllers/vocabulary.controller.js";
import isAuthenticated from "../middlewares/auth.middleware.js";
import validateObjectId from "../middlewares/validateObjectId.middleware.js";

const {
  getVocabulary,
  getVocabularyById,
  createVocabulary,
  updateVocabulary,
  deleteVocabulary,
} = vocabularyController;

const router = Router();

router.use(isAuthenticated);

router.get("/", getVocabulary);
router.post("/", createVocabulary);
router.get("/:id", validateObjectId("id"), getVocabularyById);
router.put("/:id", validateObjectId("id"), updateVocabulary);
router.delete("/:id", validateObjectId("id"), deleteVocabulary);

export const vocabularyRoutes = router;
