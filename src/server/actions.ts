"use server";
import { z } from "zod";
import * as argon2 from "argon2";
import { nanoid } from "nanoid";
import { db } from "./db";
import { sessionsTable, usersTable } from "./db/schema";
import { eq, sql } from "drizzle-orm";
import { signupSchema, type SignupParams } from "./types";

const sessionsSchema = z.object({
  id: z.string().nanoid(),
  userId: z.string().nanoid(),
});

export type Session = z.infer<typeof sessionsSchema>;

export const signUp = async (params: SignupParams) => {
  const data = signupSchema.parse(params);
  const { email, username } = params;

  const password = await (async () => {
    try {
      return await argon2.hash(data.password);
    } catch (err) {}
  })();
  if (!password) {
    return {
      status: "error",
      error: "internal",
      message: "internal server error.",
    } as const;
  }
  const id = nanoid();

  const exists = await db.query.usersTable
    .findFirst({
      where: eq(usersTable.email, email),
    })
    .then((user) => user !== undefined);

  if (exists) {
    console.log("user already exists.");
    return {
      status: "error",
      error: "email",
      message: "user with that email already exists.",
    } as const;
  }

  try {
    const user = (
      await db
        .insert(usersTable)
        .values({
          id,
          password,
          username,
          email,
        })
        .returning()
    )[0];

    if (user === undefined) {
      return {
        status: "error",
        error: "internal",
        message: "internal server error.",
      } as const;
    }

    const value = await db
      .insert(sessionsTable)
      .values({
        id: nanoid(),
        userId: id,
      })
      .returning();

    return {
      status: "success",
      session: sessionsSchema.parse(value[0]),
      user: user,
    } as const;
  } catch (err) {
    console.log(err);
    return {
      status: "error",
      error: "internal",
      message: "internal server error.",
    } as const;
  }
};

export const querySession = async (sessionId: string) => {
  const id = z.string().nanoid().parse(sessionId);
  const session = await db.query.sessionsTable.findFirst({
    where: eq(sessionsTable.id, id),
    with: {
      user: true,
    },
  });
  if (session === undefined) {
    throw "error: session not found.";
  }
  return session;
};

export const login = async (loginParams: {
  email: string;
  password: string;
}) => {
  const { email, password } = loginParams;
  console.log("login attempt.");
  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.email, email),
  });
  if (user === undefined) {
    return "user with that email does not exist.";
  }
  try {
    if (!(await argon2.verify(user.password, password))) {
      return "passwords do not match.";
    }
    const session = await db
      .insert(sessionsTable)
      .values({ id: nanoid(), userId: user.id })
      .returning()
      .then((values) => values[0]);
    if (!session) {
      console.log("ERR: can't create session.");
      return "internal server error.";
    }
    console.log("user login success.");
    return {
      session: sessionsSchema.parse(session),
      user,
    };
  } catch (err) {
    console.log("ERR: ", err);
    return "internal server error.";
  }
};

export type UserSession = Awaited<ReturnType<typeof querySession>>;

export const refreshSession = async (sessionId: string) => {
  const res = await db
    .update(sessionsTable)
    .set({
      lastUsed: sql`now()`,
    })
    .where(eq(sessionsTable.id, sessionId))
    .returning();
  if (res.length === 0) {
    return "invalid-id";
  } else {
    return "success";
  }
};
