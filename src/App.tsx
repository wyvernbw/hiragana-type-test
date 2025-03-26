import { atom, useAtom, useAtomValue } from "jotai";
import { Button } from "./components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Textarea } from "./components/ui/textarea";
import { HTMLAttributes, useEffect, useRef } from "react";
import {
  hiraganaTexts,
  hiraganaToRomaji,
  keyboardLayout,
  romajiToHiragana,
} from "./lib/hiragana";
import { get } from "http";
import { atomWithDefault } from "jotai/utils";
import { twMerge } from "tailwind-merge";
import JapaneseInput from "./components/japanese-input";

const currentTestIndexAtom = atom({
  index: Math.floor(Math.random() * (hiraganaTexts.length - 1)),
});

const currentTestAtom = atomWithDefault((get) => {
  const index = get(currentTestIndexAtom).index;
  console.log(index);
  return {
    text: hiraganaTexts[index].text,
    input: "",
    errors: 0,
  };
});

type LetterState = {
  text: string;
  state: "correct" | "wrong" | "current" | "next";
};

const Letter = ({
  text,
  state,
  ...rest
}: LetterState & HTMLAttributes<HTMLDivElement>) => {
  const className =
    "inline-flex flex-col items-center justify-center mx-1 mb-2";
  let charClassName = "text-2xl font-bold";
  const hintClassName = "text-xs mt-1 text-muted-foreground";

  const hintChar = hiraganaToRomaji[text] || "";

  if (state === "correct") {
    // Character has been typed
    charClassName = twMerge(
      charClassName,
      "text-green-500 dark:text-green-400 bg-green-500/20",
    ); // Correct
  } else if (state === "current") {
    // Current character
    charClassName = twMerge(
      charClassName,
      " bg-primary/20 text-primary border-b-2 border-primary animate-pulse",
    );
  } else if (state == "wrong") {
    charClassName = twMerge(
      charClassName,
      "text-red-500 dark:text-red-400 bg-red-500/20",
    );
  }

  return (
    <div className={className} {...rest}>
      <span className={charClassName}>{text}</span>
      <span className={hintClassName}>{hintChar === " " ? "␣" : hintChar}</span>
    </div>
  );
};

export const App = () => {
  const [currentTest, setCurrentTest] = useAtom(currentTestAtom);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className="w-screen min-h-screen flex flex-col items-center justify-center">
      <Card className="w-[600px]">
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
              onChange={(e) => {
                console.log(e.currentTarget.value);
                setCurrentTest((prev) => ({
                  ...prev,
                  input: e.target.value,
                }));
              }}
            >
              {[...currentTest.text].map((el, idx, test) => {
                const state = (): LetterState["state"] => {
                  if (idx > currentTest.input.length) {
                    return "next";
                  }
                  if (test[idx] === currentTest.input[idx]) {
                    // Character has been typed
                    return "correct";
                  } else if (idx === currentTest.input.length) {
                    // Current character
                    return "current";
                  } else if (test[idx] !== currentTest.input[idx]) {
                    return "wrong";
                  }
                  return "next";
                };
                return <Letter text={el} state={state()} key={idx + el} />;
              })}
            </JapaneseInput>
          </div>
          <pre className="relative min-h-[200px] p-4 rounded-md border bg-muted/50 font-mono text-lg leading-relaxed my-4">
            {JSON.stringify(currentTest, null, 2)}
          </pre>
        </CardContent>
        <CardFooter>
          <p>Card Footer</p>
        </CardFooter>
      </Card>{" "}
    </div>
  );
};
