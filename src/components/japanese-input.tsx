"use client";

import type React from "react";

import { useState, useRef, type ChangeEvent, RefObject } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.HTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
  ref?: RefObject<HTMLInputElement | null>;
  disabled?: bool;
}

export default function JapaneseInput({
  disabled = false,
  label,
  helperText,
  error,
  className,
  fullWidth = false,
  value,
  ref,
  onChange,
  children,
  onCompositionEnd,
  ...props
}: InputProps) {
  // We'll still track composition state for potential edge cases
  const [isComposing, setIsComposing] = useState(false);

  // Handle composition start
  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  // Handle composition end
  const handleCompositionEnd = (e) => {
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
    <div className="relative min-h-[200px] p-4 rounded-md border bg-muted/50 font-mono text-lg leading-relaxed my-4">
      {label && (
        <label
          className="text-sm font-medium text-foreground"
          htmlFor={props.id}
        >
          {label}
        </label>
      )}
      <input
        disabled={disabled}
        ref={ref}
        className="absolute inset-0 w-full h-full opacity-0 cursor-text"
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck="false"
        value={value}
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
