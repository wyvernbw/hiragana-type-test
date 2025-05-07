"use client";

import { useAtomValue } from "jotai";
import { keyboardLayout, hiraganaMatch } from "@/lib/hiragana";

import { twMerge } from "tailwind-merge";
import { Keyboard, Space } from "lucide-react";
import { nextKeyAtom, textAtom } from "@/app/state";

type InputProps = React.HTMLAttributes<HTMLInputElement> & {};

export const KeyboardPreview = ({ className }: InputProps) => {
  const nextKey = useAtomValue(nextKeyAtom);
  const text = useAtomValue(textAtom);
  return (
    <div className={twMerge("mt-6 mb-2 flex flex-col items-center", className)}>
      <h4 className="mb-2 flex items-center gap-2 text-sm">
        <Keyboard className="h-4 w-4" />
        Keyboard Guide
      </h4>
      <div className="mx-auto flex w-min flex-col gap-2">
        {keyboardLayout.map((row, rowIndex) => {
          const leftMargin: Record<number, string> = {
            0: "ml-8",
            1: "ml-16",
            2: "ml-24",
            4: "justify-center max-w-3/4 ml-24",
          };
          const rowMargin = leftMargin[rowIndex] ?? "";
          return (
            <div
              key={rowIndex}
              className={twMerge("flex w-full gap-2", rowMargin)}
            >
              {row.map((keyObj) => {
                const isNextKey =
                  hiraganaMatch(nextKey, keyObj.hiragana) === "true";
                const widthStyles: Partial<
                  Record<
                    (typeof keyboardLayout)[number][number]["key"],
                    string | undefined
                  >
                > = {
                  space: "w-64",
                  enter: "w-28",
                  shift: "w-32",
                  "\\": "w-20",
                };
                const keyWidth = widthStyles[keyObj.key] ?? "w-10";
                const spaceHide = keyObj.key === "space" ? "hidden" : "";
                const homeRowStyle =
                  keyObj.key === "f" || keyObj.key === "j"
                    ? "font-bold text-foreground outline-white"
                    : "";

                return (
                  <div
                    key={keyObj.key}
                    className={`p-6 outline ${keyWidth} flex h-12 flex-col items-center justify-center rounded-md border transition ${
                      isNextKey
                        ? "bg-primary text-primary-foreground border-primary animate-pulse font-semibold"
                        : "bg-muted border-input"
                    } ${homeRowStyle}`}
                  >
                    <span className={`${isNextKey ? "font-bold" : ""}`}>
                      {keyObj.hiragana && (
                        <span className={twMerge("mt-0.5 text-sm", spaceHide)}>
                          {keyObj.hiragana}
                        </span>
                      )}
                      {keyObj.key === "space" && <Space />}
                    </span>

                    <span className="hidden text-xs">
                      {keyObj.key === "space"
                        ? "Space"
                        : keyObj.key.toUpperCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
