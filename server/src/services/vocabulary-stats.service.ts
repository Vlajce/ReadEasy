import { vocabularyRepository } from "../repositories/vocabulary.repository.js";
import type {
  OverviewStats,
  ActivityStats,
  ActivityStatsItem,
  LanguageStats,
  LanguageStatsItem,
  StatsResponse,
} from "../types/vocabulary.js";

/**
 * VocabularyStatsService
 * Transforms raw aggregation data from repository into API-ready response formats.
 * Encapsulates all stats business logic.
 */

const getOverviewStats = async (userId: string): Promise<OverviewStats> => {
  const data = await vocabularyRepository.getOverviewStatsData(userId);

  // Safe defaults
  const totalWords = data.totalCount[0]?.count || 0;
  const thisWeek = data.thisWeekCount[0]?.count || 0;
  const thisMonth = data.thisMonthCount[0]?.count || 0;

  // Transform byStatus array to object
  const byStatus: Record<"new" | "learning" | "mastered", number> = {
    new: 0,
    learning: 0,
    mastered: 0,
  };

  data.byStatus.forEach((item) => {
    if (item._id && ["new", "learning", "mastered"].includes(item._id)) {
      byStatus[item._id as "new" | "learning" | "mastered"] = item.count;
    }
  });

  return {
    totalWords,
    byStatus,
    wordsAdded: {
      thisWeek,
      thisMonth,
    },
  };
};

const getActivityStats = async (
  userId: string,
  days: number = 30,
): Promise<ActivityStats> => {
  const data = await vocabularyRepository.getActivityStatsData(userId, days);

  // Create map for quick lookup
  const addedMap = new Map(data.wordsAdded.map((item) => [item._id, item.count]));
  const reviewedMap = new Map(
    data.wordsReviewed.map((item) => [item._id, item.count])
  );

  // Generate array of all dates in range
  const activity: ActivityStatsItem[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - i);
    const dateStr = date.toISOString().substring(0, 10);

    activity.push({
      date: dateStr,
      wordsAdded: addedMap.get(dateStr) || 0,
      wordsReviewed: reviewedMap.get(dateStr) || 0,
    });
  }

  return { activity };
};

const getLanguageStats = async (userId: string): Promise<LanguageStats> => {
  const data = await vocabularyRepository.getLanguageStatsData(userId);

  const languages: LanguageStatsItem[] = data.map((item) => {
    // Count occurrences of each status in the byStatus array
    const new_count = item.byStatus.filter((s) => s === "new").length;
    const learning_count = item.byStatus.filter((s) => s === "learning").length;
    const mastered_count = item.byStatus.filter(
      (s) => s === "mastered"
    ).length;

    return {
      language: item._id,
      total: item.total,
      byStatus: {
        new: new_count,
        learning: learning_count,
        mastered: mastered_count,
      },
    };
  });

  return { languages };
};

/**
 * Combined stats endpoint
 * Fetches all stats in parallel for efficiency
 * Returns complete stats response for dashboard
 * @param days - number of days for activity chart (7 or 30)
 */
const getStats = async (userId: string, days: number = 30): Promise<StatsResponse> => {
  const [overview, activity, byLanguage] = await Promise.all([
    getOverviewStats(userId),
    getActivityStats(userId, days),
    getLanguageStats(userId),
  ]);

  return {
    overview,
    activity,
    byLanguage,
  };
};

export const vocabularyStatsService = {
  getOverviewStats,
  getActivityStats,
  getLanguageStats,
  getStats,
};
