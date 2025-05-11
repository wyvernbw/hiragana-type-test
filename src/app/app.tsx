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
import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { decodeLastResult } from "@/server/actions";

export const TypeApp = ({ words }: { words: string[] }) => {
  useHydrateAtoms([[allWordsAtom, words]] as const);

  const hasSubmittedRef = useRef(false);
  const [lastResult] = useAtom(lastResultAtom);
  const [, setLastResult] = useAtom(setLastResultAtom);
  const [savedLastResult] = useAtom(savedLastResultAtom);
  const [userSession] = useAtom(userSessionAtom);
  const [testState] = useAtom(testStateAtom);
  const [result] = useAtom(resultAtom);
  const scoreUpdate = useScoreUpdate();
  const loadDecodedResult = useQuery({
    queryKey: ["decode-last-result", savedLastResult],
    queryFn: async () => {
      console.log("decoding...", savedLastResult);
      if (savedLastResult === "none") {
        return "none";
      }
      const decoded = await decodeLastResult(savedLastResult);
      if (decoded.status === "error") throw new Error(decoded.message);
      return decoded.data;
    },
    refetchOnMount: true,
    refetchInterval: false,
  });

  useEffect(() => {
    console.log("loadDecodeResult ", loadDecodedResult.status);
    if (loadDecodedResult.status === "success") {
      console.log("DECODED: ", loadDecodedResult.data);
      if (loadDecodedResult.data === "none") return;
      if (loadDecodedResult.data.state === "invalid") return;
      if (loadDecodedResult.data.submitted) return;
      if (!userSession) return;
      if (hasSubmittedRef.current) return;
      console.log("updating scores...");
      setLastResult(() => loadDecodedResult.data);

      console.log("[decode] submitting score...");
      hasSubmittedRef.current = true;
      scoreUpdate.mutate({
        result: loadDecodedResult.data,
        session: userSession,
      });
    }
    if (loadDecodedResult.status === "error") {
      console.log(loadDecodedResult.error.message);
    }
  }, [loadDecodedResult.status, userSession]);

  useEffect(() => {
    if (testState === "started") {
      hasSubmittedRef.current = false;
    }
    if (testState === "done") {
      if (result.state === "invalid") return;
      if (hasSubmittedRef.current) return;
      const newRes = {
        wpm: parseFloat(result.wpm),
        acc: parseFloat(result.acc) / 100.0,
        state: "valid",
        submitted: false,
      } as const;
      setLastResult(() => newRes);
      if (userSession) {
        console.log("[test done] submitting score...");
        hasSubmittedRef.current = true;
        scoreUpdate.mutate({
          result: newRes,
          session: userSession,
        });
      }
    }
  }, [testState, userSession]);

  return (
    <>
      <ResultsDrawer />
      <div className="flex h-full flex-col overflow-hidden">
        <JapaneseInput className="my-4 flex h-1/2 rounded-md border p-4 text-lg">
          <LetterList />
        </JapaneseInput>
        <KeyboardPreview className="hidden md:flex" />
      </div>
    </>
  );
};
