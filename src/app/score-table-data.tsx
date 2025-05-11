import ScoreTable from "@/components/score-table-wrapper";
import { getScores } from "@/server/actions";
import { cookies } from "next/headers";
import { z } from "zod";

export type Score = {
  date: Date;
  wpm: number;
  acc: number;
};

export default async function ScoreTableData() {
  const sessionId = await cookies()
    .then((c) => c.get("sessionId"))
    .then((id) => z.string().nanoid().safeParse(id?.value));
  if (!sessionId.data) return <ScoreTable />;
  const scores = await getScores(sessionId.data, { page: 0, count: 50 }).then(
    (scores) =>
      scores.map(({ id, userId, timestamp, ...score }) => ({
        ...score,
        date: timestamp,
      })),
  );
  return <ScoreTable scores={scores} />;
}
