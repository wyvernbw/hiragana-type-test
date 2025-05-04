import { db } from "@/server/db";
import { sessionsTable } from "@/server/db/schema";
import { sql } from "drizzle-orm";

export function GET(request: Request) {
  db.delete(sessionsTable).where(
    sql`WHERE lastUsed < NOW() - INTERVAL '1 month'`,
  );
  return new Response("Done");
}
