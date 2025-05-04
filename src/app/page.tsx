"use client";

import { useAtom } from "jotai";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Suspense, useEffect, useRef } from "react";
import { hiraganaMatch } from "@/lib/hiragana";

import JapaneseInput from "@/components/japanese-input";
import {
  commandPaletteOpenAtom,
  commandPaletteStateAtom,
  currentTestAtom,
  testStateAtom,
  updateTestAtom,
  userSessionAtom,
} from "./state";
import { KeyboardPreview } from "@/components/keyboard-preview";
import { Letter, type LetterState } from "@/components/letter";
import { CommandPalette } from "@/components/command-palette";
import { Button } from "@/components/ui/button";
import { Command as CommandIcon, User as UserIcon } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { ResultsDrawer } from "@/components/results-drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { UserDropdown } from "@/components/user-dropdown";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { refreshSession } from "@/server/actions";

export default function Page() {
  const [userSession, setUserSession] = useAtom(userSessionAtom);
  const sessionMutation = useMutation({
    mutationFn: async () => {
      if (!userSession) {
        return;
      }
      const res = await refreshSession(userSession.id);
      console.log(res);
      if (res === "invalid-id") {
        setUserSession(undefined);
      }
    },
    mutationKey: [userSession?.id ?? ""],
    retry: 3,
  });
  useEffect(() => {
    sessionMutation.mutate();
  }, []);
  const [, setCurrentTest] = useAtom(updateTestAtom);
  const [commandPaletteOpen] = useAtom(commandPaletteOpenAtom);
  const [commandPaletteState, setCommandPaletteState] = useAtom(
    commandPaletteStateAtom,
  );
  const [testState] = useAtom(testStateAtom);

  const inputRef = useRef<HTMLInputElement>(null);
  const commandButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (testState === "not-started" && inputRef.current) {
      inputRef.current.value = "";
    }
  }, [testState]);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (
        event.key === "p" ||
        (event.key == "P" && (event.metaKey || event.ctrlKey))
      ) {
        event.preventDefault();
        if (commandButtonRef.current) {
          commandButtonRef.current.click();
        }
      }
    };
    window.addEventListener("keydown", handleKeydown);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, []);

  useEffect(() => {
    console.log(commandPaletteState);
  }, [commandPaletteState]);

  return (
    <div className="flex min-h-screen w-screen flex-col items-center md:justify-center">
      <CommandPalette open={commandPaletteOpen} />
      <ResultsDrawer open={testState === "done"} />
      <Card className="w-full max-w-[800px]">
        <CardHeader>
          <CardTitle className="flex scroll-m-20 justify-between border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
            🍛 Karē
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCommandPaletteState("open")}
                ref={commandButtonRef}
              >
                <CommandIcon />P
              </Button>
              <ThemeToggle />
              <UserDropdown />
            </div>
          </CardTitle>
          <CardDescription>Type the hiragana characters below.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="">
            <JapaneseInput
              ref={inputRef}
              className="bg-muted/50 relative my-4 flex max-h-[200px] rounded-md border p-4 font-mono text-lg"
              disabled={testState === "done"}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setCurrentTest((prev) => ({
                    ...prev,
                    pressedEnter: true,
                  }));
                }
              }}
              onCompositionEnd={(_e) => {
                setCurrentTest((prev) => ({
                  ...prev,
                  pressedEnter: true,
                }));
              }}
              onChange={(e) => {
                console.log(e.currentTarget.value);
                setCurrentTest((prev) => ({
                  ...prev,
                  input: e.currentTarget.value,
                  pressedEnter: false,
                }));
              }}
            >
              <LetterList />
            </JapaneseInput>
          </div>
          <KeyboardPreview className="hidden md:flex" />
        </CardContent>
        <CardFooter></CardFooter>
      </Card>{" "}
    </div>
  );
}

const LetterList = () => {
  "use client";

  const [currentTest] = useAtom(currentTestAtom);

  return (
    <Suspense fallback={<Skeleton />}>
      {[...currentTest.text].map((el, idx) => {
        const state = (): LetterState["state"] => {
          if (idx > currentTest.input.length) {
            return "next";
          }
          const letter = currentTest.input[idx];
          if (!letter) {
            return "next";
          }
          const match = hiraganaMatch(letter, el);
          if (match === "true") {
            // Character has been typed
            return "correct";
          } else if (idx === currentTest.input.length) {
            // Current character
            return "current";
          } else if (match === "false") {
            return "wrong";
          } else if (match === "partial") {
            return "partial";
          }
          return "next";
        };
        const text = () => {
          if (state() === "wrong" && currentTest.input[idx]) {
            return currentTest.input[idx];
          }
          return el;
        };
        return <Letter text={text()} state={state()} key={el + idx} />;
      })}
    </Suspense>
  );
};
