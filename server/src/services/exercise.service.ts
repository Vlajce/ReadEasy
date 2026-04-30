// services/exercise.service.ts
import { userRepository } from "../repositories/user.repository.js";
import { vocabularyRepository } from "../repositories/vocabulary.repository.js";
import { openaiService } from "./openai.service.js";
import { AiServiceError } from "../errors/ai-service.error.js";
import { NotFoundError } from "../errors/not-found.error.js";
import { BadRequestError } from "../errors/bad-request.error.js";
import {
  aiExerciseResponseSchema,
  type ClientExercise,
  type GenerateExercisesQueryInput,
  type SubmitExercisesInput,
} from "../validation/exercise.schema.js";
import type { IVocabularyEntry } from "../models/vocabulary.model.js";
import type OpenAI from "openai";
import { vocabularyService } from "./vocabulary.service.js";

const EXERCISE_TYPES = [
  "fill_blank",
  "multiple_choice_translation",
  "multiple_choice_fill_blank",
] as const;

type ExerciseType = (typeof EXERCISE_TYPES)[number];

// ─── Prompt Builder ───────────────────────────────────────────────────────────

const buildExerciseMessages = (
  words: Array<{ index: number; entry: IVocabularyEntry; type: ExerciseType }>,
  sourceLanguage: string,
  targetLanguage: string,
): OpenAI.Chat.ChatCompletionMessageParam[] => {
  const wordList = words
    .map(
      ({ index, entry, type }) =>
        `[${index}] word: "${entry.word}", baseForm: "${entry.baseForm}", translation: "${entry.translation}", partOfSpeech: "${entry.partOfSpeech}"\n    exercise type: ${type}`,
    )
    .join("\n\n");

  const jsonFormat = `{
  "exercises": [
    // fill_blank example:
    {
      "index": 0,
      "type": "fill_blank",
      "sentence": "Short sentence in ${sourceLanguage} with _____ replacing the word",
      "answer": "the correct word in ${sourceLanguage}"
    },
    // multiple_choice_translation example:
    {
      "index": 1,
      "type": "multiple_choice_translation",
      "word": "the word in ${sourceLanguage}",
      "options": ["correct translation in ${targetLanguage}", "distractor 1", "distractor 2", "distractor 3"],
      "answer": "correct translation in ${targetLanguage}"
    },
    // multiple_choice_fill_blank example:
    {
      "index": 2,
      "type": "multiple_choice_fill_blank",
      "sentence": "Short sentence in ${sourceLanguage} with _____ replacing the word",
      "options": ["correct word in ${sourceLanguage}", "distractor 1", "distractor 2", "distractor 3"],
      "answer": "correct word in ${sourceLanguage}"
    }
  ]
}`;

  return [
    {
      role: "system",
      content:
        "You are a language exercise generation API. You respond only with valid JSON. Never include explanations, markdown, or any text outside the JSON object.",
    },
    {
      role: "user",
      content: `Generate language learning exercises for a ${targetLanguage} speaker learning ${sourceLanguage}.

Words:
${wordList}

Rules:
- For fill_blank and multiple_choice_fill_blank: generate a SHORT, natural sentence (max 10 words) in ${sourceLanguage} using the word. Replace the word with "_____".
- For multiple_choice_translation: "word" must be in ${sourceLanguage}, all options must be in ${targetLanguage}.
- For multiple_choice_fill_blank: all options must be in ${sourceLanguage}.
- Distractors must be plausible — same part of speech, similar difficulty. Never use the correct answer as a distractor.
- The correct answer MUST appear in the options array exactly once.
- Keep the index from the input for each exercise.
- Respond ONLY with a valid JSON object in exactly this format:

${jsonFormat}`,
    },
  ];
};

// ─── Response Parser ──────────────────────────────────────────────────────────

const parseExerciseResponse = (
  raw: string,
  words: Array<{ index: number; entry: IVocabularyEntry; type: ExerciseType }>,
): ClientExercise[] => {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new AiServiceError("OpenAI returned invalid JSON for exercises");
  }

  const result = aiExerciseResponseSchema.safeParse(parsed);

  if (!result.success) {
    throw new AiServiceError("OpenAI exercise response failed validation");
  }

  const indexToEntry = new Map(words.map(({ index, entry }) => [index, entry]));

  return result.data.exercises.map((exercise) => {
    const entry = indexToEntry.get(exercise.index);

    if (!entry) {
      throw new AiServiceError(
        `OpenAI returned unknown exercise index: ${exercise.index}`,
      );
    }

    const entryId = entry._id.toString();

    if (exercise.type === "fill_blank") {
      return {
        entryId,
        type: "fill_blank" as const,
        sentence: exercise.sentence,
        answer: exercise.answer,
      };
    }

    if (exercise.type === "multiple_choice_translation") {
      return {
        entryId,
        type: "multiple_choice_translation" as const,
        word: exercise.word,
        options: exercise.options,
        answer: exercise.answer,
      };
    }

    return {
      entryId,
      type: "multiple_choice_fill_blank" as const,
      sentence: exercise.sentence,
      options: exercise.options,
      answer: exercise.answer,
    };
  });
};

// ─── Type Assignment ──────────────────────────────────────────────────────────

const assignExerciseTypes = (
  words: IVocabularyEntry[],
  types: ExerciseType[],
): Array<{ index: number; entry: IVocabularyEntry; type: ExerciseType }> => {
  return words.map((entry, index) => ({
    index,
    entry,
    type: types[index % types.length]!,
  }));
};

// ─── Generate ─────────────────────────────────────────────────────────────────

const generateExercises = async (
  userId: string,
  input: GenerateExercisesQueryInput,
): Promise<ClientExercise[]> => {
  const { language, count, types, mode } = input;

  const user = await userRepository.findById(userId);
  if (!user) throw new NotFoundError("User not found");

  const targetLanguage = user.nativeLanguage?.trim().toLowerCase();
  if (!targetLanguage) {
    throw new BadRequestError(
      "Native language must be set before generating exercises",
    );
  }

  const words = await vocabularyRepository.getWordsForExercises(
    userId,
    language,
    mode,
    count,
  );

  if (words.length < 3) {
    throw new BadRequestError(
      "At least 3 vocabulary words are required to generate exercises",
    );
  }

  const assigned = assignExerciseTypes(words, types as ExerciseType[]);
  const messages = buildExerciseMessages(assigned, language, targetLanguage);
  const raw = await openaiService.callWithRetry(messages, 2000);

  return parseExerciseResponse(raw, assigned);
};

// ─── Submit ───────────────────────────────────────────────────────────────────

const submitExercises = async (
  userId: string,
  input: SubmitExercisesInput,
): Promise<void> => {
  const latestByEntryId = new Map<string, boolean>();
  for (const item of input.results) {
    latestByEntryId.set(item.entryId, item.correct);
  }

  await Promise.all(
    Array.from(latestByEntryId.entries()).map(([entryId, correct]) =>
      vocabularyService.submitReview(userId, entryId, correct),
    ),
  );
};

export const exerciseService = {
  generateExercises,
  submitExercises,
};
