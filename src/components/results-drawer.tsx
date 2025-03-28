import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "./ui/button";
import { useAtom } from "jotai";
import {
  accuracyAtom,
  currentTestAtom,
  testStateAtom,
  textAtom,
  wpmAtom,
} from "@/state";
import { useResetAtom } from "jotai/utils";
import { useEffect } from "react";

type Props = React.ComponentProps<typeof Drawer> & {};

export const ResultsDrawer = ({ ...props }: Props) => {
  const [accuracy] = useAtom(accuracyAtom);
  const resetTest = useResetAtom(currentTestAtom);
  const [currentTest, setCurrentTest] = useAtom(currentTestAtom);
  const [{ refetch, data }] = useAtom(textAtom);
  const [wpm] = useAtom(wpmAtom);
  useEffect(() => {
    console.log(currentTest);
  }, [currentTest]);
  return (
    <Drawer
      {...props}
      onClose={() => {
        resetTest();
        // setCurrentTest({
        //   errors: 0,
        //   totalErrors: 0,
        //   totalKeystrokes: 0,
        //   text: data,
        //   input: "",
        //   pressedEnter: false,
        //   startTime: Date.now(),
        //   endTime: Date.now()
        // });
        refetch();
      }}
    >
      <DrawerContent className="min-h-1/2">
        <DrawerHeader>
          <DrawerTitle className="flex gap-4">
            <span className="font-mono">{accuracy}%</span>
            <span className="font-mono">{wpm}WPM</span>
          </DrawerTitle>
          <DrawerDescription>
            Results for the last typing test.
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-5">Accuracy: {accuracy}%</div>
        <DrawerFooter className="flex justify-center w-full items-center">
          <Button className="max-w-[400px] min-w-[200px]">Done</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
