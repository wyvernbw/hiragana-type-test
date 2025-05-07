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
  accuracyAtom,
  currentTestAtom,
  randomizeRangeAtom,
  resultAtom,
  testStateAtom,
  textAtom,
  wpmAtom,
} from "@/app/state";
import { useResetAtom } from "jotai/utils";
import { useEffect, useRef } from "react";
import { twMerge } from "tailwind-merge";

type Props = React.ComponentProps<typeof Drawer> & {};

export const ResultsDrawer = ({ ...props }: Props) => {
  const resetTest = useResetAtom(currentTestAtom);
  const [currentTest] = useAtom(currentTestAtom);
  const [result] = useAtom(resultAtom);
  const [testState] = useAtom(testStateAtom);
  const randomize = useSetAtom(randomizeRangeAtom);
  useEffect(() => {
    console.log(currentTest);
  }, [currentTest]);
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
      <DrawerContent className="mb-4 flex min-h-1/3 flex-col place-items-center gap-3">
        <DrawerHeader className="place-items-center">
          <DrawerTitle className="flex scroll-m-20 gap-4 text-4xl font-extrabold tracking-tight lg:text-5xl">
            <span className="font-mono">{resultText()}</span> {emoji()}
          </DrawerTitle>
          <DrawerDescription>
            Results for the last typing test.
          </DrawerDescription>
        </DrawerHeader>
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
              <div
                className="flex flex-col place-items-center"
                key={el + "-" + idx}
              >
                <span className="opacity-60">{currentTest.text[idx]}</span>
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
        <DrawerFooter className="flex w-full items-center justify-center">
          <DrawerClose asChild>
            <Button
              className="max-w-[400px] min-w-[200px]"
              onClick={() => reset()}
            >
              Done. Press <code>ENTER</code> to close.
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
