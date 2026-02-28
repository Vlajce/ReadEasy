import { createFileRoute, Link, redirect } from "@tanstack/react-router";


export const Route = createFileRoute("/_public/")({
  beforeLoad: () => {
    throw redirect({ to: "/login", replace: true });
  },
  component: () => null,
});



