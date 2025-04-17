"use client";
import React, { useEffect, useState } from "react";
import { getWords } from "@/lib/getWords";
import { checkGrammar } from "@/lib/checkGrammar";
import { translateSentence } from "@/lib/translateSentence";

const staticCategories = [
  { label: "Subject", words: ["I", "You", "He", "She", "It", "We", "They"] },
  { label: "Verb" },
  { label: "Object" },
  { label: "Manner" },
  { label: "Place", words: ["at home", "in the park", "at school"] },
  { label: "Time", words: ["yesterday", "this morning", "at night", "every day"] },
];

export default function SentenceBuilder() {
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const currentCategoryIndex = selectedWords.length;
  const currentCategory = staticCategories[currentCategoryIndex];

  useEffect(() => {
    const fetchWords = async () => {
      if (!currentCategory || currentCategory.label === "Subject" || currentCategory.words) return;
      setLoading(true);
      const prevWord = selectedWords[selectedWords.length - 1];
      const newWords = await getWords({ step: currentCategory.label, prev: prevWord });
      setAvailableWords(newWords);
      setLoading(false);
    };
    fetchWords();
  }, [selectedWords]);

  const handleWordClick = (word: string) => {
    if (!selectedWords.includes(word)) {
      setSelectedWords([...selectedWords, word]);
    }
  };

  const resetSentence = () => {
    setSelectedWords([]);
    setAvailableWords([]);
  };

  const grammarWarning = checkGrammar(selectedWords);

  const speakSentence = () => {
    const utterance = new SpeechSynthesisUtterance(selectedWords.join(" "));
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="p-6 min-h-screen bg-[#1C1F26] text-white">
      <h1 className="text-2xl font-bold mb-4">Build a Smart Sentence</h1>

      {/* Sentence Display */}
      <div className="mb-6 p-4 bg-gray-100 text-black rounded min-h-[60px] flex flex-wrap gap-2 text-lg">
        {selectedWords.length === 0 ? (
          <span className="text-gray-400 italic">Click to form a sentence...</span>
        ) : (
          selectedWords.map((word, i) => (
            <span key={i} className="bg-[#262E3E] px-3 py-1 rounded border text-white">{word}</span>
          ))
        )}
      </div>

      {/* Translation */}
      {selectedWords.length > 0 && (
        <div className="mb-4 text-center">
          <p className="text-yellow-300 text-lg">English: {selectedWords.join(" ")}</p>
          <p className="text-green-400 text-lg">
            Türkçe: {translateSentence(selectedWords)}
          </p>
        </div>
      )}

      {/* Grammar Warning */}
      {grammarWarning && (
        <div className="mb-4 text-center text-red-400 font-semibold">
          {grammarWarning}
        </div>
      )}

      {/* Text to Speech */}
      {selectedWords.length > 0 && (
        <div className="mt-4 text-center">
          <button
            onClick={speakSentence}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded text-white"
          >
            🔊 Read Sentence Aloud
          </button>
        </div>
      )}

      {/* Word Options */}
      {currentCategory && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">{currentCategory.label}</h2>
          {loading ? (
            <p>Loading suggestions...</p>
          ) : (
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {(currentCategory.words || availableWords).map((word, i) => (
                <li
                  key={i}
                  onClick={() => handleWordClick(word)}
                  className="cursor-pointer bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded"
                >
                  {word}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Reset */}
      <div className="mt-6 text-center">
        <button onClick={resetSentence} className="px-6 py-2 bg-red-500 hover:bg-red-600 rounded text-white">
          Clear Sentence
        </button>
      </div>
    </div>
  );
}
