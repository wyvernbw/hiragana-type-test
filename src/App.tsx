import { useAtom } from "jotai";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { useEffect, useRef } from "react";
import { hiraganaMatch } from "./lib/hiragana";

import JapaneseInput from "./components/japanese-input";
import {
  commandPaletteOpenAtom,
  commandPaletteStateAtom,
  currentTestAtom,
} from "./state";
import { KeyboardPreview } from "./components/keyboard-preview";
import { Letter, LetterState } from "./components/letter";
import { CommandPalette } from "./components/command-palette";
import { Button } from "./components/ui/button";
import { Command as CommandIcon } from "lucide-react";
import { CommandItem } from "./components/ui/command";

export const App = () => {
  const [, setCurrentTest] = useAtom(currentTestAtom);
  const [commandPaletteOpen] = useAtom(commandPaletteOpenAtom);
  const [commandPaletteState, setCommandPaletteState] = useAtom(
    commandPaletteStateAtom,
  );

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

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

  return (
    <div className="w-screen min-h-screen flex flex-col items-center md:justify-center">
      <CommandPalette open={commandPaletteOpen} />
      <Card className="max-w-[800px] w-full">
        <CardHeader>
          <CardTitle className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 justify-between flex">
            Hiragana Type Test
            <Button
              variant="outline"
              onClick={() => setCommandPaletteState("open")}
              ref={commandButtonRef}
            >
              <CommandIcon />P
            </Button>
          </CardTitle>
          <CardDescription>Type the hiragana characters below.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="">
            <JapaneseInput
              ref={inputRef}
              className="relative min-h-[200px] p-4 rounded-md border bg-muted/50 font-mono text-lg my-4 flex"
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
    <>
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
    </>
  );
};
