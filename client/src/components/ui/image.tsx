import type React from "react";
import { useState } from "react";
import { Skeleton } from "./skeleton";
import { cn } from "@/lib/utils";

export function Image({
  className,
  src,
  alt,
  ...props
}: React.ComponentProps<"img">) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      className={cn(
        "relative w-full h-full overflow-hidden bg-accent",
        className,
      )}
    >
      {!isLoaded && <Skeleton className="absolute inset-0 h-full w-full" />}

      <img
        src={src}
        alt={alt}
        className={`absolute inset-0 h-full w-full object-cover object-center select-none pointer-event-none transition-opacity duration-700 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setIsLoaded(true)}
        {...props}
      />
    </div>
  );
}
