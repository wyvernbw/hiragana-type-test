// Hiragana sample texts with their meanings
export const hiraganaTexts = [
  {
    text: "で こんにちは わたしの なまえは たなかです",
    meaning: "Hello, my name is Tanaka.",
  },
  // {
  // 	text: 'にほんごを べんきょうしています',
  // 	meaning: 'I am studying Japanese.',
  // },
  // {
  // 	text: 'あしたは あめが ふるでしょう',
  // 	meaning: 'It will probably rain tomorrow.',
  // },
  // {
  // 	text: 'さくらの はなが きれいです',
  // 	meaning: 'The cherry blossoms are beautiful.',
  // },
  // {
  // 	text: 'わたしは すしが だいすきです',
  // 	meaning: 'I love sushi.',
  // },
];

export const jpSpace = "　";

// Hiragana to romaji mapping
export const hiraganaToRomaji: Record<string, string> = {
  あ: "a",
  い: "i",
  う: "u",
  え: "e",
  お: "o",
  か: "ka",
  き: "ki",
  く: "ku",
  け: "ke",
  こ: "ko",
  さ: "sa",
  し: "shi",
  す: "su",
  せ: "se",
  そ: "so",
  た: "ta",
  ち: "chi",
  つ: "tsu",
  て: "te",
  と: "to",
  な: "na",
  に: "ni",
  ぬ: "nu",
  ね: "ne",
  の: "no",
  は: "ha",
  ひ: "hi",
  ふ: "fu",
  へ: "he",
  ほ: "ho",
  ま: "ma",
  み: "mi",
  む: "mu",
  め: "me",
  も: "mo",
  や: "ya",
  ゆ: "yu",
  よ: "yo",
  ら: "ra",
  り: "ri",
  る: "ru",
  れ: "re",
  ろ: "ro",
  わ: "wa",
  を: "wo",
  ん: "n",
  が: "ga",
  ぎ: "gi",
  ぐ: "gu",
  げ: "ge",
  ご: "go",
  ざ: "za",
  じ: "ji",
  ず: "zu",
  ぜ: "ze",
  ぞ: "zo",
  だ: "da",
  ぢ: "ji",
  づ: "zu",
  で: "de",
  ど: "do",
  ば: "ba",
  び: "bi",
  ぶ: "bu",
  べ: "be",
  ぼ: "bo",
  ぱ: "pa",
  ぴ: "pi",
  ぷ: "pu",
  ぺ: "pe",
  ぽ: "po",
  きゃ: "kya",
  きゅ: "kyu",
  きょ: "kyo",
  しゃ: "sha",
  しゅ: "shu",
  しょ: "sho",
  ちゃ: "cha",
  ちゅ: "chu",
  ちょ: "cho",
  にゃ: "nya",
  にゅ: "nyu",
  にょ: "nyo",
  ひゃ: "hya",
  ひゅ: "hyu",
  ひょ: "hyo",
  みゃ: "mya",
  みゅ: "myu",
  みょ: "myo",
  りゃ: "rya",
  りゅ: "ryu",
  りょ: "ryo",
  ぎゃ: "gya",
  ぎゅ: "gyu",
  ぎょ: "gyo",
  じゃ: "ja",
  じゅ: "ju",
  じょ: "jo",
  びゃ: "bya",
  びゅ: "byu",
  びょ: "byo",
  ぴゃ: "pya",
  ぴゅ: "pyu",
  ぴょ: "pyo",
  っ: "", // Small tsu - doubles the following consonant
  " ": " ", // Space
  "　": " ", // Japanese space
};

// Romaji to hiragana mapping (for keyboard layout visualization)
export const romajiToHiragana: Record<string, string> = Object.entries(
  hiraganaToRomaji,
).reduce(
  (acc, [hiragana, romaji]) => {
    acc[romaji] = hiragana;
    return acc;
  },
  {} as Record<string, string>,
);

