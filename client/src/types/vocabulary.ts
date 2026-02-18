export type HighlightColor = "yellow" | "green" | "blue" | "pink" | "purple";

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

export interface VocabularyEntryDetail {
  id: string;
  bookId: string;
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
  createdAt: string;
  updatedAt: string;
}
