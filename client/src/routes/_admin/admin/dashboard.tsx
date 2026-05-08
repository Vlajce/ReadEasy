import { createFileRoute } from "@tanstack/react-router";
import { useLogout } from "@/mutations/use-logout";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/dashboard")({
  staticData: {
    title: "Admin Dashboard",
  },
  component: DashboardPage,
});

function DashboardPage() {
  const logout = useLogout();

  return (
    <div className="flex flex-col flex-1 my-10 mx-4 sm:mx-10">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <Button
          variant="outline"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
        >
          <LogOut className="size-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}
