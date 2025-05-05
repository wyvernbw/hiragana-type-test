import { useMutation } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { userSessionAtom } from "./state";
import { refreshSession } from "@/server/actions";
import { useEffect } from "react";

export const useSessionRefresh = () => {
  const [userSession, setUserSession] = useAtom(userSessionAtom);
  const sessionMutation = useMutation({
    mutationFn: async () => {
      if (!userSession) {
        return;
      }
      const res = await refreshSession(userSession.id);
      console.log(res);
      if (res === "invalid-id") {
        setUserSession(undefined);
      }
    },
    mutationKey: [userSession?.id ?? ""],
    retry: 3,
  });
  useEffect(() => {
    sessionMutation.mutate();
  }, []);
};
