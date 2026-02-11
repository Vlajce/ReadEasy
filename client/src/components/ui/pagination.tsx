import * as React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

type PaginationProps = {
  routePath: string;
  page: number;
  totalPageCount: number;
};

function Pagination({ routePath, page, totalPageCount }: PaginationProps) {
  return (
    <PaginationCointainer className="mt-10">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            from={routePath}
            search={(prev) => ({
              ...prev,
              page: Math.max(1, prev.page - 1),
            })}
          />
        </PaginationItem>

        <PaginationItem>
          <PaginationLink
            from={routePath}
            search={(prev) => ({ ...prev, page: 1 })}
            isActive={page === 1}
          >
            1
          </PaginationLink>
        </PaginationItem>

        {Array.from({ length: totalPageCount }, (_, index) => index + 1)
          .filter((index) => index !== 1 && Math.abs(index - page) <= 2)
          .map((index) => (
            <PaginationItem key={index}>
              <PaginationLink
                from={routePath}
                search={(prev) => ({ ...prev, page: index })}
                isActive={index === page}
              >
                {index}
              </PaginationLink>
            </PaginationItem>
          ))}

        {page < totalPageCount - 2 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        <PaginationItem>
          <PaginationNext
            from={routePath}
            search={(prev) => ({
              ...prev,
              page: Math.min(totalPageCount, prev.page + 1),
            })}
          />
        </PaginationItem>
      </PaginationContent>
    </PaginationCointainer>
  );
}

function PaginationCointainer({
  className,
  ...props
}: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  );
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  Omit<React.ComponentProps<typeof Link>, "from" | "search"> & {
    from: string;
    search?: (prev: any) => any;
  };

function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
        }),
        className,
      )}
      {...(props as any)}
    />
  );
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn("gap-1 px-2.5 sm:pl-2.5", className)}
      {...props}
    >
      <ChevronLeftIcon />
      <span className="hidden sm:block">Previous</span>
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn("gap-1 px-2.5 sm:pr-2.5", className)}
      {...props}
    >
      <span className="hidden sm:block">Next</span>
      <ChevronRightIcon />
    </PaginationLink>
  );
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}

export {
  Pagination,
  PaginationCointainer,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
