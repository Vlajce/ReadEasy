import { openai } from "../config/openai-client.js";
import { TranslationError } from "../errors/translation.error.js";
import { aiTranslationResponseSchema } from "../validation/vocabulary.schema.js";
import type { AiTranslationResponse } from "../validation/vocabulary.schema.js";
import type OpenAI from "openai";

interface TranslateInput {
  word: string;
  sentence: string;
  sourceLanguage: string;
  targetLanguage: string;
}

const buildMessages = (
  input: TranslateInput,
): OpenAI.Chat.ChatCompletionMessageParam[] => {
  const { word, sentence, sourceLanguage, targetLanguage } = input;

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
  "baseForm": "the base/dictionary form of the word in ${sourceLanguage}",
  "partOfSpeech": "noun | verb | adjective | adverb | pronoun | preposition | conjunction | other"
}

Rules:
- translation: the most contextually accurate translation given the sentence
- baseForm: the lemma/infinitive (e.g. "running" → "run", "better" → "good")
- partOfSpeech: based on how the word is used in this specific sentence
- If partOfSpeech is unclear, use "other"`,
    },
  ];
};

const callOpenAI = async (
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
): Promise<string> => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    temperature: 0.1,
    max_tokens: 250,
  });
  return response.choices[0]?.message?.content ?? "";
};

const sanitizeRaw = (raw: string): string => {
  return raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
};

const translate = async (
  input: TranslateInput,
): Promise<AiTranslationResponse> => {
  const messages = buildMessages(input);

  let raw: string;

  try {
    raw = await callOpenAI(messages);
    if (!raw) raw = await callOpenAI(messages);
  } catch (error) {
    try {
      raw = await callOpenAI(messages);
    } catch {
      throw new TranslationError("OpenAI request failed after retry");
    }
  }

  if (!raw) {
    throw new TranslationError("OpenAI returned an empty response after retry");
  }

  const sanitized = sanitizeRaw(raw);

  let parsed: unknown;

  try {
    parsed = JSON.parse(sanitized);
  } catch {
    throw new TranslationError("OpenAI returned invalid JSON");
  }

  const result = aiTranslationResponseSchema.safeParse(parsed);

  if (!result.success) {
    throw new TranslationError(
      "OpenAI response missing required fields: translation or baseForm",
    );
  }

  return result.data;
};

export const translationService = { translate };
