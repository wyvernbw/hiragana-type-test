"use client";

import type React from "react";

import { useState, type ChangeEvent, type RefObject } from "react";

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
    <div className="bg-muted/50 relative my-4 max-h-[250px] min-h-[200px] overflow-hidden rounded-md border p-4 font-mono text-lg">
      {label && (
        <label
          className="text-foreground text-sm font-medium"
          htmlFor={props.id}
        >
          {label}
        </label>
      )}
      <div className="absolute top-0 left-0 h-full w-full bg-linear-to-t from-stone-900/2 to-stone-900/0 leading-relaxed dark:from-stone-900/60"></div>
      <input
        disabled={disabled}
        ref={ref}
        className="absolute inset-0 h-full w-full cursor-text opacity-0"
        autoComplete="off"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck="false"
        onChange={handleChange}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        {...props}
      />

      {children}
      {helperText && !error && (
        <p className="text-muted-foreground text-xs">{helperText}</p>
      )}
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
