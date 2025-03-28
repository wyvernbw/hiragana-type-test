import { useAtomValue } from "jotai";
import { keyboardLayout, hiraganaMatch } from "@/lib/hiragana";

import { twMerge } from "tailwind-merge";
import { Keyboard, Space } from "lucide-react";
import { nextKeyAtom } from "@/state";

interface InputProps extends React.HTMLAttributes<HTMLInputElement> {}

export const KeyboardPreview = ({ className }: InputProps) => {
  const nextKey = useAtomValue(nextKeyAtom);
  return (
    <div className={twMerge("mt-6 mb-2 flex flex-col", className)}>
      <h4 className="text-sm flex items-center gap-2 mb-2">
        <Keyboard className="h-4 w-4" />
        Keyboard Guide
      </h4>
      <div className="flex flex-col items-center gap-2 max-w-3xl mx-auto">
        {keyboardLayout.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-2 w-full justify-center">
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
                  ? "font-bold bg-primary text-background"
                  : "";

              return (
                <div
                  key={keyObj.key}
                  className={`
                      p-6 outline
                      ${keyWidth} h-12 flex flex-col items-center justify-center rounded-md border 
                      ${
                        isNextKey
                          ? "bg-primary font-semibold text-primary-foreground border-primary animate-pulse"
                          : "bg-muted border-input"
                      } 
                      ${homeRowStyle}
                    `}
                >
                  <span className={`${isNextKey ? "font-bold" : ""}`}>
                    {keyObj.hiragana && (
                      <span className={twMerge("text-sm mt-0.5", spaceHide)}>
                        {keyObj.hiragana}
                      </span>
                    )}
                    {keyObj.key === "space" && <Space />}
                  </span>

                  <span className="text-xs hidden">
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
