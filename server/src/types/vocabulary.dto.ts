export interface VocabularyListDTO {
  id: string;
  word: string;
  language: string;
  status: "new" | "learning" | "mastered";
  meaning?: string | null;
}

export interface VocabularyDetailDTO {
  id: string;
  word: string;
  language: string;
  status: "new" | "learning" | "mastered";
  meaning?: string | null;
  context?: string | null;
  bookId?: string | null;
  position?: { startOffset: number; endOffset: number } | null;
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
