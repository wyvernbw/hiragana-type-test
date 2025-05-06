import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import JapaneseInput from "@/components/japanese-input";
import { KeyboardPreview } from "@/components/keyboard-preview";
import { LetterList } from "@/components/letter";
import {
  CommandPalette,
  CommandPaletteButton,
} from "@/components/command-palette";
import { ThemeToggle } from "@/components/theme-toggle";
import { ResultsDrawer } from "@/components/results-drawer";
import { UserDropdown } from "@/components/user-dropdown";
import { Suspense, type PropsWithChildren } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { randomWords } from "./client/api";
import { ClientHydrateRandomWords } from "./providers";
import { z } from "zod";
import { TypeApp } from "./app";

export default async function Page() {
  return (
    <div className="flex p-10 h-screen w-screen flex-col items-center md:justify-center">
      <Suspense fallback={<Skeleton />}>
        <CommandPalette />
      </Suspense>
      <Card className="w-3/4 h-full flex">
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
        <CardContent className="flex flex-col w-full h-full">
          <Suspense fallback={<Skeleton className="h-full w-full" />}>
            <App/>
          </Suspense>
        </CardContent>
        <CardFooter></CardFooter>
      </Card>
    </div>
  );
}

const App = async ({ children }: PropsWithChildren<{}>) => {
  const wordListSchema = z.object({
    words: z.array(z.string()),
  });
  const words = await fetch(
    "https://raw.githubusercontent.com/monkeytypegame/monkeytype/refs/heads/master/frontend/static/languages/japanese_hiragana.json",
  )
    .then((res) => res.json())
    .then((res) => wordListSchema.parse(res).words);
  return <TypeApp words={words} />;
}

const TestFallback = () => {
  return <div style={{ color: "red" }}>LOADING</div>;
};



