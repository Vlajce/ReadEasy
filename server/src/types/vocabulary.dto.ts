export interface VocabularyListDTO {
  id: string;
  word: string;
  language: string;
  status: "new" | "learning" | "mastered";
  meaning?: string | null;
  bookSnapshot: {
    title: string;
    author: string;
  };
}

export interface VocabularyDetailDTO {
  id: string;
  bookId: string;
  word: string;
  language: string;
  status: "new" | "learning" | "mastered";
  meaning?: string | null;
  context?: string | null;
  position?: { startOffset: number; endOffset: number } | null;
  bookSnapshot: {
    title: string;
    author: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedVocabularyDTO {
  data: VocabularyListDTO[];
  meta: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface VocabularyStatsDTO {
  byStatus: Record<"new" | "learning" | "mastered", number>;
  byLanguage: Record<string, number>;
  byDay: Record<string, number>;
}
