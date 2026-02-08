import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Import the generated route tree
import { routeTree } from "./routeTree.gen.ts";
import "./index.css";
import config from "./config.ts";
import { auth } from "@/context/auth.tsx";
import { toast, Toaster } from "sonner";
import { Spinner } from "@/components/ui/spinner.tsx";
import { ErrorComponent } from "@/components/error.tsx";
import { NotFoundComponent } from "@/components/not-found.tsx";
import { ApiError } from "@/lib/api-error.ts";
import { getFormattedDate } from "@/lib/utils.ts";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: config.cacheStaleTimeSeconds * 1000,
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.statusCode === 401) return false;
        return failureCount < 3;
      },
    },
  },
});

// Create a new router instance
const router = createRouter({
  defaultPendingComponent: () => (
    <div className="flex flex-1 items-center justify-center h-full w-full">
      <Spinner />
    </div>
  ),
  defaultErrorComponent: ({ reset }) => (
    <ErrorComponent
      reset={() => {
        queryClient.resetQueries();
        reset();
      }}
    />
  ),
  defaultNotFoundComponent: () => (
    <div className="h-screen">
      <NotFoundComponent />
    </div>
  ),
  defaultPendingMs: 500,
  routeTree,
  context: {
    queryClient,
    auth,
  },
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const handleGlobalError = (error: Error) => {
  if (error instanceof ApiError && error.statusCode === 401) {
    queryClient.clear();
    toast.error("Your session has expired. Please login again.", {
      description: getFormattedDate() + " 📆",
      id: "session-expired",
    });
    router.invalidate();
  } else if (error instanceof ApiError && error.statusCode >= 500) {
    toast.error("Oops! Something went wrong. Please try again later.", {
      description: getFormattedDate() + " 📆",
      id: "server-error",
    });
  }
};

queryClient.getQueryCache().config.onError = handleGlobalError;
queryClient.getMutationCache().config.onError = handleGlobalError;

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster expand={true} position="top-right" />
    </QueryClientProvider>,
  );
}
