import crypto from "crypto";

const collapseSpaces = (value: string): string => {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
};

const collapseSpacesPreserveCase = (value: string): string => {
  return value.trim().replace(/\s+/g, " ");
};

const collapseDuplicatePunctuationSequences = (value: string): string => {
  const punctuationRunRegex = /[!?.,;:]+/g;

  return value.replace(punctuationRunRegex, (run) => {
    let collapsed = "";
    for (const char of run) {
      if (!collapsed.includes(char)) {
        collapsed += char;
      }
    }
    return collapsed;
  });
};

const LEADING_QUOTES =
  /^[\u201C\u201D\u201E\u201F\u2018\u2019"""''‚‛„‟‹›\u0022\u0027]+/;
const TRAILING_QUOTES =
  /[\u201C\u201D\u201E\u201F\u2018\u2019"""''‚‛„‟‹›\u0022\u0027]+$/;

export const normalizeWord = (word: string): string => {
  return collapseSpaces(word);
};

export const normalizeSentence = (sentence: string): string => {
  const collapsed = collapseSpacesPreserveCase(sentence);
  const noPunctRuns = collapseDuplicatePunctuationSequences(collapsed);
  return noPunctRuns
    .replace(LEADING_QUOTES, "")
    .replace(TRAILING_QUOTES, "")
    .trim();
};

export const buildRawTranslationCacheKey = (input: {
  normalizedWord: string;
  normalizedSentence: string;
  sourceLanguage: string;
  targetLanguage: string;
}): string => {
  return `${input.normalizedWord}|${input.normalizedSentence}|${input.sourceLanguage}|${input.targetLanguage}`;
};

export const hashCacheKey = (rawCacheKey: string): string => {
  return crypto.createHash("sha256").update(rawCacheKey).digest("hex");
};

export const buildHashedTranslationCacheKey = (input: {
  normalizedWord: string;
  normalizedSentence: string;
  sourceLanguage: string;
  targetLanguage: string;
}): string => {
  return hashCacheKey(buildRawTranslationCacheKey(input));
};
