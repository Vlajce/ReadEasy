import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { getAdminStatsQueryOptions } from "@/query-options/get-admin-stats-query-options";
import { getAdminUsersQueryOptions } from "@/query-options/get-admin-users-query-options";
import { Input } from "@/components/ui/input";
import { AdminTopNav } from "@/components/admin/admin-top-nav";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  AdminSectionTabs,
  type AdminSectionTab,
} from "@/components/admin/admin-section-tabs";
import { AdminStatGrid } from "@/components/admin/admin-stat-grid";
import { AdminUsersTable } from "@/components/admin/admin-users-table";
import { AdminInsights } from "@/components/admin/admin-insights";

export const Route = createFileRoute("/_admin/dashboard")({
  staticData: {
    title: "Admin Dashboard",
  },
  component: DashboardPage,
});

function DashboardPage() {
  const [activeTab, setActiveTab] = useState<AdminSectionTab>("users");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: stats, isLoading: statsLoading } = useQuery(
    getAdminStatsQueryOptions(),
  );
  const { data: users, isLoading: usersLoading } = useQuery(
    getAdminUsersQueryOptions(),
  );

  return (
    <div className="min-h-screen">
      <AdminTopNav />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <AdminPageHeader
          title="Admin Dashboard "
          description="Monitor users, reading activity and vocabulary trends."
        />

        <AdminStatGrid stats={stats} isLoading={statsLoading} />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <AdminSectionTabs value={activeTab} onChange={setActiveTab} />

          {activeTab === "users" ? (
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-9"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          ) : null}
        </div>

        {activeTab === "users" ? (
          <AdminUsersTable
            users={users ?? []}
            isLoading={usersLoading}
            searchTerm={searchTerm}
          />
        ) : (
          <AdminInsights stats={stats} isLoading={statsLoading} />
        )}
      </div>
    </div>
  );
}
