import type React from "react";
import { Skeleton } from "./skeleton";
import { cn } from "@/lib/utils";

export function BookCardSkeleton({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col space-y-3", className)} {...props}>
      <Skeleton className="h-64 w-44 rounded-lg" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-44 mx-auto" />
        <Skeleton className="h-4 w-24 mx-auto" />
        <Skeleton className="h-4 w-32 mx-auto" />
      </div>
    </div>
  );
}
