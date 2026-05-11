import type { ReadingBook } from "./user";

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: "user" | "admin";
  isBanned: boolean;
  nativeLanguage: string | null;
  createdAt: string;
  readingBooks: ReadingBook[];
}

export interface AdminStatsOverview {
  totalUsers: number;
  totalWords: number;
}

export interface AdminTopBook {
  id: string | null;
  title: string;
  author: string;
  readerCount: number;
}

export interface AdminTopWord {
  baseForm: string;
  language: string;
  translation: string;
  userCount: number;
}

export interface AdminStats {
  overview: AdminStatsOverview;
  topBooks: AdminTopBook[];
  topWords: AdminTopWord[];
}

export interface AdminUserByStatus {
  new: number;
  learning: number;
  mastered: number;
}

export interface AdminUserStats {
  totalWords: number;
  byStatus: AdminUserByStatus;
}
