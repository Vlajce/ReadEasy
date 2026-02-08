import { Link } from "@tanstack/react-router";
import { Button } from "./ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./ui/empty";
import { TriangleAlert } from "lucide-react";

type ErrorComponentProps = {
  reset: () => void;
};

export function ErrorComponent({ reset }: ErrorComponentProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon" className="shadow-sm">
          <TriangleAlert />
        </EmptyMedia>
        <EmptyTitle className="text-xl">Oops! An error occurred</EmptyTitle>
        <EmptyDescription className="text-base text-muted-foreground">
          {"Something went wrong. Please try again later."}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <Button onClick={reset} className="shadow-sm">
            Try Again
          </Button>
          <Button variant="outline" asChild className="shadow-sm">
            <Link to="/">Go Home</Link>
          </Button>
        </div>
      </EmptyContent>
    </Empty>
  );
}
