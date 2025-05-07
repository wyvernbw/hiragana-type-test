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
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";

const signupSchemaExtended = signupSchema
  .extend({
    confirmPassword: passwordSchema,
  })
  .refine((value) => value.confirmPassword === value.password, {
    message: "passwords do not match.",
    path: ["confirmPassword"],
  });

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [, setUserSession] = useAtom(userSessionAtom);
  const form = useForm({
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },

    validators: {
      onSubmitAsync: async ({ value }) => {
        const signup = signupSchemaExtended.safeParse(value);
        console.log(signup.error);
        if (!signup.data) {
          return {
            fields: {
              ...signup.error.formErrors.fieldErrors,
            },
          };
        }
        const data = await signUp(value);
        console.log(data);
        if (data.status === "error") {
          return {
            fields: {
              [data.error]: [data.message],
            },
          };
        }
        setUserSession({
          user: data.user,
          ...data.session,
        });
        return undefined;
      },
    },
    onSubmit: async ({}) => {
      redirect("/");
    },
  });

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      {...props}
      onSubmit={async (e) => {
        e.preventDefault();
        await form.handleSubmit();
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
          <form.Field name="email">
            {(field) => (
              <>
                <Input
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.currentTarget.value)}
                  id="email"
                  placeholder="m@example.com"
                />
                {!field.state.meta.isValid && (
                  <em className="text-red-400">
                    {field.state.meta.errorMap.onSubmit}
                  </em>
                )}
              </>
            )}
          </form.Field>
          <Label htmlFor="username">Username</Label>
          <form.Field name="username">
            {(field) => (
              <>
                <Input
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.currentTarget.value)}
                  id="username"
                  placeholder="username"
                />
                {!field.state.meta.isValid && (
                  <em className="text-red-400">
                    {field.state.meta.errorMap.onSubmit}
                  </em>
                )}
              </>
            )}
          </form.Field>
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
          </div>
          <form.Field name="password">
            {(field) => (
              <>
                <Input
                  id="password"
                  type="password"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.currentTarget.value)}
                />
                {!field.state.meta.isValid && (
                  <em className="text-red-400">
                    {field.state.meta.errorMap.onSubmit}
                  </em>
                )}
              </>
            )}
          </form.Field>
          <div className="flex items-center">
            <Label htmlFor="confirm-password">Confirm password</Label>
          </div>
          <form.Field name="confirmPassword">
            {(field) => (
              <>
                <Input
                  id="confirm-password"
                  type="password"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.currentTarget.value)}
                />
                {!field.state.meta.isValid && (
                  <em className="text-red-400">
                    {field.state.meta.errorMap.onSubmit}
                  </em>
                )}
              </>
            )}
          </form.Field>
        </div>

        <Button
          disabled={form.state.isSubmitting}
          type="submit"
          className="w-full"
        >
          {form.state.isSubmitting && <Loader2 className="animate-spin" />}
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
