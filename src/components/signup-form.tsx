"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

import { useForm } from "@tanstack/react-form";
import { signUp } from "@/server/actions";
import { userSessionAtom } from "@/app/state";
import { useAtom } from "jotai";
import { passwordSchema, signupSchema } from "@/server/types";
import { z } from "zod";
import { redirect } from "next/navigation";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [userSession, setUserSession] = useAtom(userSessionAtom);
  const form = useForm({
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },

    validators: {
      // Pass a schema or function to validate
      onSubmit: signupSchema
        .extend({
          confirmPassword: passwordSchema,
        })
        .refine((value) => value.confirmPassword === value.password, {
          message: "Passwords do not match.",
          path: ["confirmPassword"],
        }),
    },
    onSubmit: async ({ value }) => {
      const data = await signUp(value);
      setUserSession({
        id: data.session.id,
        userId: data.session.userId,
        user: data.user,
      });
      redirect("/");
    },
  });

  const onChange = (field) => (e) => field.handleChange(e.target.value);

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
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email below to create your account
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
                  onChange={onChange(field)}
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </>
            )}
          />
          <Label htmlFor="username">Username</Label>
          <form.Field
            name="username"
            children={(field) => (
              <>
                <Input
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={onChange(field)}
                  id="username"
                  type="username"
                  placeholder="username"
                  required
                />
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
                  required
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={onChange(field)}
                />
              </>
            )}
          />
          <div className="flex items-center">
            <Label htmlFor="confirm-password">Confirm password</Label>
          </div>
          <form.Field
            name="confirmPassword"
            children={(field) => (
              <>
                <Input
                  id="confirm-password"
                  type="password"
                  required
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={onChange(field)}
                />
              </>
            )}
          />
        </div>
        <Button type="submit" className="w-full">
          Sign up
        </Button>
      </div>
      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="underline underline-offset-4">
          Log in
        </Link>
      </div>
    </form>
  );
}
