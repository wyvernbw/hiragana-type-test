import { randomWords } from "@/app/client/api";
import { atom, type ExtractAtomValue } from "jotai";
import { atomWithMutation, atomWithSuspenseQuery } from "jotai-tanstack-query";
import {
  atomWithDefault,
  atomWithStorage,
  createJSONStorage,
  loadable,
} from "jotai/utils";
import { hiraganaMatch, jpSpace, splitKanaDakuten } from "@/lib/hiragana";
import { signObject, type UserSession } from "@/server/actions";
import { connection } from "next/server";
import * as jwt from "jsonwebtoken";
import { z } from "zod";
import {
  useMutation,
  useQuery,
  type UseQueryResult,
} from "@tanstack/react-query";

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]; // copy to avoid mutating the original array
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!]; // swap
  }
  return shuffled;
}

type Test = Awaited<ExtractAtomValue<typeof currentTestAtom>>;

export const settingsAtom = atomWithStorage("settings", {
  wordCount: 5,
});

// export const textAtom = atomWithSuspenseQuery((get) => {
//   const wordCount = get(settingsAtom).wordCount;
//   return {
//     queryKey: ["text", wordCount],
//     queryFn: async (_params) => {
//       console.log("RAN QUERY")
//       return await randomWords(wordCount);
//     },
//   };
// });

export const allWordsAtom = atom([""]);
export const wordRangeAtom = atom({ start: 0, end: 0 });

export const textAtom = atom((get) => {
  const words = get(allWordsAtom);
  const wordCount = get(settingsAtom).wordCount;
  const { start, end } = get(wordRangeAtom);
  if (words.length < wordCount) return words.join(jpSpace);
  return shuffleArray(words.slice(start, end)).join(jpSpace);
});

export const randomizeRangeAtom = atom(null, (get, set) => {
  const words = get(allWordsAtom);
  const wordCount = get(settingsAtom).wordCount;
  const start = Math.floor(Math.random() * (words.length - wordCount));
  const end = start + wordCount;
  set(wordRangeAtom, { start, end });
});

// export const textAtom = atom(async (get) => {
//   await connection();
//   const wordCount = get(settingsAtom).wordCount;
//   const data = await randomWords(wordCount);
//   return { data };
// });

const textAtomLoadable = loadable(textAtom);

export const currentTestAtom = atomWithDefault((get) => {
  const text = get(textAtom);
  const res = {
    errors: 0,
    totalErrors: 0,
    totalKeystrokes: 0,
    input: "",
    pressedEnter: false,
    startTime: 0,
    endTime: 0,
    text: "",
  };
  return {
    ...res,
    text: text,
  };
});

export const updateTestAtom = atom(
  null,
  (get, set, value: (prev: Test) => Partial<Test>) => {
    const text = get(textAtom);
    set(currentTestAtom, (prev) => {
      const newValue = value(prev);
      if (!newValue.input) {
        return { ...prev, ...newValue };
      }
      const res = {
        ...prev,
        ...newValue,
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
      const errors = [...newValue.input].reduce(
        (acc, el, idx) => (el === text[idx] ? acc : acc + 1),
        0,
      );
      return {
        ...res,
        errors,
        totalErrors:
          errors > prev.errors ? prev.totalErrors + 1 : prev.totalErrors,
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
  if (test.input.length == test.text.length) {
    return "done";
  }
  return "started";
});

export const scoreSchema = z.object({
  wpm: z.number().min(1).max(300, { message: "are you even human?" }),
  acc: z.number().min(0.2).max(1.0),
});
export const lastResultSchema = z.literal("none").or(
  z.discriminatedUnion("state", [
    scoreSchema.extend({
      state: z.literal("valid"),
      submitted: z.boolean(),
    }),
    scoreSchema.omit({ wpm: true }).extend({ state: z.literal("invalid") }),
  ]),
);
type LastResult = z.infer<typeof lastResultSchema>;

export const lastResultAtom = atom<LastResult>("none");
export const setLastResultAtom = atom(
  null,
  (get, set, value: (prev: LastResult) => LastResult) => {
    set(lastResultAtom, value(get(lastResultAtom)));
    set(saveLastResultAtom).catch(console.error);
  },
);
export const savedLastResultAtom = atomWithStorage<string>(
  "last-result",
  "none",
);
export const encodeLastResultQueryAtom = atomWithSuspenseQuery((get) => {
  const lastResult = get(lastResultAtom);
  return {
    queryKey: ["save-last-result", lastResult],
    queryFn: async () => {
      if (lastResult === "none") return "none";
      const encoded = await signObject(lastResult);
      return encoded;
    },
  };
});
export const saveLastResultAtom = atom(null, async (get, set) => {
  const encoded = await get(encodeLastResultQueryAtom);
  console.log("saving...", get(lastResultAtom));
  set(savedLastResultAtom, encoded.data ?? "none");
  console.log("saved ", get(savedLastResultAtom));
});
export const lastResultStateAtom = atom((get) => {
  const res = get(lastResultAtom);
  if (res === "none") return "none";
  if (res.state === "invalid") return "invalid";
  return res.submitted ? "submitted" : "unsubmitted";
});

export const resultAtom = atom((get) => {
  const wpm = get(wpmAtom);
  const acc = parseFloat(get(accuracyAtom));
  if (acc < 30.0) return { state: "invalid", acc } as const;
  return {
    state: "valid",
    wpm,
    acc: get(accuracyAtom),
  } as const;
});

export const currentMatchAtom = atom((get) => {
  const test = get(currentTestAtom);
  const idx = Math.max(0, test.input.length - 1);
  if (!test.input[idx]) return "false";
  if (!test.text[idx]) return "false";
  return hiraganaMatch(test.input[idx], test.text[idx]);
});

export const nextKeyAtom = atom((get) => {
  const test = get(currentTestAtom);
  const currentMatch = get(currentMatchAtom);
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
    return test.pressedEnter ? jpSpace : "Enter";
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
  (get, set, value: UserSession | undefined) => {
    const prev = get(userSessionValueAtom);
    if (!value) {
      set(setLastResultAtom, () => "none");
    }
    if (value && prev && value.id !== prev.id) {
      set(setLastResultAtom, () => "none");
    }
    set(userSessionValueAtom, value);
  },
);
export const loggedInAtom = atom(
  async (get) => get(userSessionAtom) !== undefined,
);

