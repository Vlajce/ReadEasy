import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { createFileRoute, Link } from "@tanstack/react-router";
import { useRegister } from "@/mutations/use-register";
import { registerSchema, type RegisterInput } from "@/schemas/user";

export const Route = createFileRoute("/_public/_auth/register")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Header />
      <RegisterForm />
      <LoginLink />
    </>
  );
}

function RegisterForm() {
  const { mutate: register, isPending, error } = useRegister();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data: RegisterInput) => register(data))}
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
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Your username" {...field} />
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
          {isPending ? "Creating account..." : "Create Account"}
        </Button>
      </form>
    </Form>
  );
}

function LoginLink() {
  return (
    <div className="text-center text-sm mt-4">
      Already have an account?{" "}
      <Link to="/login" className="underline underline-offset-4">
        Log in
      </Link>
    </div>
  );
}

function Header() {
  return (
    <div className="flex flex-col items-center gap-2 text-center mb-6">
      <h1 className="text-2xl 2xl:text-3xl font-bold text-primary">
        Create your account
      </h1>
      <p className="text-muted-foreground text-balance text-sm 2xl:text-base">
        Enter your email below to create your account
      </p>
    </div>
  );
}
