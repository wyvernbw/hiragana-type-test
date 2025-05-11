"use client";

import { randomWords } from "@/app/client/api";
import { useSessionRefresh } from "@/app/hooks";
import {
  settingsAtom,
  testStateAtom,
  textAtom,
  updateTestAtom,
} from "@/app/state";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import type React from "react";

import {
  Suspense,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type RefObject,
} from "react";
import { Skeleton } from "./ui/skeleton";
import { twMerge } from "tailwind-merge";

interface InputProps extends React.HTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
  ref?: RefObject<HTMLInputElement | null>;
  disabled?: boolean;
}

export default function JapaneseInput({
  disabled,
  label,
  helperText,
  error,
  className,
  fullWidth = false,
  onChange,
  children,
  onCompositionEnd,
  ...props
}: InputProps) {
  useSessionRefresh();
  // We'll still track composition state for potential edge cases
  const [text, setText] = useAtom(textAtom);
  const [settings] = useAtom(settingsAtom);
  const [, setIsComposing] = useState(false);
  const [, setCurrentTest] = useAtom(updateTestAtom);

  // Handle composition start
  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  // Handle composition end
  const handleCompositionEnd = (
    e: React.CompositionEvent<HTMLInputElement>,
  ) => {
    setIsComposing(false);
    if (onCompositionEnd) {
      onCompositionEnd(e);
    }
  };

  // Handle all input changes - update parent state on every keystroke
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e);
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);
  const [testState] = useAtom(testStateAtom);

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

  return (
    <div
      className={twMerge(
        "relative my-4 overflow-hidden rounded-md border p-4 text-lg",
        className,
      )}
    >
      {label && (
        <label
          className="text-foreground text-sm font-medium"
          htmlFor={props.id}
        >
          {label}
        </label>
      )}
      <div className="absolute top-0 left-0 h-full w-full bg-linear-to-t from-neutral-900/2 to-neutral-900/0 leading-relaxed dark:from-neutral-900/60"></div>
      <input
        disabled={disabled ?? testState === "done"}
        ref={inputRef}
        className="absolute inset-0 h-full w-full cursor-text opacity-0"
        autoComplete="off"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck="false"
        onCompositionStart={handleCompositionStart}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setCurrentTest((prev) => ({
              ...prev,
              pressedEnter: true,
            }));
          }
        }}
        onCompositionEnd={(e) => {
          handleCompositionEnd(e);
          setCurrentTest((prev) => ({
            ...prev,
            pressedEnter: true,
          }));
        }}
        onChange={(e) => {
          handleChange(e);
          const input = e.currentTarget.value;
          console.log(e.currentTarget.value);
          setCurrentTest((prev) => ({
            ...prev,
            input,
            pressedEnter: false,
          }));
        }}
        {...props}
      />

      <Suspense
        fallback={
          <div className="flex flex-col gap-4">
            <Skeleton className="h-full min-h-12 w-full" />
          </div>
        }
      >
        {children}
      </Suspense>
      {helperText && !error && (
        <p className="text-muted-foreground text-xs">{helperText}</p>
      )}
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
