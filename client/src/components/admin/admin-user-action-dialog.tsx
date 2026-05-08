import { Ban, Trash2, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AdminUser } from "@/types/admin";

export type AdminUserAction = "ban" | "unban" | "delete";

interface AdminUserActionDialogProps {
  open: boolean;
  user: AdminUser | null;
  action: AdminUserAction | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
}

export function AdminUserActionDialog({
  open,
  user,
  action,
  onOpenChange,
  onConfirm,
  isPending,
}: AdminUserActionDialogProps) {
  if (!user || !action) return null;

  const isDelete = action === "delete";
  const isBan = action === "ban";
  const title = isDelete
    ? "Confirm deletion"
    : isBan
      ? "Suspend user access"
      : "Restore user access";
  const description = isDelete
    ? `This will permanently remove ${user.username} and all of their data.`
    : isBan
      ? `${user.username} will be logged out immediately and cannot sign in.`
      : `${user.username} will regain access to the platform.`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] rounded-3xl border-none p-8 shadow-2xl">
        <DialogHeader className="space-y-3">
          <div
            className={
              isDelete || isBan
                ? "flex size-14 items-center justify-center rounded-2xl bg-red-50"
                : "flex size-14 items-center justify-center rounded-2xl bg-emerald-50"
            }
          >
            {isDelete ? (
              <Trash2 className="size-7 text-red-600" />
            ) : isBan ? (
              <Ban className="size-7 text-red-600" />
            ) : (
              <Unlock className="size-7 text-emerald-600" />
            )}
          </div>
          <DialogTitle className="text-2xl font-semibold">{title}</DialogTitle>
          <DialogDescription className="text-base">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-3 pt-4 sm:gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="h-12 flex-1 rounded-xl"
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant={isDelete || isBan ? "destructive" : "default"}
            onClick={onConfirm}
            className="h-12 flex-1 rounded-xl"
            disabled={isPending}
          >
            {isDelete
              ? "Delete user"
              : isBan
                ? "Confirm suspension"
                : "Restore access"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
