import { config } from "dotenv";
import { type Config } from "drizzle-kit";

config({ path: ".env" }); // or .env.local

export default {
  schema: "./src/server/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  tablesFilter: ["hiragana-rewrite_*"],
} satisfies Config;
