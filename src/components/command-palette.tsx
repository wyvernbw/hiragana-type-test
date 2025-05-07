"use client";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  commandPaletteOpenAtom,
  commandPaletteStateAtom,
  randomizeRangeAtom,
  settingsAtom,
} from "@/app/state";
import { atom, useAtom, useSetAtom } from "jotai";
import { CommandIcon, Moon, Sun } from "lucide-react";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { z } from "zod";
import { Button } from "./ui/button";

type Props = React.ComponentProps<typeof CommandDialog>;

type Subcommand = "none" | "theme" | "word-count";

const subcommandAtom = atom<Subcommand>("none");

const PaletteHeader = () => {
  return (
    <div className="bg-primary text-background flex items-center gap-2 px-4 py-3 font-mono text-xs font-semibold">
      <div className="outline-background flex items-center gap-3 rounded px-2 outline">
        <span className="font-mono">UP</span>
        <span className="flex items-center gap-1">
          <CommandIcon className="w-4"></CommandIcon>K
        </span>
      </div>

      <div className="outline-background flex items-center gap-3 rounded px-2 outline">
        <span className="font-mono">DOWN </span>
        <span className="flex items-center gap-1">
          <CommandIcon className="w-4"></CommandIcon>J
        </span>
      </div>
    </div>
  );
};

const Palette = ({ children, ...props }: Props) => {
  const [, setCommandPaletteState] = useAtom(commandPaletteStateAtom);
  const [commandPaletteOpen] = useAtom(commandPaletteOpenAtom);
  const handleKeydown = (event: KeyboardEvent) => {
    if (
      (event.key === "p" || event.key == "P") &&
      (event.metaKey || event.ctrlKey)
    ) {
      event.preventDefault();

      setCommandPaletteState("open");
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeydown);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, []);
  return (
    <CommandDialog {...props} open={props.open ?? commandPaletteOpen}>
      <Command className="" autoFocus>
        <PaletteHeader />
        <CommandInput placeholder="Type a command or search..." />
        <CommandList className="overflow-hidden">
          <CommandEmpty>No results found.</CommandEmpty>
          {children}
        </CommandList>
      </Command>
    </CommandDialog>
  );
};

export const CommandPalette = ({ open, ...props }: Props) => {
  const [cmdpState, setCommandPaletteState] = useAtom(commandPaletteStateAtom);
  const [subcommand, setSubcommand] = useAtom(subcommandAtom);
  useEffect(() => console.log(subcommand), [subcommand]);
  const isSubcommand = (sc: Subcommand) => subcommand === sc;
  return (
    <>
      <Palette
        {...props}
        onOpenChange={(open) => {
          return setCommandPaletteState(
            open || subcommand !== "none" ? "open" : "closed",
          );
        }}
        open={subcommand === "none" && cmdpState === "open"}
      >
        <CommandGroup heading="Test">
          <CommandItem onSelect={() => setSubcommand("word-count")}>
            <span>Word Count</span>
            <span className="text-primary/50 font-mono">たんごすう</span>
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Settings">
          <CommandItem onSelect={() => setSubcommand("theme")}>
            <span>Theme</span>
            <span className="text-primary/50 font-mono">テーマ</span>
          </CommandItem>
        </CommandGroup>
      </Palette>

      <ThemeCommand open={isSubcommand("theme")} />
      <WordCountCommand open={isSubcommand("word-count")} />
    </>
  );
};

const ThemeCommand = ({ ...props }: Props) => {
  const [, setSubcommand] = useAtom(subcommandAtom);
  const { setTheme } = useTheme();
  return (
    <Palette
      {...props}
      onOpenChange={(open) => {
        if (!open) {
          setSubcommand("none");
        }
      }}
    >
      <CommandGroup heading="Theme">
        <CommandItem onSelect={() => setTheme("light")}>
          <Sun />
          <span>Light</span>
        </CommandItem>
        <CommandItem onSelect={() => setTheme("dark")}>
          <Moon />
          <span>Dark</span>
        </CommandItem>{" "}
      </CommandGroup>
    </Palette>
  );
};

const WordCountCommand = ({ ...props }: Props) => {
  const [, setSubcommand] = useAtom(subcommandAtom);
  const [, setCommandPaletteState] = useAtom(commandPaletteStateAtom);
  const [settings, setSettings] = useAtom(settingsAtom);
  const randomize = useSetAtom(randomizeRangeAtom);
  const schema = z.number().int().min(1).max(100);
  const [inputState, setInputState] = useState(
    schema.safeParse(settings.wordCount),
  );
  const errorStyle = inputState?.error ? "text-destructive font-semibold" : "";
  const setWordCount = (wordCount: number) => {
    setSettings((prev) => ({
      ...prev,
      wordCount,
    }));
    setSubcommand("none");
    setCommandPaletteState("closed");
    randomize();
  };

  return (
    <CommandDialog
      {...props}
      onOpenChange={(open) => {
        if (!open) setSubcommand("none");
      }}
    >
      <Command className="">
        <PaletteHeader />
        <CommandInput
          className={errorStyle}
          placeholder="type any number between 1 and 100."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (inputState.data) {
                setWordCount(inputState.data);
              }
            }
          }}
          onValueChange={(text) => {
            const value = schema.safeParse(parseInt(text.trim()));
            setInputState(value);
          }}
        />
        <CommandList className="overflow-hidden">
          <CommandItem onSelect={() => setWordCount(10)}>10</CommandItem>
          <CommandItem onSelect={() => setWordCount(50)}>50</CommandItem>
          <CommandItem onSelect={() => setWordCount(100)}>100</CommandItem>
        </CommandList>
      </Command>
    </CommandDialog>
  );
};

export const CommandPaletteButton = () => {
  const [, setCommandPaletteState] = useAtom(commandPaletteStateAtom);
  return (
    <Button variant="outline" onClick={() => setCommandPaletteState("open")}>
      <CommandIcon />P
    </Button>
  );
};
