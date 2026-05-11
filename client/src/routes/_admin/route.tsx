import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin")({
  beforeLoad: ({ context: { auth } }) => {
    if (!auth.isAuthenticated) {
      throw redirect({ to: "/login", replace: true });
    }
    if (auth.user?.role !== "admin") {
      throw redirect({ to: "/explore", replace: true });
    }
    return {
      user: auth.user,
    };
  },
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <Outlet />
    </div>
  );
}
