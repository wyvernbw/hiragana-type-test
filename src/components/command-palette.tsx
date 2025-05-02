import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { commandPaletteStateAtom, settingsAtom } from "@/app/state";
import { atom, useAtom } from "jotai";
import { CommandIcon, Moon, Sun } from "lucide-react";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { z } from "zod";

interface Props extends React.ComponentProps<typeof CommandDialog> {}

type Subcommand = "none" | "theme" | "word-count";

const subcommandAtom = atom<Subcommand>("none");

const Palette = ({ children, ...props }: Props) => {
  return (
    <CommandDialog {...props}>
      <Command className="">
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
  const [, setCommandPaletteState] = useAtom(commandPaletteStateAtom);
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
        open={open && subcommand === "none"}
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
  const schema = z.number().int().min(1).max(100);
  const [inputState, setInputState] = useState(
    schema.safeParse(settings.wordCount),
  );
  const errorStyle = inputState?.error ? "text-destructive font-semibold" : "";

  return (
    <CommandDialog
      {...props}
      onOpenChange={(open) => {
        if (!open) setSubcommand("none");
      }}
    >
      <Command className="">
        <CommandInput
          className={errorStyle}
          placeholder="type a number"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (inputState.data) {
                setSettings((prev) => ({
                  ...prev,
                  wordCount: inputState.data,
                }));
                setSubcommand("none");
                setCommandPaletteState("closed");
              }
            }
          }}
          onValueChange={(text) => {
            const value = schema.safeParse(parseInt(text.trim()));
            setInputState(value);
          }}
        />
      </Command>
    </CommandDialog>
  );
};
