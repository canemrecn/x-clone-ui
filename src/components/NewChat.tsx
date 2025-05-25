//src/components/NewChat.tsx
/*Bu dosya, kullanıcı ile Gemini yapay zekası arasında sohbet etmeyi sağlayan bir sohbet arayüzü (NewChatGemini bileşeni) oluşturur; kullanıcıdan 
metin girişi alır, gönderilen mesajları ve bot yanıtlarını animasyonlu olarak ekranda gösterir, her kelime üzerine gelindiğinde anlık çeviri 
balonu sunar, mesajları kullanıcı ve bot avatarlarıyla birlikte sıralar, mobil uyumludur ve mesajları otomatik kaydırarak güncel tutar.*/
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

const translateWord = async (word: string): Promise<string> => {
  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word, targetLang: "tr" }),
      credentials: "include",
    });
    const data = await res.json();
    return data.translation || word;
  } catch {
    return word;
  }
};

const HoverTranslateWord = ({ word }: { word: string }) => {
  const [translation, setTranslation] = useState<string | null>(null);
  const [show, setShow] = useState(false);

  const handleMouseEnter = async () => {
    setShow(true);
    if (!translation) {
      const t = await translateWord(word);
      setTranslation(t);
    }
  };

  return (
    <span
      className="relative group inline-block mx-[2px]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShow(false)}
    >
      {word}
      {show && translation && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded shadow z-50 whitespace-nowrap">
          {translation}
        </div>
      )}
    </span>
  );
};

const TranslatableText = ({ text }: { text: string }) => {
  const parts = text.split(/(\s+)/);
  return (
    <>
      {parts.map((part, i) =>
        part.trim() === "" ? <span key={i}>{part}</span> : <HoverTranslateWord key={i} word={part} />
      )}
    </>
  );
};

const MessageBubble = ({
  msg,
  avatar,
  isUser,
}: {
  msg: Message;
  avatar: string;
  isUser: boolean;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      transition={{ duration: 0.3 }}
      className={`w-full flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
    >
      <div className={`flex items-start gap-2 max-w-[75%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        <Image src={avatar} alt="Avatar" width={36} height={36} className="rounded-full border border-gray-600 shadow" />
        <div
          className={`px-4 py-2 rounded-xl text-sm shadow-lg whitespace-pre-wrap ${
            isUser ? "bg-blue-600 text-white" : "bg-gray-800 text-white"
          }`}
        >
          <TranslatableText text={msg.text} />
        </div>
      </div>
    </motion.div>
  );
};

export default function NewChatGemini() {
  const auth = useAuth();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");

  const userAvatar = auth?.user?.profile_image || "/icons/pp.png";
  const botAvatar = "/general/aii.webp";

  const sendMessage = useCallback(async () => {
    const text = inputValue.trim();
    if (!text) return;

    const userMsg: Message = { text, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");

    try {
      const reply = await chatWithGemini(text);
      const botMsg: Message = { text: reply, sender: "bot" };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { text: "Bot cevap veremedi.", sender: "bot" },
      ]);
    }
  }, [inputValue]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="relative flex flex-col h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Geri Dön Butonu */}
      <div className="fixed top-4 left-4 z-50">
        <button onClick={() => router.back()} className="hover:scale-110 transition">
          <Image src="/icons/left.png" alt="Geri" width={30} height={30} />
        </button>
      </div>

      {/* Mesajlar */}
      <div className="flex-1 overflow-y-auto px-4 pb-28 pt-20">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <MessageBubble
              key={i}
              msg={msg}
              avatar={msg.sender === "user" ? userAvatar : botAvatar}
              isUser={msg.sender === "user"}
            />
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Mesaj Giriş Alanı */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-4">
        <div className="border border-gray-700 p-3 rounded-2xl bg-gray-900 flex items-center gap-2 shadow-xl">
          <input
            type="text"
            className="flex-1 rounded-xl px-4 py-2 bg-gray-800 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Mesaj yaz..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl transition-all font-semibold"
          >
            Gönder
          </button>
        </div>
      </div>
    </div>
  );
}
