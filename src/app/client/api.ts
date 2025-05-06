import { jpSpace } from "@/lib/hiragana";
import { z } from "zod";

const wordListSchema = z.object({
  words: z.array(z.string()),
});

export const randomWords = async (count: number) => {
  const res = await fetch(
    "https://raw.githubusercontent.com/monkeytypegame/monkeytype/refs/heads/master/frontend/static/languages/japanese_hiragana.json", { cache: "no-store"}
  )
    .then((res) => res.json())
    .then((res) => wordListSchema.parse(res));
  const words = [...Array<number>(count)]
    .map((_) => {
      const idx = Math.floor(Math.random() * (res.words.length - 1));
      return res.words[idx];
    })
    .join(jpSpace);
  console.log(words);
  return words;
};
