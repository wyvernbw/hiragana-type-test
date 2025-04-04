"use client";

import type React from "react";

import { useState, type ChangeEvent, RefObject } from "react";

interface InputProps extends React.HTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
  ref?: RefObject<HTMLInputElement | null>;
  disabled?: boolean;
}

export default function JapaneseInput({
  disabled = false,
  label,
  helperText,
  error,
  className,
  fullWidth = false,
  ref,
  onChange,
  children,
  onCompositionEnd,
  ...props
}: InputProps) {
  // We'll still track composition state for potential edge cases
  const [, setIsComposing] = useState(false);

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

  return (
    <div className="relative min-h-[200px] max-h-[250px] overflow-hidden p-4 rounded-md border bg-muted/50 font-mono text-lg my-4">
      {label && (
        <label
          className="text-sm font-medium text-foreground"
          htmlFor={props.id}
        >
          {label}
        </label>
      )}
      <div className="w-full h-full absolute top-0 left-0 bg-linear-to-t from-stone-900/2  dark:from-stone-900/60 to-stone-900/0 leading-relaxed"></div>
      <input
        disabled={disabled}
        ref={ref}
        className="absolute inset-0 w-full h-full opacity-0 cursor-text"
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck="false"
        onChange={handleChange}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        {...props}
      />

      {children}
      {helperText && !error && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
