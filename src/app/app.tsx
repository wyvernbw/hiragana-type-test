"use client";

import JapaneseInput from "@/components/japanese-input";
import { KeyboardPreview } from "@/components/keyboard-preview";
import { LetterList } from "@/components/letter";
import { ResultsDrawer } from "@/components/results-drawer";
import { useHydrateAtoms } from "jotai/utils";
import {
  allWordsAtom,
  lastResultAtom,
  lastResultStateAtom,
  resultAtom,
  savedLastResultAtom,
  setLastResultAtom,
  testStateAtom,
  userSessionAtom,
} from "./state";
import { useAtom } from "jotai";
import { useScoreUpdate } from "./hooks";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { decodeLastResult } from "@/server/actions";

export const TypeApp = ({ words }: { words: string[] }) => {
  useHydrateAtoms([[allWordsAtom, words]] as const);
  const [lastResult] = useAtom(lastResultAtom);
  const [, setLastResult] = useAtom(setLastResultAtom);
  const [savedLastResult] = useAtom(savedLastResultAtom);
  const [userSession] = useAtom(userSessionAtom);
  const [testState] = useAtom(testStateAtom);
  const [result] = useAtom(resultAtom);
  const scoreUpdate = useScoreUpdate();
  const loadDecodedResult = useQuery({
    queryKey: ["decode-last-result", lastResult],
    queryFn: async () => {
      const decoded = await decodeLastResult(savedLastResult);
      if (decoded.status === "error")
        throw new Error("error decoding saved result.");
      console.log("DECODED: ", decoded);
      return decoded.data;
    },
    refetchInterval: false,
  });

  useEffect(() => {
    if (loadDecodedResult.status === "success") {
      if (loadDecodedResult.data === "none") return;
      if (loadDecodedResult.data.state === "invalid") return;
      if (loadDecodedResult.data.submitted) return;
      if (!userSession) return;
      scoreUpdate.mutate();
    }
  }, [loadDecodedResult.status, userSession]);

  useEffect(() => {
    if (testState === "done") {
      setLastResult((prev) => {
        if (result.state === "invalid") return prev;
        return {
          wpm: parseFloat(result.wpm),
          acc: parseFloat(result.acc) / 100.0,
          state: "valid",
          submitted: false,
        };
      });
    }
  }, [testState]);

  return (
    <>
      <ResultsDrawer />
      <div className="flex h-full flex-col overflow-hidden">
        <JapaneseInput className="bg-muted/50 my-4 flex h-1/2 rounded-md border p-4 text-lg">
          <LetterList />
        </JapaneseInput>
        <KeyboardPreview className="hidden md:flex" />
      </div>
    </>
  );
};
