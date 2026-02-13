import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/library/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_protected/library/"!</div>;
}
