import { AnimatePresence, motion } from "motion/react";
import { Ban, Trash2, Unlock, X } from "lucide-react";
import type { AdminUser } from "@/types/admin";
import type { ReactNode } from "react";

export type AdminUserAction = "ban" | "unban" | "delete";

interface AdminUserActionDialogProps {
  open: boolean;
  user: AdminUser | null;
  action: AdminUserAction | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
}

const actionConfig = {
  ban: {
    title: "Suspend user access",
    description: (username: string): ReactNode => (
      <>
        Are you sure you want to suspend{" "}
        <strong className="font-extrabold text-zinc-900">{username}</strong>?
        Access to platform will be restricted.
      </>
    ),
    confirmLabel: "Confirm suspension",
    icon: Ban,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    confirmBtn: "bg-red-600 hover:bg-red-700 shadow-red-500/20",
  },
  unban: {
    title: "Restore user access",
    description: (username: string): ReactNode => (
      <>
        Restore access for{" "}
        <strong className="font-extrabold text-zinc-900">{username}</strong>?
        This will allow them to use the platform again.
      </>
    ),
    confirmLabel: "Restore access",
    icon: Unlock,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    confirmBtn: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20",
  },
  delete: {
    title: "Delete user account",
    description: (username: string): ReactNode => (
      <>
        Permanently delete{" "}
        <strong className="font-extrabold text-zinc-900">{username}</strong>?
        This action cannot be undone and all their data will be lost.
      </>
    ),
    confirmLabel: "Delete user",
    icon: Trash2,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    confirmBtn: "bg-red-600 hover:bg-red-700 shadow-red-500/20",
  },
};

export function AdminUserActionDialog({
  open,
  user,
  action,
  onOpenChange,
  onConfirm,
  isPending,
}: AdminUserActionDialogProps) {
  if (!user || !action) return null;

  const config = actionConfig[action];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isPending && onOpenChange(false)}
            className="absolute inset-0 bg-zinc-950/40 backdrop-blur-[2px]"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl"
          >
            <div className="p-8">
              {/* Header */}
              <div className="mb-6 flex items-start justify-between">
                <div
                  className={`flex size-14 items-center justify-center rounded-2xl ${config.iconBg} ${config.iconColor}`}
                >
                  <Icon size={28} />
                </div>
                <button
                  type="button"
                  onClick={() => !isPending && onOpenChange(false)}
                  className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-100"
                  disabled={isPending}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <h2 className="mb-3 text-2xl font-bold tracking-tight text-zinc-900">
                {config.title}
              </h2>
              <div className="mb-8 leading-relaxed text-zinc-500">
                {config.description(user.username)}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                  className="flex-1 rounded-2xl border border-zinc-200 px-6 py-2.5 font-semibold text-zinc-700 transition-all hover:bg-zinc-50 active:scale-[0.98] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isPending}
                  className={`flex-1 rounded-2xl px-6 py-2.5 font-semibold text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 ${config.confirmBtn}`}
                >
                  {isPending ? "Please wait..." : config.confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
