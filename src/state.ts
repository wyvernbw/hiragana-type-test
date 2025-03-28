import { randomWords } from "@/client/api";
import { atom, ExtractAtomValue } from "jotai";
import { atomWithSuspenseQuery } from "jotai-tanstack-query";
import { atomWithDefault } from "jotai/utils";
import { hiraganaMatch, jpSpace, splitKanaDakuten } from "./lib/hiragana";

type Test = Awaited<ExtractAtomValue<typeof currentTestAtom>>;

export const currentTestAtom = atomWithDefault((get) => {
  const { data: text } = get(textAtom);
  return {
    text: text ?? "",
    input: "",
    pressedEnter: false,
  };
});

export const textAtom = atomWithSuspenseQuery((_get) => ({
  queryKey: ["text"],
  queryFn: async () => await randomWords(10),
}));

export const currentMatchAtom = atom((get) => {
  const test = get(currentTestAtom);
  const idx = Math.max(0, test.input.length - 1);
  return hiraganaMatch(test.input[idx], test.text[idx]);
});

export const nextKeyAtom = atom((get) => {
  const test = get(currentTestAtom);
  const currentMatch = get(currentMatchAtom);
  const idx = Math.max(0, test.input.length);
  if (currentMatch === "partial") {
    const key = splitKanaDakuten(test.text[idx - 1]);
    return key.diacritic;
  }

  if (hiraganaMatch(test.text[idx], jpSpace) === "true") {
    return test.pressedEnter ? jpSpace : "enter";
  }
  const key = splitKanaDakuten(test.text[idx]);
  return key.base;
});

type CommandPaletteState = "open" | "closed";

export const commandPaletteStateAtom = atom<CommandPaletteState>("closed");
export const commandPaletteOpenAtom = atom(
  (get) => get(commandPaletteStateAtom) === "open",
);
