import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import image from "@/assets/images/books.jpg";
import { Image } from "@/components/ui/image";

export const Route = createFileRoute("/_public/_auth")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold text-primary 2xl:text-lg"
          >
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <BookOpen className="size-4" />
            </div>
            <span className="mt-0.5">ReadEasy</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs 2xl:max-w-sm">
            <Outlet />
          </div>
        </div>
      </div>
      <Image
        src={image}
        alt="Delicious pancakes with syrup and berries"
        className="hidden lg:block"
      />
    </div>
  );
}
