import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { publicProcedure, router } from "./trpc";
import { z } from "zod";
import { randomWords } from "@/client/api";

const appRouter = router({
  randomWords: publicProcedure
    .input(z.number().int())
    .query(async ({ input: count }) => {
      await randomWords(count);
    }),
});

export type AppRouter = typeof appRouter;

const server = createHTTPServer({
  router: appRouter,
});

server.listen(3000);
