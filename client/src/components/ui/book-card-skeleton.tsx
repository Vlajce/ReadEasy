import { Skeleton } from "./skeleton";

export function BookCardSkeleton() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-60 w-44 rounded-lg" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-44" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}
