"use client";

import type { HTMLAttributes } from "react";
import { hiraganaToRomaji } from "@/lib/hiragana";

import { twMerge } from "tailwind-merge";

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
