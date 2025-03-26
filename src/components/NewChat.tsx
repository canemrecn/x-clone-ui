"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { chatWithGemini } from "@/utils/gemini";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Message {
  text: string;
  sender: "user" | "bot";
}

interface MessageItemProps {
  msg: Message;
  userAvatar: string;
  botAvatar: string;
}

// Çeviri fonksiyonu: /api/translate endpoint’ine POST isteği gönderir.
const translateWord = async (word: string): Promise<string> => {
  const targetLang = localStorage.getItem("targetLanguage") || "tr";
  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word, targetLang }),
    });
    const data = await res.json();
    return data.translation || `(${targetLang}) Çeviri mevcut değil`;
  } catch (error) {
    console.error("Çeviri hatası:", error);
    return word;
  }
};

const HoverTranslateWord: React.FC<{ word: string }> = ({ word }) => {
  const [translation, setTranslation] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleMouseEnter = async () => {
    setShowTooltip(true);
    if (!translation) {
      const result = await translateWord(word);
      setTranslation(result);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <span
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {word}
      {showTooltip && translation && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gradient-to-br from-gray-800 to-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-10">
          {translation}
        </div>
      )}
    </span>
  );
};

const TranslatableText: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/(\s+)/);
  return (
    <>
      {parts.map((part, idx) =>
        part.trim() === "" ? (
          <span key={idx}>{part}</span>
        ) : (
          <HoverTranslateWord key={idx} word={part} />
        )
      )}
    </>
  );
};

function MessageItem({ msg, userAvatar, botAvatar }: MessageItemProps) {
  const avatar = msg.sender === "user" ? userAvatar : botAvatar;
  const bubbleClass =
    msg.sender === "user"
      ? "self-end bg-gradient-to-br from-blue-800 to-blue-700 text-white"
      : "self-start bg-gradient-to-br from-gray-800 to-gray-700 text-white";
  return (
    <motion.div
      key={msg.text}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className={`mb-4 p-2 rounded shadow min-w-[75%] flex gap-2 ${bubbleClass}`}
    >
      <Image
        src={avatar}
        alt={`${msg.sender} avatar`}
        width={40}
        height={40}
        className="rounded-full border-2 border-gray-300"
      />
      <span>
        <TranslatableText text={msg.text} />
      </span>
    </motion.div>
  );
}

export default function NewChatGemini() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const auth = useAuth();
  const router = useRouter();

  const userAvatar = auth?.user?.profile_image || "/icons/pp.png";
  const botAvatar = "/general/aii.webp";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!inputValue.trim()) return;
    const userMsg: Message = { text: inputValue.trim(), sender: "user" };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const botReply = await chatWithGemini(inputValue.trim());
      const botMsg: Message = { text: botReply, sender: "bot" };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { text: "An error occurred.", sender: "bot" },
      ]);
    }
    setInputValue("");
  }, [inputValue]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <div className="relative h-full">
      {/* Geri butonu: Sabit konumlu - İkon şeklinde */}
      <div className="fixed top-0 left-0 z-50">
        <button onClick={() => router.back()} className="px-5 py-1 rounded">
          <Image src="/icons/left.png" alt="Geri" width={24} height={24} />
        </button>
      </div>
      <div className="absolute top-8 left-0 right-0 bottom-16 bg-gradient-to-br from-gray-800 to-gray-700 p-0 overflow-y-auto">
        <div className="flex flex-col mt-auto">
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <MessageItem
                key={idx}
                msg={msg}
                userAvatar={userAvatar}
                botAvatar={botAvatar}
              />
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-br from-gray-800 to-gray-800 border-t border-gray-300 p-2 flex items-center gap-2">
        <input
          type="text"
          className="flex-1 p-2 rounded-lg bg-gradient-to-br from-gray-800 to-gray-800 text-white outline-none border border-gray-300 focus:border-gray-600"
          placeholder="Type your message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={handleSend}
          className="ml-2 px-4 py-2 bg-gradient-to-br from-gray-800 to-gray-800 text-white rounded-lg border border-gray-300 hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-700 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