// Function to convert hiragana text to romaji
export const hiraganaToRomajiText = (text: string): string => {
  let romaji = "";
  let i = 0;

  while (i < text.length) {
    // Check for small tsu (っ) which doubles the next consonant
    if (text[i] === "っ" && i + 1 < text.length) {
      const nextChar = text[i + 1];
      const nextRomaji = hiraganaToRomaji[nextChar] || "";
      if (nextRomaji && nextRomaji.length > 0) {
        romaji += nextRomaji[0]; // Add the first consonant
      }
      i++;
      continue;
    }

    // Check for compound characters (e.g., きゃ, しゅ)
    if (i + 1 < text.length) {
      const compound = text.substring(i, i + 2);
      if (hiraganaToRomaji[compound]) {
        romaji += hiraganaToRomaji[compound];
        i += 2;
        continue;
      }
    }

    // Regular single character
    romaji += hiraganaToRomaji[text[i]] || text[i];
    i++;
  }

  return romaji;
};

// Keyboard layout definition with hiragana mappings
export const keyboardLayout = [
  [
    { key: "1", hiragana: "ぬ" },
    { key: "2", hiragana: "ふ" },
    { key: "3", hiragana: "あ" },
    { key: "4", hiragana: "う" },
    { key: "5", hiragana: "え" },
    { key: "6", hiragana: "お" },
    { key: "7", hiragana: "や" },
    { key: "8", hiragana: "ゆ" },
    { key: "9", hiragana: "よ" },
    { key: "0", hiragana: "わ" },
    { key: "-", hiragana: "ほ" },
    { key: "=", hiragana: "へ" },
  ],
  [
    { key: "q", hiragana: "た" },
    { key: "w", hiragana: "て" },
    { key: "e", hiragana: "い" },
    { key: "r", hiragana: "す" },
    { key: "t", hiragana: "か" },
    { key: "y", hiragana: "ん" },
    { key: "u", hiragana: "な" },
    { key: "i", hiragana: "に" },
    { key: "o", hiragana: "ら" },
    { key: "p", hiragana: "せ" },
    { key: "[", hiragana: "゛" },
    { key: "]", hiragana: "゜" },
    { key: "\\", hiragana: "む" },
  ],
  [
    { key: "a", hiragana: "ち" },
    { key: "s", hiragana: "と" },
    { key: "d", hiragana: "し" },
    { key: "f", hiragana: "は" },
    { key: "g", hiragana: "き" },
    { key: "h", hiragana: "く" },
    { key: "j", hiragana: "ま" },
    { key: "k", hiragana: "の" },
    { key: "l", hiragana: "り" },
    { key: ";", hiragana: "れ" },
    { key: "'", hiragana: "け" },
    { key: "enter", hiragana: "enter" },
  ],
  [
    { key: "z", hiragana: "つ" },
    { key: "x", hiragana: "さ" },
    { key: "c", hiragana: "そ" },
    { key: "v", hiragana: "ひ" },
    { key: "b", hiragana: "こ" },
    { key: "n", hiragana: "み" },
    { key: "m", hiragana: "も" },
    { key: ",", hiragana: "ね" },
    { key: ".", hiragana: "る" },
    { key: "/", hiragana: "め" },
  ],
  [{ key: "space", hiragana: "　" }],
];

type KanaSplitResult = {
  base: string;
  diacritic: "゛" | "゜" | "";
};

export function splitKanaDakuten(kana: string): KanaSplitResult {
  const dakutenMap: Record<string, string> = {
    が: "か",
    ぎ: "き",
    ぐ: "く",
    げ: "け",
    ご: "こ",
    ざ: "さ",
    じ: "し",
    ず: "す",
    ぜ: "せ",
    ぞ: "そ",
    だ: "た",
    ぢ: "ち",
    づ: "つ",
    で: "て",
    ど: "と",
    ば: "は",
    び: "ひ",
    ぶ: "ふ",
    べ: "へ",
    ぼ: "ほ",
  };

  const handakutenMap: Record<string, string> = {
    ぱ: "は",
    ぴ: "ひ",
    ぷ: "ふ",
    ぺ: "へ",
    ぽ: "ほ",
  };

  if (dakutenMap[kana]) {
    return { base: dakutenMap[kana], diacritic: "゛" };
  } else if (handakutenMap[kana]) {
    return { base: handakutenMap[kana], diacritic: "゜" };
  } else {
    return { base: kana, diacritic: "" };
  }
}
