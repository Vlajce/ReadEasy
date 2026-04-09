import { Sidebar } from "@/components/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  createFileRoute,
  Outlet,
  redirect,
  useMatches,
} from "@tanstack/react-router";
import { NativeLanguageDialog } from "@/components/native-language-dialog";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUserQueryOptions } from "@/query-options/get-current-user-query-options";

export const Route = createFileRoute("/_protected")({
  beforeLoad: ({ context: { auth } }) => {
    if (!auth.isAuthenticated) {
      throw redirect({ to: "/login", replace: true });
    }
    return {
      user: auth.user,
    };
  },
  component: SidebarLayout,
});

function SidebarLayout() {
  // Get current user from query (reactive to updates)
  const { data: user } = useQuery(getCurrentUserQueryOptions());
  const hasNativeLanguage = !!user?.nativeLanguage;

  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>
        <Header />
        <div className="flex flex-col flex-1 my-10 mx-4 sm:mx-10">
          <Outlet />
        </div>
      </SidebarInset>

      {/* Language preference dialog - shown if user hasn't set native language */}
      {/* Dialog is mandatory and cannot be dismissed without selecting language */}
      <NativeLanguageDialog
        open={!hasNativeLanguage}
        onOpenChange={() => {
          /* Dialog cannot be closed without selecting language */
        }}
      />
    </SidebarProvider>
  );
}

function Header() {
  const matches = useMatches();

  const matchWithTitle = [...matches]
    .reverse()
    .find((match) => match.staticData.title);
  const title = matchWithTitle?.staticData.title || "ReadEasy";

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger />
      <Separator
        orientation="vertical"
        className="mr-2 data-[orientation=vertical]:h-4"
      />
      <h1 className="text-base font-medium">{title}</h1>
    </header>
  );
}
