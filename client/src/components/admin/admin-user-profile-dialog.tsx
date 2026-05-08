import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AdminUser } from "@/types/admin";

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] rounded-3xl border-none p-8 shadow-2xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-semibold">
            {user.username}
          </DialogTitle>
          <DialogDescription>{user.email}</DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-4 text-sm text-slate-700">
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Status
            </span>
            <Badge
              className={
                user.isBanned
                  ? "border border-red-100 bg-red-50 text-red-700"
                  : "border border-emerald-100 bg-emerald-50 text-emerald-700"
              }
            >
              {user.isBanned ? "Banned" : "Active"}
            </Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Role
              </div>
              <div className="mt-2 font-semibold text-slate-900">
                {user.role}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Native Language
              </div>
              <div className="mt-2 font-semibold text-slate-900">
                {user.nativeLanguage ?? "Not set"}
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Registered
            </div>
            <div className="mt-2 font-semibold text-slate-900">
              {dateFormatter.format(new Date(user.createdAt))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
