"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";

import { cn } from "@/lib/utils";
import { useMediaQuery } from "@uidotdev/usehooks";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { HtmlProps } from "next/dist/shared/lib/html-context.shared-runtime";
import { atom, useAtom } from "jotai";
import { loggedInAtom, testStateAtom, userSessionAtom } from "@/app/state";
import type { Score } from "@/app/score-table-data";
import { DataTable } from "./data-table";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getScores } from "@/server/actions";

type Props = React.HTMLProps<"div"> & {
  trigger?: React.ReactNode;
  scores?: Score[];
};

export const scoreTableOpenAtom = atom(false);

const NotLoggedIn = () => {
  const [loggedIn] = useAtom(loggedInAtom);
  const style = loggedIn ? "hidden" : "";
  return (
    <div className={cn(style, "")}>
      Must be logged in to save and view scores.
    </div>
  );
};

export default function ScoreTable({ trigger, scores }: Props) {
  const [open, setOpen] = useAtom(scoreTableOpenAtom);
  const [userSession] = useAtom(userSessionAtom);
  const [testState] = useAtom(testStateAtom);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const scores2 = scores;
  const scoreQuery = useSuspenseQuery({
    initialData: scores,
    queryKey: ["score-table-query", testState],
    queryFn: async () => {
      if (!userSession) return scores2 ?? [];
      const scores = await getScores(userSession.id, {
        page: 0,
        count: 50,
      }).then((scores) =>
        scores.map(({ id, userId, timestamp, ...score }) => ({
          ...score,
          date: timestamp,
        })),
      );
      return scores;
    },
  });
  console.log(scoreQuery.data.length);

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="sm:max-w-[425px] md:max-h-[500px] md:min-w-[720px]">
          <DialogHeader>
            <DialogTitle>My scores</DialogTitle>
            <DialogDescription>View your past scores.</DialogDescription>
          </DialogHeader>
          <NotLoggedIn />
          {!scores ? "no scores!" : ""}
          {scoreQuery.data && (
            <DataTable columns={columns} data={scoreQuery.data} />
          )}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent className="p-6">
        <DrawerHeader className="text-left">
          <DrawerTitle>My scores</DrawerTitle>
          <DrawerDescription>View your past scores.</DrawerDescription>
        </DrawerHeader>

        <NotLoggedIn />
        {scoreQuery.data && (
          <DataTable columns={columns} data={scoreQuery.data} />
        )}

        <DrawerFooter className="py-4">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

const columns: ColumnDef<Score>[] = [
  {
    accessorKey: "wpm",
    header: "WPM",
  },
  {
    accessorKey: "acc",
    header: "Accuracy",
    cell: ({ row }) => {
      const acc = parseFloat(row.getValue("acc"));
      return (acc * 100).toFixed(2) + "%";
    },
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const date = row.getValue("date") as Date;
      return date.toDateString();
    },
  },
  {
    accessorKey: "time",
    header: "Time",
    cell: ({ row }) => {
      const date = row.getValue("date") as Date;
      return date.toLocaleTimeString();
    },
  },
];
