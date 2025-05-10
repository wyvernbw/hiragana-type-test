"use client";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "./ui/button";
import { useAtom, useSetAtom } from "jotai";
import {
  currentTestAtom,
  lastResultAtom,
  randomizeRangeAtom,
  resultAtom,
  saveLastResultAtom,
  testStateAtom,
  userSessionAtom,
} from "@/app/state";
import { useResetAtom } from "jotai/utils";
import { twMerge } from "tailwind-merge";
import { Check, Loader2, UserIcon, X } from "lucide-react";
import Link from "next/dist/client/link";
import { useScoreUpdate } from "@/app/hooks";

type Props = React.ComponentProps<typeof Drawer> & {};

export const ResultsDrawer = ({ ...props }: Props) => {
  const resetTest = useResetAtom(currentTestAtom);
  const [currentTest] = useAtom(currentTestAtom);
  const [result] = useAtom(resultAtom);
  const [testState] = useAtom(testStateAtom);
  const randomize = useSetAtom(randomizeRangeAtom);

  const reset = async () => {
    resetTest();
    randomize();
  };
  const emoji = () => {
    if (result.state === "invalid") {
      return "";
    }
    const w = parseFloat(result.wpm);
    if (w <= 20) return "👺";
    if (w > 20 && w < 100) return "🥶";
    if (w > 100) return "🥳";
  };

  const resultText = () => {
    if (result.state === "invalid") return "INVALID";
    return result.wpm + " WPM";
  };

  return (
    <Drawer
      {...props}
      open={props.open ?? testState === "done"}
      onClose={reset}
      autoFocus
    >
      <DrawerContent className="px-1/2 mb-4 flex min-h-1/2 flex-col items-center gap-4">
        <div className="flex w-1/2 grow flex-col gap-4">
          <DrawerHeader className="grow-0 px-0">
            <DrawerTitle className="flex scroll-m-20 gap-4 text-4xl font-extrabold tracking-tight lg:text-5xl">
              <span className="font-mono">{resultText()}</span> {emoji()}
            </DrawerTitle>
            <DrawerDescription>
              Results for the last typing test.
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex w-full grow flex-col gap-4">
            <SavingResult />
            <section>
              <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                <code> Accuracy: {result.acc}%</code>
              </h3>
              <div className="flex max-w-1/2 flex-wrap gap-2 overflow-scroll text-lg">
                {[...currentTest.input].map((el, idx) => {
                  const styles = {
                    wrong: "text-rose-500",
                    correct: "",
                  };

                  return (
                    <div className="flex flex-col" key={el + "-" + idx}>
                      <span className="opacity-60">
                        {currentTest.text[idx]}
                      </span>
                      <span
                        className={twMerge(
                          el === currentTest.text[idx]
                            ? styles.correct
                            : styles.wrong,
                        )}
                      >
                        {el}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
          <DrawerFooter className="flex w-full grow-0 px-0">
            <DrawerClose asChild>
              <Button className="w-full" onClick={() => reset()} autoFocus>
                Done. Press <code>ENTER</code> to close.
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

const SavingResult = () => {
  const [userSession] = useAtom(userSessionAtom);
  const [result] = useAtom(resultAtom);
  const scoreUpdate = useScoreUpdate();
  if (!userSession) {
    return (
      <div className="flex items-center gap-4">
        Must be logged in to save result.
        <Link href="/login">
          <Button className="h-full cursor-pointer">
            <UserIcon />
            Login
          </Button>
        </Link>
      </div>
    );
  }
  if (result.state === "invalid") return "";
  if (scoreUpdate.isPending) {
    return (
      <div className="flex items-center gap-4">
        Submitting score...
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  if (scoreUpdate.isSuccess || scoreUpdate.isIdle) {
    return (
      <div className="flex items-center gap-4">
        Score submitted. <Check />
      </div>
    );
  }
  return (
    <div className="flex items-center gap-4 text-rose-500">
      Error submitting score.
      <X />
    </div>
  );
};
