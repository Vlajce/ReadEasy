import { Book } from "../models/book.model.js";
import { userRepository } from "../repositories/user.repository.js";
import { translationRepository } from "../repositories/translation.repository.js";
import { NotFoundError } from "../errors/not-found.error.js";
import { BadRequestError } from "../errors/bad-request.error.js";
import {
  normalizeWord,
  normalizeSentence,
  buildHashedTranslationCacheKey,
} from "../utils/normalization.js";
import { openaiService } from "./openai.service.js";
import type { AiTranslationResponse } from "../validation/vocabulary.schema.js";

interface TranslateWordInput {
  userId: string;
  word: string;
  sentence: string;
  bookId: string;
}

const translateWord = async (
  input: TranslateWordInput,
): Promise<AiTranslationResponse> => {
  const { userId, word, sentence, bookId } = input;

  const user = await userRepository.findById(userId);
  if (!user) throw new NotFoundError("User not found");

  const targetLanguage = user.nativeLanguage?.trim().toLowerCase();
  if (!targetLanguage) {
    throw new BadRequestError(
      "Native language must be set before requesting translation",
    );
  }

  const book = await Book.findById(bookId).select("language").lean().exec();
  if (!book) throw new NotFoundError("Book not found");

  const sourceLanguage = book.language.trim().toLowerCase();
  const normalizedWord = normalizeWord(word);
  const normalizedSentence = normalizeSentence(sentence);

  const cacheKey = buildHashedTranslationCacheKey({
    normalizedWord,
    normalizedSentence,
    sourceLanguage,
    targetLanguage,
  });

  const cached = await translationRepository.findByCacheKey(cacheKey);
  if (cached) {
    return {
      translation: cached.translation,
      baseForm: cached.baseForm,
      partOfSpeech: cached.partOfSpeech,
    };
  }

  const translated = await openaiService.translate({
    word: normalizedWord,
    sentence: normalizedSentence,
    sourceLanguage,
    targetLanguage,
  });

  await translationRepository.create({
    cacheKey,
    word: normalizedWord,
    translation: translated.translation.trim(),
    baseForm: normalizeWord(translated.baseForm),
    partOfSpeech: translated.partOfSpeech.trim().toLowerCase(),
    sourceLanguage,
    targetLanguage,
  });

  return translated;
};

export const translationService = { translateWord };
