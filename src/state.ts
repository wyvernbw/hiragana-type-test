import { randomWords } from "@/client/api";
import { atom, ExtractAtomValue } from "jotai";
import { atomWithSuspenseQuery } from "jotai-tanstack-query";
import { atomWithDefault, atomWithStorage } from "jotai/utils";
import { hiraganaMatch, jpSpace, splitKanaDakuten } from "./lib/hiragana";

type Test = ExtractAtomValue<typeof currentTestAtom>;

export const settingsAtom = atomWithStorage("settings", {
  wordCount: 5,
});

export const textAtom = atomWithSuspenseQuery((get) => {
  const wordCount = get(settingsAtom).wordCount;
  return {
    queryKey: ["text"],
    queryFn: async () => await randomWords(wordCount),
  };
});

export const currentTestAtom = atomWithDefault((get) => {
  const { data: text } = get(textAtom);
  return {
    errors: 0,
    totalErrors: 0,
    totalKeystrokes: 0,
    text: text ?? "",
    input: "",
    pressedEnter: false,
    startTime: Date.now(),
    endTime: Date.now(),
  };
});

export const updateTestAtom = atom(
  null,
  (get, set, value: (prev: Test) => Partial<Test>) => {
    const state = get(testStateAtom);
    set(currentTestAtom, (prev) => {
      const newValue = value(prev);
      if (!newValue.input) {
        return { ...prev, ...newValue };
      }
      const errors = [...newValue.input].reduce(
        (acc, el, idx) => (el === prev.text[idx] ? acc : acc + 1),
        0,
      );
      return {
        ...prev,
        ...newValue,
        errors,
        totalErrors:
          errors > prev.errors ? prev.totalErrors + 1 : prev.totalErrors,
        totalKeystrokes:
          newValue.input.length > prev.input.length
            ? prev.totalKeystrokes + 1
            : prev.totalKeystrokes,
        startTime:
          prev.input === "" && newValue.input !== ""
            ? Date.now()
            : prev.startTime,
        endTime: Date.now(),
      };
    });
  },
);

export const accuracyAtom = atom((get) => {
  const test = get(currentTestAtom);
  return (
    (Math.max(0, test.totalKeystrokes - test.totalErrors) /
      test.totalKeystrokes) *
    100
  ).toFixed(1);
});

export const timeElapsedAtom = atom((get) => {
  const test = get(currentTestAtom);
  return (test.endTime - test.startTime) / 1000;
});

export const wpmAtom = atom((get) => {
  const test = get(currentTestAtom);
  const time = get(timeElapsedAtom);
  return ((test.totalKeystrokes - test.errors) / 5 / (time / 60)).toFixed(1);
});

export const testStateAtom = atom((get) => {
  const test = get(currentTestAtom);
  if (test.input === "") return "not-started";
  if (test.input.length < test.text.length) return "started";
  // handle dakuon on last letter case
  if (test.input[test.input.length - 1] === test.text[test.text.length - 1]) {
    return "done";
  }
  return "started";
});

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
