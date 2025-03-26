import { atom, ExtractAtomValue, useAtom, useAtomValue } from "jotai";
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
  jpSpace,
  hiraganaTexts,
  hiraganaToRomaji,
  keyboardLayout,
  romajiToHiragana,
} from "./lib/hiragana";
import { get } from "http";
import { atomWithDefault } from "jotai/utils";
import { twMerge } from "tailwind-merge";
import JapaneseInput from "./components/japanese-input";
import { Keyboard } from "lucide-react";

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
    currentWord: 0,
  };
});

type Test = ExtractAtomValue<typeof currentTestAtom>;

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
              onChange={(e) => {
                console.log(e.currentTarget.value);
                const value = e.currentTarget.value;
                const newWord = () => value[value.length - 1] === jpSpace;
                setCurrentTest((prev) => ({
                  ...prev,
                  input: e.currentTarget.value,
                  currentWord: newWord()
                    ? prev.currentWord + 1
                    : prev.currentWord,
                }));
              }}
            >
              {[...currentTest.text].map((el, idx) => {
                const state = (): LetterState["state"] => {
                  if (idx > currentTest.input.length) {
                    return "next";
                  }
                  if (characterEqual(currentTest.input[idx], el)) {
                    // Character has been typed
                    return "correct";
                  } else if (idx === currentTest.input.length) {
                    // Current character
                    return "current";
                  } else if (!characterEqual(currentTest.input[idx], el)) {
                    return "wrong";
                  }
                  return "next";
                };
                const text = () => {
                  if (state() === "wrong" && idx < currentTest.input.length) {
                    return currentTest.input[idx];
                  }
                  return el;
                };
                return <Letter text={text()} state={state()} key={idx + el} />;
              })}
            </JapaneseInput>
          </div>
          <KeyboardPreview
            nextKey={currentTest.text[currentTest.input.length]}
          />
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

const KeyboardPreview = ({ nextKey }: { nextKey: string }) => {
  return (
    <div className="mt-6 mb-2 flex flex-col">
      <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
        <Keyboard className="h-4 w-4" />
        Keyboard Guide
      </h4>
      <div className="flex flex-col items-center gap-1 max-w-3xl mx-auto">
        {keyboardLayout.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1 w-full justify-center">
            {row.map((keyObj) => {
              const isNextKey = keyObj.hiragana === nextKey;
              const keyWidth = keyObj.key === "space" ? "w-32" : "w-10";

              return (
                <div
                  key={keyObj.key}
                  className={`
                      p-6
                      ${keyWidth} h-12 flex flex-col items-center justify-center rounded border 
                      ${
                        isNextKey
                          ? "bg-primary text-primary-foreground border-primary animate-pulse"
                          : "bg-muted border-input"
                      }
                    `}
                >
                  <span className="font-semibold">
                    {keyObj.hiragana && (
                      <span className="text-sm mt-0.5">{keyObj.hiragana}</span>
                    )}
                  </span>

                  <span className="text-sm">
                    {keyObj.key === "space"
                      ? "Space"
                      : keyObj.key.toUpperCase()}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
const characterEqual = (a: string, b: string) => {
  if (a === " " || a === jpSpace) {
    return b === " " || b === jpSpace;
  }
  if (b === " " || b === jpSpace) {
    return a === " " || a === jpSpace;
  }
  return a === b;
};
