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
    <nav className="sticky top-0 z-40 w-full border-b border-slate-700 bg-slate-800">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-white text-slate-900 shadow-lg shadow-black/20">
            <BookOpen className="size-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold leading-none text-white">
              ReadEasy
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Admin
            </span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-600/50 bg-slate-700/20 px-2 py-1 text-left transition hover:border-slate-500 hover:bg-slate-700/70 hover:shadow-sm active:scale-[0.99] outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800"
            >
              <UserInfo
                username={user?.username ?? "Admin"}
                email={user?.email ?? "admin@readeasy.com"}
              />
              <MoreVertical className="size-4 text-slate-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="min-w-56 rounded-lg"
            onCloseAutoFocus={(event) => event.preventDefault()}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <UserInfo
                  username={user?.username ?? "Admin"}
                  email={user?.email ?? "admin@readeasy.com"}
                  dark
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

function UserInfo({
  username,
  email,
  dark = false,
}: UserInfoProps & { dark?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <Avatar className="h-8 w-8 rounded-lg">
        <AvatarImage src={undefined} alt={username} />
        <AvatarFallback
          className={`rounded-lg ${dark ? "bg-slate-200 text-slate-700" : "bg-slate-700 text-white"}`}
        >
          {username.at(0)?.toUpperCase() ?? "A"}
        </AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span
          className={`max-w-35 truncate font-semibold ${dark ? "text-slate-900" : "text-white"}`}
        >
          {username}
        </span>
        <span
          className={`max-w-35 truncate text-xs ${dark ? "text-slate-500" : "text-slate-400"}`}
        >
          {email}
        </span>
      </div>
    </div>
  );
}
