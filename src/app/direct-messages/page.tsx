// src/app/direct-messages/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import Image from "next/image";

interface Conversation {
  id: string;
  participants: string[]; // Örneğin: kullanıcı adları
  lastMessage: string;
  updatedAt: string;
}

interface DMMessage {
  sender: string;
  message: string;
  created_at: string;
}

export default function DirectMessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DMMessage[]>([]);
  const [input, setInput] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);

  // Konuşma listesini çekiyoruz
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch("/api/direct-messages?list=true");
        if (!res.ok) {
          console.error("Failed to fetch conversations");
          return;
        }
        const data = await res.json();
        setConversations(data.conversations);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };

    fetchConversations();
  }, []);

  // Socket.IO bağlantısını başlatıyoruz
  useEffect(() => {
    const newSocket: Socket = io("http://localhost:4000", {
      transports: ["websocket"],
    });
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Seçilen konuşmaya ait mesajları çekiyoruz ve socket üzerinden güncelliyoruz
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversationId) return;
      try {
        const res = await fetch(`/api/direct-messages?chatId=${selectedConversationId}`);
        if (!res.ok) {
          console.error("Failed to fetch messages");
          return;
        }
        const data = await res.json();
        setMessages(data.messages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();

    if (socket && selectedConversationId) {
      socket.emit("joinRoom", selectedConversationId);
      socket.on("privateMessage", (msg: DMMessage) => {
        setMessages((prev) => [...prev, msg]);
      });
    }

    // Temizleme: socket event listener'ı kaldırıyoruz
    return () => {
      if (socket && selectedConversationId) {
        socket.off("privateMessage");
      }
    };
  }, [selectedConversationId, socket]);

  const handleSend = () => {
    if (!input.trim() || !socket || !selectedConversationId) return;
    // Gerçek uygulamada "sender" bilgisini auth context'ten almanız gerekir.
    const sender = "Me"; // Örnek sender
    const newMsg: DMMessage = {
      sender,
      message: input.trim(),
      created_at: new Date().toISOString(),
    };
    socket.emit("privateMessage", {
      roomId: selectedConversationId,
      message: input.trim(),
      sender,
    });
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
  };

  return (
    <div className="min-h-screen grid grid-cols-2">
      {/* Sol Panel: Konuşma Listesi */}
      <div className="border-r border-gray-300 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Conversations</h2>
        {conversations.length === 0 ? (
          <p>No conversations found.</p>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className={`p-3 border rounded mb-2 cursor-pointer hover:bg-gray-100 ${
                selectedConversationId === conv.id ? "bg-gray-200" : ""
              }`}
              onClick={() => setSelectedConversationId(conv.id)}
            >
              <p className="font-semibold">
                Participants: {conv.participants.join(", ")}
              </p>
              <p>Last message: {conv.lastMessage}</p>
              <p className="text-xs text-gray-500">
                {new Date(conv.updatedAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Sağ Panel: Seçilen Konuşmanın Mesajları */}
      <div className="p-4 flex flex-col">
        {selectedConversationId ? (
          <>
            <div className="flex-1 overflow-y-auto border border-gray-300 p-4 rounded">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`mb-2 flex ${
                    msg.sender === "Me" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`px-4 py-2 rounded-lg ${
                      msg.sender === "Me"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-300 text-gray-800"
                    }`}
                  >
                    <p>
                      <span className="font-bold">{msg.sender}: </span>
                      {msg.message}
                    </p>
                    <p className="text-xs text-gray-600">
                      {new Date(msg.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-l p-2 focus:outline-none"
              />
              <button
                onClick={handleSend}
                className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700 transition"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p>Select a conversation to view messages.</p>
          </div>
        )}
      </div>
    </div>
  );
}
