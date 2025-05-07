"use client";

import JapaneseInput from "@/components/japanese-input";
import { KeyboardPreview } from "@/components/keyboard-preview";
import { LetterList } from "@/components/letter";
import { ResultsDrawer } from "@/components/results-drawer";
import { useHydrateAtoms } from "jotai/utils";
import { allWordsAtom, randomizeRangeAtom } from "./state";
import { useSetAtom } from "jotai";
import { useEffect } from "react";

export const TypeApp = ({ words }: { words: string[] }) => {
  useHydrateAtoms([[allWordsAtom, words]] as const);
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
