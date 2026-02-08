import type { QueryClient } from "@tanstack/react-query";
import {
  HeadContent,
  Outlet,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import type { AuthContext } from "@/context/auth";
import { getCurrentUserQueryOptions } from "@/query-options/get-current-user-query-options";

type RouterContext = {
  queryClient: QueryClient;
  auth: AuthContext;
};

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async ({ context: { auth, queryClient } }) => {
    const user = await queryClient.ensureQueryData(
      getCurrentUserQueryOptions(),
    );
    auth.setUser(user);
  },

  component: () => (
    <>
      <HeadContent />
      <div className="flex flex-col flex-1 min-h-screen">
        <Outlet />
      </div>
    </>
  ),
});
