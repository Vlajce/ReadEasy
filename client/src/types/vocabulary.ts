export type HighlightColor = "yellow" | "green" | "blue" | "pink" | "purple";
export type VocabularyStatus = "new" | "learning" | "mastered";

// ─── Book Vocabulary ──────────────────────────────────────────────────────────

export interface BookVocabularyWord {
  word: string;
  highlightColor: HighlightColor;
  baseForm: string;
  translation: string;
  partOfSpeech: string;
  exampleSentence?: string;
}

// ─── Vocabulary Entry ─────────────────────────────────────────────────────────

export interface VocabularyEntry {
  id: string;
  bookId: string;
  word: string;
  baseForm: string;
  translation: string;
  targetLanguage: string;
  language: string;
  partOfSpeech: string;
  exampleSentence?: string;
  status: "new" | "learning" | "mastered";
  highlightColor: HighlightColor;
  bookSnapshot: {
    title: string;
    author: string;
  };
}

export interface VocabularyEntryDetail {
  id: string;
  bookId: string;
  word: string;
  baseForm: string;
  translation: string;
  targetLanguage: string;
  language: string;
  partOfSpeech: string;
  exampleSentence?: string;
  status: "new" | "learning" | "mastered";
  highlightColor: HighlightColor;
  bookSnapshot: {
    title: string;
    author: string;
  };
  reviewCount: number;
  correctCount: number;
  incorrectCount: number;
  consecutiveIncorrect: number;
  lastReviewedAt: string | null;
  statusHistory: Array<{
    status: "new" | "learning" | "mastered";
    changedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedVocabularyEntries {
  data: VocabularyEntry[];
  meta: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
}

// ─── Mutations Input ──────────────────────────────────────────────────────────

export interface CreateVocabularyInput {
  word: string;
  bookId: string;
  language: string;
  context?: string;
  meaning?: string;
  highlightColor?: HighlightColor;
  exampleSentence?: string;
}

export interface SaveVocabularyInput {
  word: string;
  bookId: string;
  sentence: string;
  translation: string;
  baseForm: string;
  partOfSpeech: string;
  exampleSentence?: string;
  highlightColor?: HighlightColor;
}

export interface TranslationResult {
  translation: string;
  baseForm: string;
  partOfSpeech: string;
  exampleSentence?: string;
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface OverviewStats {
  totalWords: number;
  byStatus: Record<VocabularyStatus, number>;
  wordsAdded: {
    thisWeek: number;
    thisMonth: number;
  };
}

export interface ActivityStatsItem {
  date: string;
  wordsAdded: number;
  wordsReviewed: number;
}

export interface ActivityStats {
  activity: ActivityStatsItem[];
}

export interface LanguageStatsItem {
  language: string;
  total: number;
  byStatus: Record<VocabularyStatus, number>;
}

export interface LanguageStats {
  languages: LanguageStatsItem[];
}

export interface StatsResponse {
  overview: OverviewStats;
  activity: ActivityStats;
  byLanguage: LanguageStats;
}
