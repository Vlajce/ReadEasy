import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_public")({
  beforeLoad: ({ context: { auth } }) => {
    if (auth.isAuthenticated) {
      throw redirect({ to: "/home", replace: true });
    }
  },
});
