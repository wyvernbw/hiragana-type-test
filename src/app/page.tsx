import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  CommandPalette,
  CommandPaletteButton,
} from "@/components/command-palette";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserDropdown } from "@/components/user-dropdown";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { z } from "zod";
import { TypeApp } from "./app";
import { connection } from "next/server";

export default async function Page() {
  "use cache";
  return (
    <div className="flex h-screen w-screen flex-col items-center p-10 md:justify-center">
      <Suspense fallback={<Skeleton />}>
        <CommandPalette />
      </Suspense>
      <Card className="flex h-full w-3/4">
        <CardHeader>
          <CardTitle className="flex scroll-m-20 justify-between border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
            🍛 Karē
            <div className="flex items-center gap-2">
              <Suspense fallback={<Skeleton />}>
                <CommandPaletteButton />
                <ThemeToggle />
                <UserDropdown />
              </Suspense>
            </div>
          </CardTitle>
          <CardDescription>Type the hiragana characters below.</CardDescription>
        </CardHeader>
        <CardContent className="flex h-full w-full flex-col overflow-hidden">
          <Suspense fallback={<Skeleton className="h-full w-full" />}>
            <App />
          </Suspense>
        </CardContent>
        <CardFooter></CardFooter>
      </Card>
    </div>
  );
}

const App = async () => {
  const wordListSchema = z.object({
    words: z.array(z.string()),
  });
  const words = await fetch(
    "https://raw.githubusercontent.com/monkeytypegame/monkeytype/refs/heads/master/frontend/static/languages/japanese_hiragana.json",
    { cache: "force-cache" },
  )
    .then((res) => res.json())
    .then((res) => wordListSchema.parse(res).words);
  return <TypeApp words={words} />;
};

const TestFallback = () => {
  return <div style={{ color: "red" }}>LOADING</div>;
};
