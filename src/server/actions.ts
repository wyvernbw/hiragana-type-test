"use server";
import { z } from "zod";
import * as argon2 from "argon2";
import { nanoid } from "nanoid";
import { db } from "./db";
import { scoresTable, sessionsTable, usersTable } from "./db/schema";
import { eq, sql } from "drizzle-orm";
import { signupSchema, type SignupParams } from "./types";
import { randomBytes } from "crypto";
import * as jwt from "jsonwebtoken";
import { lastResultSchema, scoreSchema } from "@/app/state";

const sessionsSchema = z.object({
  id: z.string().nanoid(),
  userId: z.string().nanoid(),
  lastUsed: z.string(),
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
    return {
      status: "error",
    } as const;
  }
  return { status: "success", session } as const;
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

export type UserSession = Exclude<
  Awaited<ReturnType<typeof querySession>>["session"],
  undefined
>;

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

export const addScore = async (opts: {
  sessionId: string;
  score: {
    wpm: number;
    acc: number;
  };
}) => {
  const score = scoreSchema.safeParse(opts.score);
  if (score.error) {
    return {
      status: "error",
      message: "invalid score passed. " + score.error.message,
    } as const;
  }
  const session = await querySession(opts.sessionId);
  if (session.status === "error") {
    return {
      status: "error",
      message: "authorization error.",
    } as const;
  }
  const userId = session.session.userId;
  const res = await db
    .insert(scoresTable)
    .values([
      {
        id: nanoid(),
        userId,
        wpm: score.data.wpm,
        acc: score.data.acc,
      },
    ])
    .returning();

  if (res[0] === undefined) {
    return {
      status: "error",
      message: "db error.",
    } as const;
  }

  return {
    status: "success",
    data: res[0],
  };
};

const secret = randomBytes(64).toString("hex");

export const signObject = async (obj: object) => {
  const hash = await new Promise<string | undefined>((r) =>
    jwt.sign(obj, secret, {}, (_error, value) => {
      r(value);
    }),
  );
  return hash;
};

type DecodeResult<T> = { status: "error" } | { status: "success"; data: T };

const decodeObject = async <T,>(
  token: string,
  validator: z.ZodType<T>,
): Promise<DecodeResult<T>> => {
  return new Promise((resolve) => {
    jwt.verify(token, secret, {}, (err, value) => {
      if (err || !value) {
        resolve({ status: "error" });
        return;
      }

      const parsed = validator.safeParse(value);
      if (!parsed.success) {
        resolve({ status: "error" });
        return;
      }

      resolve({ status: "success", data: parsed.data });
    });
  });
};

export const decodeLastResult = async (token: string) =>
  await decodeObject(token, lastResultSchema);
