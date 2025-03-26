// src/components/GeminiChat.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { chatWithGemini } from "@/utils/gemini";
import Image from "next/image";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

interface GeminiChatProps {
  onClose?: () => void;
}

interface Message {
  text: string;
  sender: "user" | "bot";
}

const GeminiChatContent = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const auth = useAuth();

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { text: input, sender: "user" }]);

    const botReply = await chatWithGemini(input);
    setMessages((prev) => [...prev, { text: botReply, sender: "bot" }]);

    setInput("");
    inputRef.current?.focus();
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="w-full h-full flex flex-col bg-[#FAFCF2]">
      <div className="flex flex-col flex-1 p-5 overflow-y-auto bg-[#FAFCF2]">
        {messages.map((msg, index) => {
          const userAvatar = auth?.user?.profile_image || "/icons/pp.png";
          const botAvatar = "/general/aii.webp";

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: msg.sender === "user" ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className={`flex items-start gap-3 p-3 rounded-lg max-w-[75%] 
                ${
                  msg.sender === "user"
                    ? "self-end flex-row-reverse bg-[#A8DBF0] text-black"
                    : "self-start bg-[#3E6A8A] text-white"
                }`}
            >
              <Image
                src={msg.sender === "user" ? userAvatar : botAvatar}
                alt="Avatar"
                width={40}
                height={40}
                className="rounded-full border-2 border-[#BDC4BF]"
              />
              <div>{msg.text}</div>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-2 flex items-center border-t border-[#BDC4BF] bg-[#FAFCF2]">
        <input
          ref={inputRef}
          type="text"
          className="flex-1 p-2 rounded-lg bg-[#A8DBF0] text-black outline-none border border-[#BDC4BF]"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={handleSendMessage}
          className="ml-2 px-4 py-2 bg-[#3E6A8A] text-white rounded-lg border border-[#BDC4BF]"
        >
          Send
        </button>
      </div>
    </div>
  );
};

const GeminiChat = ({ onClose }: GeminiChatProps) => {
  const [isMinimized, setIsMinimized] = useState(false);

  const handleMinimize = () => {
    setIsMinimized((prev) => !prev);
  };

  const MinimizedBar = () => (
    <div
      onClick={() => setIsMinimized(false)}
      className="fixed z-[9999] bottom-0 right-4 w-48 h-12 bg-[#3E6A8A] text-white 
                 flex items-center justify-center cursor-pointer rounded-t-lg shadow-lg border border-[#BDC4BF]"
    >
      <span className="font-bold">Chat AI</span>
    </div>
  );

  const FullChatWindow = () => (
    <div className="fixed z-[9999] bottom-0 right-4 w-96 border border-[#BDC4BF] rounded-lg bg-[#FAFCF2] text-black shadow-lg flex flex-col h-[500px]">
      <div className="flex justify-between items-center bg-[#3E6A8A] text-white p-2 rounded-t-lg w-full">
        <span className="font-bold">Chat AI</span>
        <div className="flex gap-2">
          <button onClick={handleMinimize} className="text-[#A8DBF0] hover:text-white">
            —
          </button>
          <button onClick={onClose} className="text-red-400 hover:text-red-600">
            ✖
          </button>
        </div>
      </div>
      <div className="h-full overflow-y-auto bg-[#FAFCF2] p-2 rounded-b-lg">
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
