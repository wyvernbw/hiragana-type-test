import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { commandPaletteStateAtom } from "@/state";
import { atom, useAtom } from "jotai";
import { CommandIcon, Moon, Sun } from "lucide-react";

import React from "react";
import { useTheme } from "./theme-provider";

interface Props extends React.ComponentProps<typeof CommandDialog> {}

type Subcommand = "none" | "theme";

const subcommandAtom = atom<Subcommand>("none");

const Palette = ({ children, ...props }: Props) => {
  return (
    <CommandDialog {...props}>
      <Command className="">
        <div className="py-3 px-4 bg-primary font-semibold text-background text-xs flex items-center gap-2 font-mono">
          <div className="flex items-center gap-3 outline-background outline rounded px-2">
            <span className="font-mono">UP</span>
            <span className="flex items-center gap-1">
              <CommandIcon className="w-4"></CommandIcon>K
            </span>
          </div>

          <div className="flex items-center gap-3 outline-background outline rounded px-2">
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
        <CommandGroup heading="Settings">
          <CommandItem
            onSelect={() => {
              console.log("Some theme");
              return setSubcommand("theme");
            }}
          >
            <span>Theme</span>
          </CommandItem>
        </CommandGroup>
      </Palette>

      <ThemeCommand open={isSubcommand("theme")} />
    </>
  );
};

const ThemeCommand = ({ ...props }: Props) => {
  const [subcommand, setSubcommand] = useAtom(subcommandAtom);
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
