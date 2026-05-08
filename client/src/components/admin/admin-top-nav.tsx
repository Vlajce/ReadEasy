import { BookOpen, LogOut, MoreVertical } from "lucide-react";
import { useRouteContext } from "@tanstack/react-router";
import { useLogout } from "@/mutations/use-logout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AdminTopNav() {
  const { user } = useRouteContext({ from: "/_admin" });
  const { mutate: logout, isPending } = useLogout();

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-black text-white shadow-lg shadow-black/10">
            <BookOpen className="size-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold leading-none">
              ReadEasy
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Admin Dashboard
            </span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-3 rounded-xl border border-transparent px-2 py-1 text-left transition hover:bg-slate-100"
            >
              <UserInfo
                username={user?.username ?? "Admin"}
                email={user?.email ?? "admin@readeasy.com"}
              />
              <MoreVertical className="size-4 text-slate-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-56 rounded-lg">
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <UserInfo
                  username={user?.username ?? "Admin"}
                  email={user?.email ?? "admin@readeasy.com"}
                />
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logout()}
              disabled={isPending}
              className="text-red-600"
            >
              <LogOut className="text-red-600" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}

interface UserInfoProps {
  username: string;
  email: string;
}

function UserInfo({ username, email }: UserInfoProps) {
  return (
    <div className="flex items-center gap-2">
      <Avatar className="h-8 w-8 rounded-lg">
        <AvatarImage src={undefined} alt={username} />
        <AvatarFallback className="rounded-lg">
          {username.at(0)?.toUpperCase() ?? "A"}
        </AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="max-w-35 truncate font-medium text-slate-900">
          {username}
        </span>
        <span className="max-w-35 truncate text-xs text-muted-foreground">
          {email}
        </span>
      </div>
    </div>
  );
}
