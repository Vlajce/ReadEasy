import { AlertCircle } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./ui/empty";
import { Button } from "./ui/button";
import { Link } from "@tanstack/react-router";

export function NotFoundComponent() {
  return (
    <Empty className="h-full">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="shadow-sm">
          <AlertCircle />
        </EmptyMedia>
        <EmptyTitle className="text-xl">Page Not Found</EmptyTitle>
        <EmptyDescription className="text-base text-muted-foreground">
          The page you are looking for does not exist.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <Button variant="outline" asChild className="shadow-sm">
            <Link to="/">Go Home</Link>
          </Button>
        </div>
      </EmptyContent>
    </Empty>
  );
}
