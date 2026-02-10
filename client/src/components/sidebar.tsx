import { PAGES } from "@/lib/pages";
import {
  SidebarContainer,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar";
import { Link, useRouteContext } from "@tanstack/react-router";
import {
  BookOpen,
  LogOut,
  MoreVertical,
  Library,
  Bookmark,
} from "lucide-react";
import { useLogout } from "@/mutations/use-logout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export function Sidebar() {
  return (
    <SidebarContainer>
      <SidebarLogo />
      <SidebarMain />
      <SidebarUserMenu />
    </SidebarContainer>
  );
}

function SidebarMain() {
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {PAGES.map((page) => (
              <SidebarMenuItem key={page.title}>
                <SidebarMenuButton asChild>
                  <Link
                    onClick={() => setOpenMobile(false)}
                    to={page.url}
                    activeProps={{
                      className: "bg-accent text-accent-foreground font-medium",
                    }}
                  >
                    <page.icon strokeWidth={2.2} />
                    <span>{page.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}

function SidebarLogo() {
  const { setOpenMobile } = useSidebar();
  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            className="data-[slot=sidebar-menu-button]:p-1.5!"
          >
            <Link
              to="/explore"
              className="flex items-center gap-2 font-semibold text-primary"
              onClick={() => setOpenMobile(false)}
            >
              <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                <BookOpen className="size-4" />
              </div>
              <span className="mt-0.5">ReadEasy</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}

function SidebarUserMenu() {
  const { isMobile, setOpenMobile } = useSidebar();
  const { mutate: logout, isPending } = useLogout();

  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <UserInfo />
                <MoreVertical className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <UserInfo />
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <Link
                  to="/library"
                  className="w-full"
                  onClick={() => setOpenMobile(false)}
                >
                  <DropdownMenuItem>
                    <Library />
                    Library
                  </DropdownMenuItem>
                </Link>
                <Link
                  to="/vocabulary"
                  className="w-full"
                  onClick={() => setOpenMobile(false)}
                >
                  <DropdownMenuItem>
                    <Bookmark />
                    Vocabulary
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()} disabled={isPending}>
                <LogOut />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}

function UserInfo() {
  const { user } = useRouteContext({ from: "/_protected" });

  return (
    <div className="flex items-center gap-2">
      <Avatar className="h-8 w-8 rounded-lg">
        <AvatarImage src={undefined} alt={user?.username ?? "User"} />
        <AvatarFallback className="rounded-lg">
          {user?.username?.at(0)?.toUpperCase() ?? "U"}
        </AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{user?.username ?? "User"}</span>
        <span className="text-muted-foreground truncate text-xs">
          {user?.email ?? "user@example.com"}
        </span>
      </div>
    </div>
  );
}
