"use client";
import dynamic from "next/dynamic";

const ScoreTableContent = dynamic(() => import("./score-table"), {
  ssr: false,
});

export default function ScoreTable(
  props: React.ComponentProps<typeof ScoreTableContent>,
) {
  return <ScoreTableContent {...props} />;
}
