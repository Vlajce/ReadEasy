export interface VocabularyStats {
  byStatus: Record<"new" | "learning" | "mastered", number>;
  byLanguage: Record<string, number>;
  byDay: Record<string, number>;
}
