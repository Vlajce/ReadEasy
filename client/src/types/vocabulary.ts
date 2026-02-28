export type HighlightColor = "yellow" | "green" | "blue" | "pink" | "purple";
export type VocabularyStatus = "new" | "learning" | "mastered";

export interface BookVocabularyWord {
  word: string;
  highlightColor: HighlightColor;
}

export interface CreateVocabularyInput {
  word: string;
  bookId: string;
  language: string;
  context?: string;
  meaning?: string;
  highlightColor?: HighlightColor;
}

export interface VocabularyEntry {
  id: string;
  word: string;
  language: string;
  status: "new" | "learning" | "mastered";
  highlightColor: HighlightColor;
  meaning?: string | null;
  context?: string | null;
  bookSnapshot: {
    title: string;
    author: string;
  };
}



export interface VocabularyEntryDetail {
  id: string;
  bookId: string;
  word: string;
  language: string;
  status: VocabularyStatus;
  highlightColor: HighlightColor;
  meaning?: string | null;
  context?: string | null;
  bookSnapshot: {
    title: string;
    author: string;
  };
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

export interface VocabularyStats {
  byStatus: Record<VocabularyStatus, number>;
  byLanguage: Record<string, number>;
  byDay: Record<string, number>;
}