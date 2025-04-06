//src/components/GeminiChat.tsx
/*Bu dosya, kullanıcıyla yapay zekâ arasında sohbet etmeyi sağlayan GeminiChat bileşenini tanımlar; kullanıcı mesajlarını alır, yapay zekâya 
(chatWithGemini) gönderir ve cevapları kullanıcıya gösterir. Mesajlardaki her kelime üzerine gelindiğinde çeviri yapan araç ipuçları (tooltip) 
sunar. Sohbet penceresi minimize edilebilir ve masaüstü köşesine sabitlenmiş olarak görüntülenebilir. Görsel olarak kullanıcı ve bot mesajları 
farklı konum ve stillerle gösterilir, animasyonlar ve framer-motion ile geçiş efektleri eklenmiştir.*/
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import Image from "next/image";
import { chatWithGemini } from "@/utils/gemini";
import { useAuth } from "@/context/AuthContext";

// Çeviri fonksiyonu: /api/translate endpoint’ine POST isteği gönderir.
const translateWord = async (word: string): Promise<string> => {
  const targetLang = localStorage.getItem("targetLanguage") || "tr";
  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // HTTP‑only çerezlerin gönderilmesi için
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

interface Message {
  text: string;
  sender: "user" | "bot";
}

const GeminiChatContent = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const auth = useAuth();

  const handleSendMessage = useCallback(async () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { text: input, sender: "user" }]);
    const botReply = await chatWithGemini(input);
    setMessages((prev) => [...prev, { text: botReply, sender: "bot" }]);
    setInput("");
    inputRef.current?.focus();
  }, [input]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-gray-800 to-gray-700 text-white">
      <div className="flex flex-col flex-1 p-5 overflow-y-auto bg-gradient-to-br from-gray-800 to-gray-700">
        {messages.map((msg, index) => {
          const userAvatar = auth?.user?.profile_image || "/icons/pp.png";
          const botAvatar = "/general/aii.webp";
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: msg.sender === "user" ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className={`flex items-start gap-3 p-3 rounded-lg max-w-[75%] ${
                msg.sender === "user"
                  ? "self-end flex-row-reverse bg-gradient-to-br from-gray-800 to-gray-800 text-white"
                  : "self-start bg-gradient-to-br from-gray-800 to-gray-800 text-white"
              } shadow-md`}
            >
              <Image
                src={msg.sender === "user" ? userAvatar : botAvatar}
                alt="Avatar"
                width={40}
                height={40}
                className="rounded-full border-2 border-gray-300"
              />
              <div>
                <TranslatableText text={msg.text} />
              </div>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-2 flex items-center">
        <input
          ref={inputRef}
          type="text"
          className="flex-1 p-2 rounded-lg bg-gradient-to-br from-gray-800 to-gray-700 text-white outline-none border border-gray-300 focus:border-gray-600"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={handleSendMessage}
          className="ml-2 px-4 py-2 bg-gradient-to-br from-gray-800 to-gray-700 text-white rounded-lg border border-gray-300 hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-700 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
};

const GeminiChat = ({ onClose }: { onClose?: () => void }) => {
  const [isMinimized, setIsMinimized] = useState(false);

  const handleMinimize = useCallback(() => {
    setIsMinimized((prev) => !prev);
  }, []);

  const MinimizedBar = () => (
    <div
      onClick={() => setIsMinimized(false)}
      className="fixed z-[9999] bottom-0 right-4 w-48 h-12 bg-gradient-to-br from-gray-800 to-gray-700 text-white flex items-center justify-center cursor-pointer rounded-t-lg shadow-lg border border-gray-300 hover:text-gray-300 transition"
    >
      <span className="font-bold">Chat AI</span>
    </div>
  );

  const FullChatWindow = () => (
    <div className="fixed z-[9999] bottom-0 right-4 w-96 border border-gray-300 rounded-lg bg-gradient-to-br from-gray-800 to-gray-700 text-white shadow-lg flex flex-col h-[500px]">
      <div className="flex justify-between items-center bg-gradient-to-br from-gray-800 to-gray-700 text-white p-2 rounded-t-lg w-full">
        <span className="font-bold">Chat AI</span>
        <div className="flex gap-2">
          <button onClick={handleMinimize} className="text-white hover:text-gray-300 transition">
            —
          </button>
          <button onClick={onClose} className="text-red-400 hover:text-red-600 transition">
            ✖
          </button>
        </div>
      </div>
      <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-800 to-gray-700 p-2 rounded-b-lg">
        <GeminiChatContent />
      </div>
    </div>
  );

  return createPortal(
    isMinimized ? <MinimizedBar /> : <FullChatWindow />,
    document.body
  );
};

export default GeminiChat;
