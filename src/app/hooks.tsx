import { useMutation } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { lastResultAtom, setLastResultAtom, userSessionAtom } from "./state";
import { addScore, refreshSession } from "@/server/actions";
import { useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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

export const useScoreUpdate = () => {
  const [lastResult] = useAtom(lastResultAtom);
  const [, setLastResult] = useAtom(setLastResultAtom);
  const [userSession] = useAtom(userSessionAtom);
  const mutation = useMutation({
    mutationKey: ["score-update", lastResult],
    retry: 3,
    onMutate: () => {
      toast(
        <div className="flex gap-2">
          <Loader2 className="animate-spin" /> Submitting score...
        </div>,
      );
    },
    onSuccess: () => {
      toast.success("Score submitted.");
    },
    onError: () => {
      toast.error("Error submitting score.");
    },
    mutationFn: async () => {
      if (!userSession) return;
      if (lastResult === "none" || lastResult.state === "invalid") return;
      const res = await addScore({
        sessionId: userSession.id,
        score: {
          ...lastResult,
        },
      });
      // TODO: add toast
      if (!res.data) {
        console.log(res.message);
        throw Error(res.message);
      }
      setLastResult(() => ({
        wpm: res.data.wpm,
        acc: res.data.acc,
        state: "valid",
        submitted: true,
      }));
    },
  });
  return mutation;
};
