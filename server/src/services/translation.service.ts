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
import { AiServiceError } from "../errors/ai-service.error.js";
import {
  aiTranslationResponseSchema,
  type AiTranslationResponse,
} from "../validation/vocabulary.schema.js";
import type OpenAI from "openai";

interface TranslateWordInput {
  userId: string;
  word: string;
  sentence: string;
  bookId: string;
}

const buildTranslationMessages = (input: {
  word: string;
  sentence: string;
  sourceLanguage: string;
  targetLanguage: string;
}): OpenAI.Chat.ChatCompletionMessageParam[] => {
  const { word, sentence, sourceLanguage, targetLanguage } = input;

  const focusRule = `- translate ONLY the exact expression "${word}" — nothing more, nothing less
- the output translation must correspond only to "${word}", not to any other words in the sentence
- the sentence exists only to clarify the meaning and context of "${word}"`;

  return [
    {
      role: "system",
      content:
        "You are a translation API. You respond only with valid JSON. Never include explanations, markdown, or any text outside the JSON object.",
    },
    {
      role: "user",
      content: `The user is reading a text in ${sourceLanguage} and selected the word "${word}" in this sentence:
"${sentence}"

Translate and analyze this word for a ${targetLanguage} speaker.

Respond ONLY with a valid JSON object in exactly this format:
{
  "translation": "the translation of the word in ${targetLanguage}",
  "baseForm": "the base/dictionary form of the word in ${sourceLanguage} — MUST be in ${sourceLanguage}, never translated into ${targetLanguage}",
  "partOfSpeech": "noun | verb | adjective | adverb | pronoun | preposition | conjunction | interjection | other",
  "exampleSentence": "a short natural sentence in ${sourceLanguage} using the word (max 12 words)"
}

Rules:
- translation: translate the word as it would naturally appear in a fluent ${targetLanguage} sentence
  - consider the full sentence context to determine the most natural form
  - avoid unnatural literal translations — prioritize how a native ${targetLanguage} speaker would naturally express this word
${focusRule}
- baseForm: the lemma/infinitive of the word in ${sourceLanguage}
  - MUST always be in ${sourceLanguage}, never in ${targetLanguage}
  - for verbs: use infinitive
  - for nouns: use nominative singular
  - for adjectives: use base form
- partOfSpeech: based on how the word is used in this specific sentence
- If partOfSpeech is unclear, use "other"
- exampleSentence: write a short, natural sentence in ${sourceLanguage} that clearly demonstrates the meaning of "${word}"
  - maximum 12 words
  - must sound like something a native speaker would say
  - do NOT translate it — it must be in ${sourceLanguage} only`,
    },
  ];
};

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
      exampleSentence: cached.exampleSentence,
    };
  }

  const messages = buildTranslationMessages({
    word: normalizedWord,
    sentence: normalizedSentence,
    sourceLanguage,
    targetLanguage,
  });
  const raw = await openaiService.callWithRetry(messages, 500);

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new AiServiceError("OpenAI returned invalid JSON for translation");
  }

  const result = aiTranslationResponseSchema.safeParse(parsed);
  if (!result.success) {
    throw new AiServiceError("OpenAI translation response failed validation");
  }

  const translated = result.data;

  await translationRepository.create({
    cacheKey,
    word: normalizedWord,
    translation: translated.translation.trim(),
    baseForm: normalizeWord(translated.baseForm),
    partOfSpeech: translated.partOfSpeech.trim().toLowerCase(),
    exampleSentence: translated.exampleSentence.trim(),
    sourceLanguage,
    targetLanguage,
  });

  return translated;
};

export const translationService = { translateWord };
