"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";

interface DMMessage {
  sender: string;
  message: string;
}

export default function DMChatPage() {
  const { chatId } = useParams() as { chatId: string };
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<DMMessage[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newSocket: Socket = io("http://localhost:4000", {
      transports: ["websocket"],
    });
    setSocket(newSocket);

    newSocket.emit("joinRoom", chatId);

    newSocket.on("privateMessage", (msg: DMMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [chatId]);

  const handleSend = () => {
    if (!input.trim() || !socket) return;
    // Gerçek uygulamada sender bilgisini oturum açmış kullanıcı bilgilerinden almanız gerekir.
    const sender = "Me"; // Örnek sender; bunu dinamik hale getirin.
    socket.emit("privateMessage", { roomId: chatId, message: input.trim(), sender });
    setInput("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center p-6">
      <div className="w-full max-w-3xl bg-gray-100 rounded-lg shadow-lg p-6 mb-4">
        <h1 className="text-2xl font-bold mb-4">Direct Message</h1>
        <div className="h-80 overflow-y-auto border border-gray-300 p-4 rounded-lg bg-white">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-2 flex ${msg.sender === "Me" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-2 rounded-lg ${
                  msg.sender === "Me" ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-800"
                }`}
              >
                <span className="font-bold">{msg.sender}: </span>
                <span>{msg.message}</span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="mt-4 flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-l-lg p-2 focus:outline-none"
          />
          <button
            onClick={handleSend}
            className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 transition"
          >
            Send
          </button>
        </div>
      </div>
      <button
        onClick={() => router.back()}
        className="mt-4 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 transition"
      >
        Back
      </button>
    </div>
  );
}
