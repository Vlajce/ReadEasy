import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";

export function BookTextSkeleton({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("w-full", className)} {...props}>
      {[...Array(4)].map((_, i) => (
        <div key={i}>
          <div className="flex gap-2 justify-between items-center w-full">
            <Skeleton className="w-1/6 h-4 mt-2 bg-muted-foreground/20" />
            <Skeleton className="w-[5%] h-4 mt-2 bg-muted-foreground/20" />
            <Skeleton className="w-1/4 h-4 mt-2 bg-muted-foreground/20" />
            <Skeleton className="w-[12%] h-4 mt-2 bg-muted-foreground/20" />
            <Skeleton className="w-1/5 h-4 mt-2 bg-muted-foreground/20" />
          </div>
          <div className="flex gap-2 justify-between items-center w-full">
            <Skeleton className="w-[7%] h-4 mt-2 bg-muted-foreground/20" />
            <Skeleton className="w-1/6 h-4 mt-2 bg-muted-foreground/20" />
            <Skeleton className="w-[6%] h-4 mt-2 bg-muted-foreground/20" />
            <Skeleton className="w-1/5 h-4 mt-2 bg-muted-foreground/20" />
            <Skeleton className="w-[11%] h-4 mt-2 bg-muted-foreground/20" />
            <Skeleton className="w-[9%] h-4 mt-2 bg-muted-foreground/20" />
          </div>
          <div className="flex gap-2 justify-between items-center w-full">
            <Skeleton className="w-[11%] h-4 mt-2 bg-muted-foreground/20" />
            <Skeleton className="w-[8%] h-4 mt-2 bg-muted-foreground/20" />
            <Skeleton className="w-1/5 h-4 mt-2 bg-muted-foreground/20" />
            <Skeleton className="w-[5%] h-4 mt-2 bg-muted-foreground/20" />
            <Skeleton className="w-1/5 h-4 mt-2 bg-muted-foreground/20" />
            <Skeleton className="w-[12%] h-4 mt-2 bg-muted-foreground/20" />
          </div>
          <div className="flex gap-2 justify-between items-center w-full">
            <Skeleton className="w-[13%] h-4 mt-2 bg-muted-foreground/20" />
            <Skeleton className="w-[6%] h-4 mt-2 bg-muted-foreground/20" />
            <Skeleton className="w-1/6 h-4 mt-2 bg-muted-foreground/20" />
            <Skeleton className="w-[15%] h-4 mt-2 bg-muted-foreground/20" />
            <Skeleton className="w-[10%] h-4 mt-2 bg-muted-foreground/20" />
            <Skeleton className="w-1/5 h-4 mt-2 bg-muted-foreground/20" />
          </div>
          <div className="flex gap-2 justify-between items-center w-full">
            <Skeleton className="w-[4%] h-4 mt-2 bg-muted-foreground/20" />
            <Skeleton className="w-1/3 h-4 mt-2 bg-muted-foreground/20" />
            <Skeleton className="w-[13%] h-4 mt-2 bg-muted-foreground/20" />
            <Skeleton className="w-1/6 h-4 mt-2 bg-muted-foreground/20" />
            <Skeleton className="w-[10%] h-4 mt-2 bg-muted-foreground/20" />
            <Skeleton className="w-[8%] h-4 mt-2 bg-muted-foreground/20" />
          </div>
        </div>
      ))}
    </div>
  );
}
