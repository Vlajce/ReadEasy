import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/mutations/use-login";
import { loginSchema, type LoginInput } from "@/schemas/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/_public/_auth/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    banned: search.banned === "true" || search.banned === true,
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { banned } = useSearch({ from: "/_public/_auth/login" });

  return (
    <>
      <Header />
      {banned && <BannedMessage />}
      <LoginForm />
      <RegisterLink />
    </>
  );
}

function BannedMessage() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 my-6 text-sm text-red-700">
      <ShieldAlert className="size-4 shrink-0" />
      <span>Your account has been suspended. Please contact support.</span>
    </div>
  );
}

function LoginForm() {
  const { mutate: login, isPending, error } = useLogin();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data: LoginInput) => login(data))}
        className="flex flex-col gap-6"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Your password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <FormMessage className="text-center">{error.message}</FormMessage>
        )}

        <Button className="w-full" type="submit" disabled={isPending}>
          {isPending ? "Logging in..." : "Login with email"}
        </Button>
      </form>
    </Form>
  );
}

function RegisterLink() {
  return (
    <div className="mt-4 text-center text-sm">
      Don&apos;t have an account?{" "}
      <Link to="/register" className="underline underline-offset-4">
        Register
      </Link>
    </div>
  );
}

function Header() {
  return (
    <div className="mb-6 flex flex-col items-center gap-2 text-center">
      <h1 className="text-2xl font-bold text-primary 2xl:text-3xl">
        Login to your account
      </h1>
      <p className="text-balance text-sm text-muted-foreground 2xl:text-base">
        Enter your email below to login to your account
      </p>
    </div>
  );
}
