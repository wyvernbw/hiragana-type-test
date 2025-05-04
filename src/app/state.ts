import { randomWords } from "@/app/client/api";
import { atom, type ExtractAtomValue } from "jotai";
import { atomWithSuspenseQuery } from "jotai-tanstack-query";
import { atomWithDefault, atomWithStorage } from "jotai/utils";
import { hiraganaMatch, jpSpace, splitKanaDakuten } from "@/lib/hiragana";
import { querySession, type UserSession } from "@/server/actions";

type Test = Awaited<ExtractAtomValue<typeof currentTestAtom>>;

export const settingsAtom = atomWithStorage("settings", {
  wordCount: 5,
});

export const textAtom = atomWithSuspenseQuery((get) => {
  const wordCount = get(settingsAtom).wordCount;
  return {
    queryKey: ["text", wordCount],
    queryFn: async (_params) => {
      return await randomWords(wordCount);
    },
  };
});

export const currentTestAtom = atomWithDefault(async (get) => {
  const { data: text } = await get(textAtom);
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
  (_get, set, value: (prev: Test) => Partial<Test>) => {
    set(currentTestAtom, async (prevPromise) => {
      const prev = await prevPromise;
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

export const accuracyAtom = atom(async (get) => {
  const test = await get(currentTestAtom);
  return (
    (Math.max(0, test.totalKeystrokes - test.totalErrors) /
      test.totalKeystrokes) *
    100
  ).toFixed(1);
});

export const timeElapsedAtom = atom(async (get) => {
  const test = await get(currentTestAtom);
  return (test.endTime - test.startTime) / 1000;
});

export const wpmAtom = atom(async (get) => {
  const test = await get(currentTestAtom);
  const time = await get(timeElapsedAtom);
  return ((test.totalKeystrokes - test.errors) / 5 / (time / 60)).toFixed(1);
});

export const testStateAtom = atom(async (get) => {
  const test = await get(currentTestAtom);
  if (test.input === "") return "not-started";
  if (test.input.length < test.text.length) return "started";
  // handle dakuon on last letter case
  if (test.input.endsWith(test.text, test.text.length - 1)) {
    return "done";
  }
  return "started";
});

export const currentMatchAtom = atom(async (get) => {
  const test = await get(currentTestAtom);
  const idx = Math.max(0, test.input.length - 1);
  if (!test.input[idx]) return "false";
  if (!test.text[idx]) return "false";
  return hiraganaMatch(test.input[idx], test.text[idx]);
});

export const nextKeyAtom = atom(async (get) => {
  const test = await get(currentTestAtom);
  const currentMatch = await get(currentMatchAtom);
  const idx = Math.max(0, test.input.length);
  const current = test.text[idx];
  if (!current) return "";
  if (currentMatch === "partial") {
    const prev = test.text[idx - 1];
    if (prev) {
      const key = splitKanaDakuten(prev);
      return key.diacritic;
    }
  }

  if (hiraganaMatch(current, jpSpace) === "true") {
    return test.pressedEnter ? jpSpace : "enter";
  }
  const key = splitKanaDakuten(current);
  return key.base;
});

type CommandPaletteState = "open" | "closed";

export const commandPaletteStateAtom = atom<CommandPaletteState>("closed");
export const commandPaletteOpenAtom = atom(
  (get) => get(commandPaletteStateAtom) === "open",
);

export const userSessionValueAtom = atomWithStorage<undefined | UserSession>(
  "auth-session",
  undefined,
);
export const userSessionAtom = atom(
  (get) => get(userSessionValueAtom),
  (_get, set, value: UserSession | undefined) => {
    set(userSessionValueAtom, value);
  },
);
export const loggedInAtom = atom(
  async (get) => get(userSessionAtom) !== undefined,
);
