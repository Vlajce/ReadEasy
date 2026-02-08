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
import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";

export const Route = createFileRoute("/_public/_auth/login")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Header />
      <LoginForm />
      <RegisterLink />
    </>
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
    <div className="text-center text-sm mt-4">
      Don&apos;t have an account?{" "}
      <Link to="/register" className="underline underline-offset-4">
        Register
      </Link>
    </div>
  );
}

function Header() {
  return (
    <div className="flex flex-col items-center gap-2 text-center mb-6">
      <h1 className="text-2xl 2xl:text-3xl font-bold text-primary">
        Login to your account
      </h1>
      <p className="text-muted-foreground text-balance text-sm 2xl:text-base">
        Enter your email below to login to your account
      </p>
    </div>
  );
}
