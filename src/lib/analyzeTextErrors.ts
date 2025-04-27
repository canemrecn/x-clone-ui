// src/lib/analyzeTextErrors.ts
// Bu dosya, kelime düzeyinde doğru-yanlış analiz yapar ve
// URL, sayı, özel karakter, büyük harf gibi durumları optimize eder.
// src/lib/analyzeTextErrors.ts
// Bu dosya, kelime düzeyinde doğru-yanlış analiz yapar ve
// özel karakter, sayı, URL, contraction (kısaltma) ve büyük harf sorunlarını temizler.
// src/lib/analyzeTextErrors.ts
// Bu dosya, kelime düzeyinde doğru-yanlış analiz yapar ve
// URL, sayı, özel karakter, büyük harf gibi durumları optimize eder.

type AnalyzedWord = {
  original: string;
  isWrong: boolean;
  suggestion: string | null;
};

const contractionWhitelist = [
  "i'm", "you're", "he's", "she's", "it's", "we're", "they're",
  "i've", "you've", "we've", "they've",
  "i'd", "you'd", "he'd", "she'd", "we'd", "they'd",
  "isn't", "aren't", "wasn't", "weren't", "haven't", "hasn't",
  "hadn't", "doesn't", "don't", "didn't", "won't", "wouldn't",
  "shan't", "shouldn't", "mightn't", "mustn't", "needn't",
  "let's", "someone's", "everyone's", "there's", "here's"
];

const timeWords = ["am", "pm", "a.m", "p.m", "a.m.", "p.m."];

export async function analyzeTextErrors(content: string, lang: string) {
  const sentences = content.split(/(?<=[.!?])\s+/);
  const details: {
    analyzedWords: AnalyzedWord[];
    sentenceErrors: number;
  }[] = [];

  const wordsToCheck: string[] = [];
  const wordMap: Map<string, string> = new Map();

  for (const sentence of sentences) {
    const words = sentence.split(/\s+/);
    const analyzedWords: AnalyzedWord[] = [];
    let sentenceErrors = 0;

    for (const word of words) {
      const cleaned = word
        .replace(/[.,!?;:()"`“”‘’—–…%$]/g, "") // ❗ yalnızca gerçekten gereksiz karakterler temizleniyor
        .replace(/\u00A0|\u200B/g, "")           // ❗ görünmeyen boşluk karakterlerini temizliyor
        .trim();

      const wordToCheck = cleaned.toLowerCase();

      const isURL =
        /^https?:\/\/\S+$/i.test(word) ||
        /\w+\.(com|org|net|edu|io|gov|co|uk|tr|info|biz|dev)(\/\S*)?/i.test(word);

      const isContraction = contractionWhitelist.includes(wordToCheck);
      const isTime = timeWords.includes(wordToCheck);

      const isSkipWord =
        !wordToCheck ||
        /^\d+$/.test(wordToCheck) ||
        /\d/.test(wordToCheck) ||
        isURL ||
        isContraction ||
        isTime;

      analyzedWords.push({
        original: word,
        isWrong: false,
        suggestion: null,
      });

      if (isSkipWord) {
        continue;
      }

      wordsToCheck.push(wordToCheck);
      wordMap.set(wordToCheck, word);
    }

    details.push({ analyzedWords, sentenceErrors });
  }

  const uniqueWords = [...new Set(wordsToCheck)];

  const baseUrl = process.env.BASE_URL || "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/daily-words`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ words: uniqueWords }),
  });

  const { results }: { results: { word: string; isCorrect: boolean; suggestion?: string }[] } = await res.json();

  const resultMap = new Map(results.map((r) => [r.word.toLowerCase(), r]));

  let errorTotal = 0;
  let wordTotal = 0;

  for (const sentence of details) {
    for (let i = 0; i < sentence.analyzedWords.length; i++) {
      const wordObj = sentence.analyzedWords[i];
      const key = wordObj.original
        .replace(/[.,!?;:()"`“”‘’—–…%$]/g, "")
        .replace(/\u00A0|\u200B/g, "")
        .trim()
        .toLowerCase();

      if (resultMap.has(key)) {
        const result = resultMap.get(key)!;
        wordObj.isWrong = !result.isCorrect;
        wordObj.suggestion = result.suggestion ?? null;
        if (!result.isCorrect) sentence.sentenceErrors++;
      }

      wordTotal++;
    }

    errorTotal += sentence.sentenceErrors;
  }

  return {
    details,
    errorRate: wordTotal > 0 ? errorTotal / wordTotal : 0,
  };
}
