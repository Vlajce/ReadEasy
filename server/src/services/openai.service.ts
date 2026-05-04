import { openai } from "../config/openai-client.js";
import { AiServiceError } from "../errors/ai-service.error.js";
import type OpenAI from "openai";

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
      throw new AiServiceError("OpenAI request failed after retry");
    }
  }

  if (!raw) {
    throw new AiServiceError("OpenAI returned an empty response after retry");
  }

  return sanitizeRaw(raw);
};

export const openaiService = {
  callWithRetry,
  sanitizeRaw,
  callOpenAI,
};
