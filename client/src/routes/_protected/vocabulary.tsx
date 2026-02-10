import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/vocabulary")({
  component: RouteComponent,
  staticData: {
    title: "Vocabulary",
  },
});

function RouteComponent() {
  return <div>Hello "/_protected/vocabulary"!</div>;
}
