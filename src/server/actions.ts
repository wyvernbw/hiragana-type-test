"use server";
import { z } from "zod";
import * as argon2 from "argon2";
import { nanoid } from "nanoid";
import { db } from "./db";
import { sessionsTable, usersTable } from "./db/schema";
import { eq } from "drizzle-orm";
import { signupSchema, type SignupParams } from "./types";

const sessionsSchema = z.object({
  id: z.string().nanoid(),
  userId: z.string().nanoid(),
});

export type Session = z.infer<typeof sessionsSchema>;

export const signUp = async (params: SignupParams) => {
  const data = signupSchema.parse(params);
  const { email, username } = params;

  const password = await argon2.hash(data.password);
  const id = nanoid();

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
    throw "user is undefined";
  }

  const value = await db
    .insert(sessionsTable)
    .values({
      id: nanoid(),
      userId: id,
    })
    .returning();

  return {
    session: sessionsSchema.parse(value[0]),
    user: user,
  };
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

export type UserSession = Awaited<ReturnType<typeof querySession>>;
