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
import { currentTestAtom } from "./state";
import { KeyboardPreview } from "./components/keyboard-preview";
import { Letter, LetterState } from "./components/letter";

export const App = () => {
  const [, setCurrentTest] = useAtom(currentTestAtom);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className="w-screen min-h-screen flex flex-col items-center justify-center">
      <Card className="min-w-[600px]">
        <CardHeader>
          <CardTitle className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
            Hiragana Type Test
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
          <KeyboardPreview />
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
