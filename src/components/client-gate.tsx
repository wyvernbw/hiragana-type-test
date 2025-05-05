"use client";
import { isClientAtom } from "@/app/state";
import { useSetAtom } from "jotai";
import { useEffect } from "react";

export const ClientGate = () => {
  const setIsClientAtom = useSetAtom(isClientAtom);
  useEffect(() => {
    setIsClientAtom(true);
  }, []);
  return <></>;
};
