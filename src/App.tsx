import { useAtom } from "jotai";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Suspense, useEffect, useRef } from "react";
import { hiraganaMatch } from "./lib/hiragana";

import JapaneseInput from "./components/japanese-input";
import {
  commandPaletteOpenAtom,
  commandPaletteStateAtom,
  currentTestAtom,
  testStateAtom,
  updateTestAtom,
} from "./state";
import { KeyboardPreview } from "./components/keyboard-preview";
import { Letter, LetterState } from "./components/letter";
import { CommandPalette } from "./components/command-palette";
import { Button } from "./components/ui/button";
import { Command as CommandIcon } from "lucide-react";
import { ThemeToggle } from "./components/theme-toggle";
import { ResultsDrawer } from "./components/results-drawer";
import { Skeleton } from "./components/ui/skeleton";

export const App = () => {
  const [currentTest] = useAtom(currentTestAtom);
  const [, setCurrentTest] = useAtom(updateTestAtom);
  const [commandPaletteOpen] = useAtom(commandPaletteOpenAtom);
  const [commandPaletteState, setCommandPaletteState] = useAtom(
    commandPaletteStateAtom,
  );
  const [testState] = useAtom(testStateAtom);

  const inputRef = useRef<HTMLInputElement>(null);

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

  const commandButtonRef = useRef<HTMLButtonElement | undefined>(undefined);

  useEffect(() => {
    const handleKeydown = (event) => {
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
    <div className="w-screen min-h-screen flex flex-col items-center md:justify-center">
      <CommandPalette open={commandPaletteOpen} />
      <ResultsDrawer open={testState === "done"} />
      <Card className="max-w-[800px] w-full">
        <CardHeader>
          <CardTitle className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 justify-between flex">
            Hiragana Type Test
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCommandPaletteState("open")}
                ref={commandButtonRef}
              >
                <CommandIcon />P
              </Button>
              <ThemeToggle />
            </div>
          </CardTitle>
          <CardDescription>Type the hiragana characters below.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="">
            <JapaneseInput
              ref={inputRef}
              className="relative max-h-[200px] p-4 rounded-md border bg-muted/50 font-mono text-lg my-4 flex"
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
};

const LetterList = () => {
  const [currentTest] = useAtom(currentTestAtom);

  return (
    <Suspense fallback={<Skeleton />}>
      {[...(currentTest.text ?? [])].map((el, idx) => {
        const state = (): LetterState["state"] => {
          if (idx > currentTest.input.length) {
            return "next";
          }
          const match = hiraganaMatch(currentTest.input[idx], el);
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
          if (state() === "wrong" && idx < currentTest.input.length) {
            return currentTest.input[idx];
          }
          return el;
        };
        return <Letter text={text()} state={state()} key={el + idx} />;
      })}
    </Suspense>
  );
};
