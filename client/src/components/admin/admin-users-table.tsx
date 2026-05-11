import { useMemo, useState } from "react";
import { Ban, Trash2, Unlock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { AdminUser } from "@/types/admin";
import { useBanUser } from "@/mutations/use-ban-user";
import { useUnbanUser } from "@/mutations/use-unban-user";
import { useDeleteAdminUser } from "@/mutations/use-delete-admin-user";
import {
  AdminUserActionDialog,
  type AdminUserAction,
} from "@/components/admin/admin-user-action-dialog";
import { AdminUserProfileDialog } from "@/components/admin/admin-user-profile-dialog";

interface AdminUsersTableProps {
  users: AdminUser[];
  isLoading: boolean;
  searchTerm: string;
  dateSortOrder: "asc" | "desc";
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
});

export function AdminUsersTable({
  users,
  isLoading,
  searchTerm,
  dateSortOrder,
}: AdminUsersTableProps) {
  const banUser = useBanUser();
  const unbanUser = useUnbanUser();
  const deleteUser = useDeleteAdminUser();

  const [currentPage, setCurrentPage] = useState(1);
  const [profileUser, setProfileUser] = useState<AdminUser | null>(null);
  const [actionUser, setActionUser] = useState<AdminUser | null>(null);
  const [actionType, setActionType] = useState<AdminUserAction | null>(null);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredUsers = useMemo(() => {
    if (!normalizedSearch) return users;
    return users.filter((user) =>
      [user.username, user.email].some((value) =>
        value.toLowerCase().includes(normalizedSearch),
      ),
    );
  }, [normalizedSearch, users]);

  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((leftUser, rightUser) => {
      const leftIsAdmin = leftUser.role === "admin";
      const rightIsAdmin = rightUser.role === "admin";

      if (leftIsAdmin !== rightIsAdmin) {
        return leftIsAdmin ? -1 : 1;
      }

      const leftDate = new Date(leftUser.createdAt).getTime();
      const rightDate = new Date(rightUser.createdAt).getTime();

      if (leftDate === rightDate) return 0;

      return dateSortOrder === "desc"
        ? rightDate - leftDate
        : leftDate - rightDate;
    });
  }, [filteredUsers, dateSortOrder]);

  const usersPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / usersPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const currentUsers = useMemo(() => {
    const start = (safePage - 1) * usersPerPage;
    return sortedUsers.slice(start, start + usersPerPage);
  }, [safePage, sortedUsers]);

  const isMutating =
    banUser.isPending || unbanUser.isPending || deleteUser.isPending;

  const openActionDialog = (user: AdminUser, action: AdminUserAction) => {
    setActionUser(user);
    setActionType(action);
  };

  const closeActionDialog = () => {
    setActionUser(null);
    setActionType(null);
  };

  const handleConfirmAction = () => {
    if (!actionUser || !actionType) return;
    if (actionType === "ban") {
      banUser.mutate({ id: actionUser.id, username: actionUser.username });
    } else if (actionType === "unban") {
      unbanUser.mutate({ id: actionUser.id, username: actionUser.username });
    } else {
      deleteUser.mutate({ id: actionUser.id, username: actionUser.username });
    }
    closeActionDialog();
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/70 text-left text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <tr className="border-b border-slate-200">
                <th className="px-6 py-4">Account Info</th>
                <th className="hidden px-3 py-4 lg:table-cell">Reg. Date</th>
                <th className="px-3 py-4">Language</th>
                <th className="px-3 py-4">Status</th>
                <th className="px-6 py-4 text-right">Control</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={`admin-user-skeleton-${index}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="size-10 rounded-full" />
                        <div>
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="mt-2 h-3 w-40" />
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-3 py-4 lg:table-cell">
                      <Skeleton className="h-3 w-20" />
                    </td>
                    <td className="px-3 py-4">
                      <Skeleton className="h-3 w-16" />
                    </td>
                    <td className="px-3 py-4">
                      <Skeleton className="h-5 w-16" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Skeleton className="size-8 rounded-lg" />
                        <Skeleton className="size-8 rounded-lg" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : currentUsers.length > 0 ? (
                currentUsers.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => setProfileUser(user)}
                    className="cursor-pointer border-b border-slate-100 transition hover:bg-slate-50/40"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-10">
                          <AvatarImage
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`}
                            alt={user.username}
                          />
                          <AvatarFallback>
                            {user.username.slice(0, 1).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900">
                            {user.username}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-3 py-4 lg:table-cell">
                      {dateFormatter.format(new Date(user.createdAt))}
                    </td>
                    <td className="px-3 py-4">
                      <Badge variant="outline" className="rounded-full">
                        {user.nativeLanguage ?? "Not set"}
                      </Badge>
                    </td>
                    <td className="px-3 py-4">
                      <Badge
                        className={cn(
                          "rounded-full border",
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
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {/* Ban / Unban dugme */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openActionDialog(
                                  user,
                                  user.isBanned ? "unban" : "ban",
                                );
                              }}
                              disabled={user.role === "admin" || isMutating}
                              className={cn(
                                "inline-flex size-9 items-center justify-center rounded-lg border border-transparent transition",
                                user.role === "admin"
                                  ? "cursor-not-allowed opacity-30"
                                  : user.isBanned
                                    ? "text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50"
                                    : "text-amber-600 hover:border-amber-200 hover:bg-amber-50",
                              )}
                            >
                              {user.isBanned ? (
                                <Unlock className="size-4" />
                              ) : (
                                <Ban className="size-4" />
                              )}
                            </button>
                          </TooltipTrigger>
                          {user.role !== "admin" && (
                            <TooltipContent>
                              {user.isBanned
                                ? "Restore access"
                                : "Suspend member"}
                            </TooltipContent>
                          )}
                        </Tooltip>

                        {/* Delete dugme */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openActionDialog(user, "delete");
                              }}
                              disabled={user.role === "admin" || isMutating}
                              className={cn(
                                "inline-flex size-9 items-center justify-center rounded-lg border border-transparent transition",
                                user.role === "admin"
                                  ? "cursor-not-allowed opacity-30"
                                  : "text-red-500 hover:border-red-200 hover:bg-red-50",
                              )}
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </TooltipTrigger>
                          {user.role !== "admin" && (
                            <TooltipContent>Permanently delete</TooltipContent>
                          )}
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className="px-6 py-10 text-center text-sm text-muted-foreground"
                    colSpan={5}
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50/60 px-6 py-5 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-muted-foreground">
            <span>
              Showing results{" "}
              <span className="font-semibold text-slate-900">
                {sortedUsers.length === 0
                  ? 0
                  : (safePage - 1) * usersPerPage + 1}
              </span>{" "}
              —{" "}
              <span className="font-semibold text-slate-900">
                {Math.min(safePage * usersPerPage, sortedUsers.length)}
              </span>
            </span>
            <span className="hidden h-4 w-px bg-slate-200 sm:block" />
            <span>
              Total:{" "}
              <span className="font-semibold text-slate-900">
                {sortedUsers.length}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={safePage === 1}
            >
              Previous
            </Button>
            <span className="text-sm font-semibold text-slate-900">
              {safePage}
            </span>
            <span className="text-sm text-muted-foreground">/</span>
            <span className="text-sm font-semibold text-slate-900">
              {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={safePage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>

        <AdminUserProfileDialog
          open={!!profileUser}
          user={profileUser}
          onOpenChange={(open) => !open && setProfileUser(null)}
        />
        <AdminUserActionDialog
          open={!!actionUser && !!actionType}
          user={actionUser}
          action={actionType}
          onOpenChange={(open) => !open && closeActionDialog()}
          onConfirm={handleConfirmAction}
          isPending={isMutating}
        />
      </div>
    </TooltipProvider>
  );
}
