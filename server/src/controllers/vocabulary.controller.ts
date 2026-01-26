import type { Request, Response } from "express";
import { vocabularyRepository } from "../repositories/vocabulary.repository.js";
import {
  createVocabularySchema,
  updateVocabularySchema,
  findVocabularyQuerySchema,
} from "../validation/vocabulary.schema.js";
import type { VocabularyStats } from "../types/vocabulary.types.js";

const getVocabularyEntries = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const queryParsed = findVocabularyQuerySchema.safeParse(req.query);

    if (!queryParsed.success) {
      return res.status(400).json({
        message: "Invalid query parameters",
        errors: queryParsed.error.flatten(),
      });
    }

    const result = await vocabularyRepository.findEntries(
      userId,
      queryParsed.data,
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get vocabulary error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getVocabularyEntryById = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const entry = await vocabularyRepository.findEntryById(
      id as string,
      userId,
    );

    if (!entry) {
      return res.status(404).json({ message: "Vocabulary entry not found" });
    }

    return res.status(200).json(entry);
  } catch (error) {
    console.error("Get vocabulary by id error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const createVocabularyEntry = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const parsed = createVocabularySchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid request body",
        errors: parsed.error.flatten(),
      });
    }

    const entry = await vocabularyRepository.createEntry(userId, parsed.data);

    return res.status(201).json(entry);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: unknown }).code === 11000
    ) {
      return res.status(409).json({ message: "Word already exists" });
    }
    console.error("Create vocabulary error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateVocabularyEntry = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const parsed = updateVocabularySchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid input",
        errors: parsed.error.flatten(),
      });
    }

    const updated = await vocabularyRepository.updateEntry(
      id as string,
      userId,
      parsed.data,
    );

    if (!updated) {
      return res.status(404).json({ message: "Vocabulary entry not found" });
    }

    return res.status(200).json(updated);
  } catch (error) {
    console.error("Update vocabulary error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteVocabularyEntry = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const deleted = await vocabularyRepository.deleteEntry(
      id as string,
      userId,
    );

    if (!deleted) {
      return res.status(404).json({ message: "Vocabulary entry not found" });
    }

    return res.status(204).send();
  } catch (error) {
    console.error("Delete vocabulary error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const vocabularyStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const stats: VocabularyStats =
      await vocabularyRepository.getVocabularyStats(userId!);

    return res.status(200).json(stats);
  } catch (error) {
    console.error("Get vocabulary stats error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const vocabularyController = {
  getVocabularyEntries,
  getVocabularyEntryById,
  createVocabularyEntry,
  updateVocabularyEntry,
  deleteVocabularyEntry,
  vocabularyStats,
};
