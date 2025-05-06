"use client"

import JapaneseInput from "@/components/japanese-input"
import { KeyboardPreview } from "@/components/keyboard-preview"
import { LetterList } from "@/components/letter"
import { ResultsDrawer } from "@/components/results-drawer"
import { useHydrateAtoms } from "jotai/utils"
import { allWordsAtom, randomizeRangeAtom } from "./state"
import { useSetAtom } from "jotai"
import { useEffect } from "react"

export const TypeApp = ({ words }: { words: string[] }) => {
  useHydrateAtoms([[allWordsAtom, words]] as const);
  return <>
    <ResultsDrawer />
    <div className="">
      <JapaneseInput className="bg-muted/50 relative my-4 flex max-h-[200px] rounded-md border p-4 font-mono text-lg">
        <LetterList />
      </JapaneseInput>
    </div>
    <KeyboardPreview className="hidden md:flex" />
  </>
}
