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
    <div className={twMerge("mt-6 mb-2 flex flex-col", className)}>
      <h4 className="mb-2 flex items-center gap-2 text-sm">
        <Keyboard className="h-4 w-4" />
        Keyboard Guide
      </h4>
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-2">
        {keyboardLayout.map((row, rowIndex) => (
          <div key={rowIndex} className="flex w-full justify-center gap-2">
            {row.map((keyObj) => {
              const isNextKey =
                hiraganaMatch(nextKey, keyObj.hiragana) === "true";
              const widthStyles: Record<string, string | undefined> = {
                space: "w-48",
                enter: "w-16",
              };
              const keyWidth = widthStyles[keyObj.key] ?? "w-10";
              const spaceHide = keyObj.key === "space" ? "hidden" : "";
              const homeRowStyle =
                keyObj.key === "f" || keyObj.key === "j"
                  ? "font-bold bg-primary/30 text-foreground"
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
        ))}
      </div>
    </div>
  );
};
