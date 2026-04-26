import { openai } from "../config/openai-client.js";
import { TranslationError } from "../errors/translation.error.js";
import { aiTranslationResponseSchema } from "../validation/vocabulary.schema.js";
import type { AiTranslationResponse } from "../validation/vocabulary.schema.js";
import type OpenAI from "openai";

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
  "partOfSpeech": "noun | verb | adjective | adverb | pronoun | preposition | conjunction | interjection | other"
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
- If partOfSpeech is unclear, use "other"`,
    },
  ];
};

const callOpenAI = async (
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  maxTokens: number = 300,
): Promise<string> => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    temperature: 0.1,
    max_tokens: maxTokens,
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

const callWithRetry = async (
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  maxTokens?: number,
): Promise<string> => {
  let raw: string;

  try {
    raw = await callOpenAI(messages, maxTokens);
    if (!raw) raw = await callOpenAI(messages, maxTokens);
  } catch (error) {
    try {
      raw = await callOpenAI(messages, maxTokens);
    } catch {
      throw new TranslationError("OpenAI request failed after retry");
    }
  }

  if (!raw) {
    throw new TranslationError("OpenAI returned an empty response after retry");
  }

  return sanitizeRaw(raw);
};

const translate = async (input: {
  word: string;
  sentence: string;
  sourceLanguage: string;
  targetLanguage: string;
}): Promise<AiTranslationResponse> => {
  const messages = buildTranslationMessages(input);
  const sanitized = await callWithRetry(messages);

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

export const openaiService = {
  translate,
  callWithRetry, // exportujemo za exercise feature kasnije
  sanitizeRaw, // exportujemo za parsiranje exercise response-a
  callOpenAI, // exportujemo za custom pozive
};
