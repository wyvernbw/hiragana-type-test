"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useForm, useStore } from "@tanstack/react-form";
import { login } from "@/server/actions";
import { useAtom } from "jotai";
import { userSessionAtom } from "@/app/state";
import { z } from "zod";
import { redirect } from "next/navigation";

let loginSchema = z
  .object({
    email: z.string().email(),
    password: z.string(),
  })
  .transform(async (value, ctx) => {
    let data = await login(value);
    if (data instanceof Object) {
      return data;
    }
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: data,
      path: ["password"],
    });
  });

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [, setUserSession] = useAtom(userSessionAtom);
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmitAsync: async ({ value }) => {
        console.log("SUBMIT");

        let data = await loginSchema.safeParseAsync(value);
        if (data.error) {
          console.log(data.error);
          return data.error.formErrors.fieldErrors;
        }
        if (!data.data) {
          return data.error;
        }
        setUserSession({
          ...data.data.session,
          user: data.data.user,
        });
      },
    },
    onSubmit: ({}) => {
      redirect("/");
    },
  });
  const passwordError = useStore(
    form.store,
    (state) => state.errorMap.onSubmit?.password,
  );
  const emailError = useStore(
    form.store,
    (state) => state.errorMap.onSubmit?.email,
  );
  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      {...props}
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email below to login to your account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <form.Field
            name="email"
            children={(field) => (
              <>
                <Input
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.currentTarget.value)}
                  id="email"
                  placeholder="m@example.com"
                />
                <em className="text-red-400">{emailError}</em>
              </>
            )}
          />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
          </div>
          <form.Field
            name="password"
            children={(field) => (
              <>
                <Input
                  id="password"
                  type="password"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.currentTarget.value)}
                />
                <em className="text-red-400">{passwordError}</em>
              </>
            )}
          />
        </div>
        <Button type="submit" className="w-full">
          Login
        </Button>
      </div>
      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="underline underline-offset-4">
          Sign up
        </Link>
      </div>
    </form>
  );
}
