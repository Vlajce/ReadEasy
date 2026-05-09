import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { BookOpen, Calendar, Globe, X, Zap, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { AdminUser } from "@/types/admin";
import { getAdminUserStatsQueryOptions } from "@/query-options/get-admin-user-stats-query-options";
import { getLanguageName } from "@/lib/languages";

interface AdminUserProfileDialogProps {
  open: boolean;
  user: AdminUser | null;
  onOpenChange: (open: boolean) => void;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export function AdminUserProfileDialog({
  open,
  user,
  onOpenChange,
}: AdminUserProfileDialogProps) {
  if (!user) return null;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="absolute inset-0 bg-zinc-950/40 backdrop-blur-[2px]"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl"
          >
            {/* Header sa avatarom, imenom i emailom */}
            <div className="flex items-center justify-between gap-4 border-b border-zinc-100 bg-slate-50 px-8 py-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-white text-xl font-black text-slate-600 shadow-sm border border-zinc-200">
                    {user.username.at(0)?.toUpperCase()}
                  </div>
                  <div
                    className={cn(
                      "absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-white",
                      user.role === "admin"
                        ? "bg-blue-500"
                        : user.isBanned
                          ? "bg-red-500"
                          : "bg-emerald-500",
                    )}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black tracking-tight text-zinc-900">
                      {user.username}
                    </h2>
                    <Badge
                      className={cn(
                        "rounded-full border text-[10px] font-black uppercase tracking-widest",
                        user.role === "admin"
                          ? "border-blue-100 bg-blue-50 text-blue-700"
                          : user.isBanned
                            ? "border-red-100 bg-red-50 text-red-700"
                            : "border-emerald-100 bg-emerald-50 text-emerald-700",
                      )}
                    >
                      {user.role === "admin"
                        ? "Admin"
                        : user.isBanned
                          ? "Banned"
                          : "Active"}
                    </Badge>
                  </div>
                  <p className="text-sm text-zinc-500">{user.email}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-full p-2 text-zinc-400 transition hover:bg-zinc-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* Sadržaj */}
            <div className="max-h-[60vh] overflow-y-auto px-8 py-6">
              <div className="grid grid-cols-2 gap-3">
                {/* Vocabulary stats */}
                <VocabularyCard userId={user.id} />

                {/* Native language */}
                <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-100 bg-zinc-50/50 p-6 shadow-sm transition-shadow hover:shadow-md">
                  <div className="absolute -right-4 -top-4 pointer-events-none text-zinc-900 opacity-5">
                    <Globe size={160} />
                  </div>
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                    <Globe size={20} />
                  </div>
                  <div className="mt-12">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      Native Language
                    </p>
                    <p className="mt-1 text-3xl font-black tracking-tight text-zinc-900 first-letter:uppercase">
                      {user.nativeLanguage
                        ? getLanguageName(user.nativeLanguage)
                        : "—"}
                    </p>
                  </div>
                </div>

                {/* Registration date */}
                <div className="col-span-3 flex items-center rounded-2xl bg-zinc-900 px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-white/10 text-white">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Registration Date
                      </p>
                      <p className="text-sm font-bold uppercase text-white">
                        {dateFormatter.format(new Date(user.createdAt))}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reading Journal */}
                <div className="col-span-3">
                  <div className="mb-3 flex items-center justify-between px-1">
                    <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-900">
                      <BookOpen size={14} className="text-emerald-500" />
                      Reading Journal
                    </h3>
                    <span className="text-[10px] font-bold text-zinc-400">
                      {user.readingBooks.length} Books
                    </span>
                  </div>

                  <div className="space-y-2">
                    {user.readingBooks.length > 0 ? (
                      user.readingBooks.map((book) => (
                        <div
                          key={book.id}
                          className="flex items-center gap-4 rounded-2xl border border-zinc-100 bg-white p-4 transition hover:border-zinc-300"
                        >
                          <div className="flex size-11 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400">
                            <BookOpen size={20} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-zinc-900">
                              {book.title}
                            </p>
                            <p className="text-xs text-zinc-500">
                              {book.author}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border-2 border-dashed border-zinc-100 p-8 text-center">
                        <p className="text-sm italic text-zinc-400">
                          No books in reading journal.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function VocabularyCard({ userId }: { userId: string }) {
  const { data: stats, isLoading } = useQuery(
    getAdminUserStatsQueryOptions(userId),
  );

  const total = stats?.totalWords ?? 0;
  const mastered = stats?.byStatus.mastered ?? 0;
  const learning = stats?.byStatus.learning ?? 0;
  const newWords = stats?.byStatus.new ?? 0;

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-zinc-100 bg-zinc-50/50 p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
          <Zap size={20} />
        </div>
        <Trophy className="size-4 text-zinc-300" />
      </div>

      <div className="mt-6">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
          Vocabulary
        </p>
        {isLoading ? (
          <Skeleton className="mt-2 h-10 w-24" />
        ) : (
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-4xl font-black text-zinc-900">{total}</span>
            <span className="text-sm font-bold uppercase tracking-tighter text-zinc-400">
              words
            </span>
          </div>
        )}

        {isLoading ? (
          <Skeleton className="mt-4 h-2 w-full" />
        ) : (
          <div className="mt-6 space-y-3">
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-zinc-200">
              <div
                className="h-full bg-emerald-500 transition-all duration-700"
                style={{
                  width: `${total > 0 ? (mastered / total) * 100 : 0}%`,
                }}
              />
              <div
                className="h-full bg-amber-500 transition-all duration-700"
                style={{
                  width: `${total > 0 ? (learning / total) * 100 : 0}%`,
                }}
              />
              <div
                className="h-full bg-blue-500 transition-all duration-700"
                style={{
                  width: `${total > 0 ? (newWords / total) * 100 : 0}%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-tight text-zinc-500">
              <div className="flex items-center gap-1">
                <div className="size-1.5 rounded-full bg-emerald-500" />
                <span>{mastered} Mastered</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="size-1.5 rounded-full bg-amber-500" />
                <span>{learning} Learning</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="size-1.5 rounded-full bg-blue-500" />
                <span>{newWords} New</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
