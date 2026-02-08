import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen } from "lucide-react";

export const Route = createFileRoute("/_public/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Header />
      <div className="flex flex-col flex-1  mx-3.5 sm:mx-6 xl:mx-10 2xl:mx-20">
        Hello "/_public/"!
      </div>
    </>
  );
}

function Header() {
  return (
    <header className="sticky flex justify-center items-center left-0 right-0 top-0 z-50 w-full backdrop-blur-lg bg-transparent">
      <nav className="container flex py-4 xl:py-5 justify-between items-center mx-3.5 sm:mx-6 xl:mx-10 2xl:mx-20">
        <Link
          to="/"
          className="flex items-center gap-2 font-semibold text-primary 2xl:text-lg"
        >
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <BookOpen className="size-4" />
          </div>
          <span className="mt-0.5">ReadEasy</span>
        </Link>
        <div className="flex items-center gap-10">
          <Link
            to="/"
            className="hidden sm:block text-primary font-semibold border-b-2 border-transparent hover:border-primary transition-all duration-300 ease-in-out"
          >
            Features
          </Link>
          <Link
            to="/"
            className="hidden sm:block text-primary font-semibold border-b-2 border-transparent hover:border-primary transition-all duration-300 ease-in-out"
          >
            About us
          </Link>
          <Button className="text-base shadow-md" asChild>
            <Link to="/login">
              Login <ArrowRight />
            </Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
