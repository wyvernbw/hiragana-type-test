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
import { useAtom } from "jotai";
import { ChevronDown, ChevronUp, CommandIcon } from "lucide-react";

import React from "react";

interface Props extends React.ComponentProps<typeof CommandDialog> {}

export const CommandPalette = ({ ...props }: Props) => {
  const [, setCommandPaletteState] = useAtom(commandPaletteStateAtom);
  return (
    <CommandDialog
      {...props}
      onOpenChange={(open) => {
        return setCommandPaletteState(open ? "open" : "closed");
      }}
    >
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
          <CommandGroup heading="Settings">
            <CommandItem>
              <span>Calendar</span>
            </CommandItem>
            <CommandItem>
              <span>Search Emoji</span>
            </CommandItem>
            <CommandItem>
              <span>Calculator</span>
            </CommandItem>
            <CommandItem>
              <span>Profile</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <span>Billing</span>
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <span>Settings</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>{" "}
      </Command>
    </CommandDialog>
  );
};
