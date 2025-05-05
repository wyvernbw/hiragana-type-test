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
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Page() {
  return (
    <div className="flex min-h-screen w-screen flex-col items-center md:justify-center">
      <Suspense fallback={<Skeleton />}>
        <CommandPalette />
        <ResultsDrawer />
      </Suspense>
      <Card className="w-full max-w-[800px]">
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
        <CardContent>
          <Suspense fallback={<TestFallback />}>
            <div className="">
              <JapaneseInput className="bg-muted/50 relative my-4 flex max-h-[200px] rounded-md border p-4 font-mono text-lg">
                <LetterList />
              </JapaneseInput>
            </div>
            <KeyboardPreview className="hidden md:flex" />
          </Suspense>
        </CardContent>
        <CardFooter></CardFooter>
      </Card>
    </div>
  );
}

const TestFallback = () => {
  return <div style={{ color: "red" }}>LOADING</div>;
};
