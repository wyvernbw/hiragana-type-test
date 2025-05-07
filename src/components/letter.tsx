"use client";

import { useEffect, type HTMLAttributes } from "react";
import { hiraganaMatch, hiraganaToRomaji } from "@/lib/hiragana";

import { twMerge } from "tailwind-merge";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  currentTestAtom,
  randomizeRangeAtom,
  settingsAtom,
  textAtom,
} from "@/app/state";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { randomWords } from "@/app/client/api";
import { Skeleton } from "./ui/skeleton";

export type LetterState = {
  text: string;
  state: "correct" | "wrong" | "current" | "next" | "partial";
};

export const Letter = ({
  text,
  state,
  ...rest
}: LetterState & HTMLAttributes<HTMLDivElement>) => {
  const className =
    "inline-flex flex-col items-center justify-center mx-1 mb-2";
  let charClassName = "text-2xl font-bold";
  const hintClassName = "text-xs mt-1 text-muted-foreground";

  const hintChar = hiraganaToRomaji[text] ?? "";

  const styles: Record<LetterState["state"], string> = {
    correct: twMerge(
      charClassName,
      "text-green-500 dark:text-green-400 bg-green-500/20",
    ),
    current: twMerge(
      charClassName,
      " bg-primary/20 text-primary border-b-2 border-primary animate-pulse",
    ),
    wrong: twMerge(
      charClassName,
      "text-red-500 dark:text-red-400 bg-red-500/20",
    ),
    next: twMerge(charClassName, "text-primary font-medium"),
    partial: twMerge(
      charClassName,
      "border-b-2 border-teal-500 animate-pulse text-teal-500 dark:text-teal-500 bg-teal-500/20",
    ),
  };

  charClassName = styles[state];

  return (
    <div className={className} {...rest}>
      <span className={charClassName}>{text}</span>
      <span className={hintClassName}>{hintChar === " " ? "␣" : hintChar}</span>
    </div>
  );
};

export const LetterList = () => {
  const [currentTest] = useAtom(currentTestAtom);
  const [settings] = useAtom(settingsAtom);

  const randomize = useSetAtom(randomizeRangeAtom);
  useEffect(() => {
    randomize();
  }, []);

  const List = () => {
    return (
      <>
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
      </>
    );
  };

  return (
    <div className="h-full w-full">
      {currentTest.text.length === 0 ? (
        <Skeleton className="h-16 w-1/4" />
      ) : (
        <List />
      )}
    </div>
  );
};
