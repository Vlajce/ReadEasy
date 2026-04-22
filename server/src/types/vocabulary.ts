export type HighlightColor = "yellow" | "green" | "blue" | "pink" | "purple";

export interface VocabularyEntryDTO {
  id: string;
  word: string;
  baseForm: string;
  translation: string;
  targetLanguage: string;
  language: string;
  partOfSpeech: string;
  contexts: string[];
  status: "new" | "learning" | "mastered";
  highlightColor: HighlightColor;
  bookSnapshot: {
    title: string;
    author: string;
  };
}

export interface BookVocabularyWordDTO {
  word: string;
  highlightColor: HighlightColor;
}

export interface VocabularyEntryDetailDTO {
  id: string;
  bookId: string;
  word: string;
  baseForm: string;
  translation: string;
  targetLanguage: string;
  language: string;
  partOfSpeech: string;
  contexts: string[];
  status: "new" | "learning" | "mastered";
  highlightColor: HighlightColor;
  bookSnapshot: {
    title: string;
    author: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedVocabularyDTO {
  data: VocabularyEntryDTO[];
  meta: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface OverviewStats {
  totalWords: number;
  byStatus: Record<"new" | "learning" | "mastered", number>;
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
  byStatus: Record<"new" | "learning" | "mastered", number>;
}

export interface LanguageStats {
  languages: LanguageStatsItem[];
}

export interface StatsResponse {
  overview: OverviewStats;
  activity: ActivityStats;
  byLanguage: LanguageStats;
}
