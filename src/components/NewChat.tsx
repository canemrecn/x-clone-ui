"use client";

import { useState, useEffect, useRef } from "react";
import { chatWithGemini } from "@/utils/gemini";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  text: string;
  sender: "user" | "bot";
}

interface MessageItemProps {
  msg: Message;
  userAvatar: string;
  botAvatar: string;
}

function MessageItem({ msg, userAvatar, botAvatar }: MessageItemProps) {
  const avatar = msg.sender === "user" ? userAvatar : botAvatar;

  return (
    <motion.div
      key={msg.text}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className={`mb-2 p-2 rounded shadow max-w-[75%] flex gap-2 ${
        msg.sender === "user"
          ? "bg-[#A8DBF0] text-[#3E6A8A] self-end"
          : "bg-[#3E6A8A] text-white self-start"
      }`}
    >
      <img
        src={avatar}
        alt={`${msg.sender} avatar`}
        className="w-8 h-8 rounded-full"
      />
      <span>{msg.text}</span>
    </motion.div>
  );
}

export default function NewChatGemini() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const auth = useAuth();

  const userAvatar = auth?.user?.profile_image || "/icons/pp.png";
  const botAvatar = "/general/aii.webp";

  // Her mesaj eklendikten sonra otomatik kaydır
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
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
  };

  return (
    <div className="h-full flex flex-col">
      {/* Mesajların listelendiği alan: pb-20 eklenerek input alanıyla çakışma önlendi */}
      <div className="flex-1 overflow-auto p-4 pb-20 bg-white flex flex-col">
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

      {/* Mesaj gönderme alanı */}
      <div className="sticky bottom-16 bg-[#FAFCF2] border-t border-gray-300 p-4 flex items-center gap-2">
        <input
          type="text"
          className="flex-1 border rounded px-2 py-1 text-black"
          placeholder="Type your message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button
          onClick={handleSend}
          className="bg-[#3E6A8A] text-white px-4 py-2 rounded hover:bg-[#2C4B60]"
        >
          Send
        </button>
      </div>
    </div>
  );
}
