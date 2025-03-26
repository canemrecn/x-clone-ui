"use client";

import React, { useEffect, useRef, useState, ChangeEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import useIsMobile from "@/hooks/useIsMobile";

// Tipler
interface MessageItem {
  id: number;
  senderId: number;
  receiverId: number;
  message: string;
  created_at: string;
  attachmentUrl?: string | null;
  attachmentType?: "image" | "video" | null;
  isRead?: boolean;
}

interface Buddy {
  id: number;
  username: string;
  profile_image?: string;
  isOnline?: boolean;
}

interface ChatWindowProps {
  buddyId: number;
  onClose?: () => void;
}

// Link önizleme için tipi
interface LinkPreviewData {
  image: string;
  title: string;
  description: string;
}

// Link önizleme bileşeni
const LinkPreview = ({ url }: { url: string }) => {
  const [preview, setPreview] = useState<LinkPreviewData | null>(null);

  useEffect(() => {
    async function fetchPreview() {
      try {
        const res = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
        if (res.ok) {
          const data = await res.json();
          setPreview(data);
        } else {
          // Fallback: placeholder
          setPreview({
            image: "/icons/logom2.png",
            title: url,
            description: "",
          });
        }
      } catch (e) {
        setPreview({
          image: "/icons/logom2.png",
          title: url,
          description: "",
        });
      }
    }
    fetchPreview();
  }, [url]);

  if (!preview) return <div className="mt-2 text-xs text-white">Önizleniyor...</div>;

  return (
    <a
      href={url}
      className="flex items-center border border-gray-500 p-3 mt-1 rounded hover:bg-gray-700 transition"
    >
      <img src={preview.image} alt="Preview" className="w-40 h-40 rounded mr-2" />
      <div>
        {/* Additional preview info can be added here */}
      </div>
    </a>
  );
};

// URL kontrolü: geçerli URL olup olmadığını kontrol eder.
const isValidUrl = (word: string): boolean => {
  return /^https?:\/\//i.test(word);
};

export default function ChatWindow({ buddyId, onClose }: ChatWindowProps) {
  const auth = useAuth();
  const router = useRouter();
  const isMobile = useIsMobile();

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [buddyInfo, setBuddyInfo] = useState<Buddy | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedMediaBase64, setSelectedMediaBase64] = useState<string | null>(null);
  const [selectedMediaType, setSelectedMediaType] = useState<"image" | "video" | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [hoveredWord, setHoveredWord] = useState<string | null>(null);
  const [translatedWord, setTranslatedWord] = useState<string | null>(null);
  const [loadingTranslation, setLoadingTranslation] = useState<boolean>(false);

  useEffect(() => {
    if (!auth?.user) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    async function fetchBuddyData() {
      try {
        const res = await fetch("/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const buddyArr: Buddy[] = data.users || [];
          const found = buddyArr.find((u) => u.id === buddyId);
          setBuddyInfo(found || null);
        }
      } catch (err) {
        console.error("Buddy bilgisi çekilirken hata:", err);
      }
    }
    fetchBuddyData();
  }, [buddyId, auth?.user]);

  useEffect(() => {
    if (!auth?.user) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    async function fetchMessages() {
      try {
        const res = await fetch(`/api/dm_messages?buddyId=${buddyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
        }
      } catch (err) {
        console.error("Mesajlar çekilirken hata:", err);
      }
    }
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [buddyId, auth?.user]);

  useEffect(() => {
    if (!auth?.user) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    const hasUnread = messages.some(
      (msg) => msg.senderId === buddyId && !msg.isRead
    );
    if (hasUnread) {
      async function markAsRead() {
        try {
          await fetch("/api/dm_messages/markRead", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ fromUserId: buddyId }),
          });
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.senderId === buddyId ? { ...msg, isRead: true } : msg
            )
          );
        } catch (error) {
          console.error("Mesajların okunma durumu güncellenirken hata:", error);
        }
      }
      markAsRead();
    }
  }, [messages, buddyId, auth?.user]);

  const translateWord = async (word: string) => {
    setHoveredWord(word);
    setTranslatedWord(null);
    setLoadingTranslation(true);
    try {
      const targetLang = localStorage.getItem("targetLanguage") || "tr";
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word, targetLang }),
      });
      if (res.ok) {
        const data = await res.json();
        setTranslatedWord(data.translation || "Çeviri mevcut değil");
      } else {
        setTranslatedWord("Çeviri hatası");
      }
    } catch (error) {
      console.error("Çeviri hatası:", error);
      setTranslatedWord("Çeviri hatası");
    } finally {
      setLoadingTranslation(false);
    }
  };

  async function handleSend() {
    if (!auth?.user) {
      alert("Lütfen giriş yapın.");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      if (selectedMediaBase64 && selectedMediaType) {
        const res = await fetch("/api/dm_messages/createMedia", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            receiverId: buddyId,
            attachmentBase64: selectedMediaBase64,
            attachmentType: selectedMediaType,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setMessages((prev) => [...prev, data.newMessage]);
        }
        setSelectedMediaBase64(null);
        setSelectedMediaType(null);
        if (newMessage.trim()) {
          const textRes = await fetch("/api/dm_messages/create", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              receiverId: buddyId,
              message: newMessage,
            }),
          });
          if (textRes.ok) {
            const textData = await textRes.json();
            setMessages((prev) => [...prev, textData.newMessage]);
          }
          setNewMessage("");
        }
      } else if (newMessage.trim()) {
        const res = await fetch("/api/dm_messages/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            receiverId: buddyId,
            message: newMessage,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setMessages((prev) => [...prev, data.newMessage]);
        }
        setNewMessage("");
      }
    } catch (err) {
      console.error("Mesaj gönderilirken hata:", err);
    }
  }

  function handleMediaClick() {
    fileInputRef.current?.click();
  }

  function handleMediaPick(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    e.target.value = "";
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      let type: "image" | "video" | null = null;
      if (file.type.startsWith("image")) {
        type = "image";
      } else if (file.type.startsWith("video")) {
        type = "video";
      }
      setSelectedMediaBase64(base64Data);
      setSelectedMediaType(type);
    };
    reader.readAsDataURL(file);
  }

  function handleImageClick(url: string) {
    setSelectedImage(url);
  }

  function handleCloseModal() {
    setSelectedImage(null);
  }

  function handleBack() {
    if (onClose) {
      onClose();
    } else {
      router.push("/direct-messages");
    }
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleString();
  }

  const myPhoto = auth?.user?.profile_image || "/icons/pp.png";
  const buddyPhoto = buddyInfo?.profile_image || "/icons/pp.png";
  const mobileOffset = isMobile ? 60 : 0;

  // Mesaj içerisindeki ilk geçerli URL'yi bulmak için regex
  const urlRegex = /(https?:\/\/[^\s]+)/i;

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-gradient-to-br from-gray-800 to-gray-700 text-white">
      {/* Üst Bar */}
      <div className={`${isMobile ? "fixed top-0 left-0 right-0 z-50" : ""} flex items-center justify-between p-4 border-b border-gray-300 bg-gradient-to-br from-gray-800 to-gray-800`}>
        <button onClick={handleBack} className="text-white hover:text-gray-300 font-semibold">
          &larr; Geri
        </button>
        <div className="flex items-center gap-2">
          <img src={buddyPhoto} alt="Buddy Photo" className="w-8 h-8 rounded-full object-cover" />
          <h2 className="font-bold">
            {buddyInfo?.username || `Buddy ID: ${buddyId}`}
          </h2>
          <span
            className={`w-3 h-3 rounded-full ${buddyInfo?.isOnline ? "bg-green-500" : "bg-gray-800"}`}
            title={buddyInfo?.isOnline ? "Çevrimiçi" : "Çevrimdışı"}
          />
        </div>
        <div className="w-8 h-8" />
      </div>

      {/* Mesajlar Alanı */}
      <div
        className="flex-1 overflow-y-auto p-4"
        style={{ marginTop: `${mobileOffset}px`, marginBottom: `${mobileOffset}px` }}
      >
        <div className="flex flex-col justify-end gap-2">
          {messages.map((msg) => {
            const isMe = msg.senderId === auth?.user?.id;
            const senderPhoto = isMe ? myPhoto : buddyPhoto;
            // Mesajdaki ilk URL'yi bul
            const urlMatch = msg.message.match(urlRegex);
            return (
              <div
                key={msg.id}
                className={`max-w-[70%] p-2 rounded text-sm shadow-sm transition-all duration-300 ease-in-out ${isMe ? "bg-gradient-to-br from-gray-800 to-gray-800 self-end text-right" : "bg-gradient-to-br from-gray-800 to-gray-800 self-start text-left"} `}
                style={{ animation: "fadeIn 0.4s ease" }}
              >
                <div className="flex items-start gap-2">
                  <img src={senderPhoto} alt="Sender Photo" className="w-6 h-6 rounded-full object-cover mt-0.5" />
                  <div className="flex flex-col">
                    {msg.message && (
                      <div className="break-words whitespace-pre-wrap w-full">
                        {msg.message.split(" ").map((word, index) => (
                          <span
                            key={index}
                            className="relative group cursor-pointer mx-1 inline-block"
                            onMouseEnter={() => translateWord(word)}
                            onMouseLeave={() => setHoveredWord(null)}
                          >
                            {word}
                            {hoveredWord === word && (
                              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gradient-to-br from-gray-800 to-gray-800 text-white text-xs px-2 py-1 rounded-md shadow-lg whitespace-nowrap">
                                {loadingTranslation ? "Çeviriliyor..." : translatedWord || ""}
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    )}
                    {urlMatch && <LinkPreview url={urlMatch[0]} />}
                    {msg.attachmentUrl && msg.attachmentType === "image" && (
                      <img
                        src={msg.attachmentUrl}
                        alt="img-attachment"
                        className="mt-2 max-w-[200px] rounded cursor-pointer"
                        onClick={() => handleImageClick(msg.attachmentUrl!)}
                      />
                    )}
                    {msg.attachmentUrl && msg.attachmentType === "video" && (
                      <video src={msg.attachmentUrl} className="mt-2 max-w-[200px] rounded" controls />
                    )}
                    <div className="text-xs flex items-center gap-2 mt-1">
                      <span>{formatDate(msg.created_at)}</span>
                      {isMe && (
                        <>
                          {!msg.isRead ? (
                            <span className="text-white" title="Gönderildi">✓</span>
                          ) : (
                            <span className="flex items-center gap-1 text-white" title="Görüldü">
                              <span>✓✓</span>
                              <span>Görüldü</span>
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Alt Kısım: Input + Foto/Video + Gönder */}
      <div className={`${isMobile ? "fixed left-0 right-0 bottom-0 z-50" : ""} flex gap-3 p-3 bg-gradient-to-br from-gray-800 to-gray-800 border-t border-gray-300`}>
        <button onClick={handleMediaClick} className="bg-gradient-to-br from-gray-800 to-gray-800 text-white px-2 py-1 rounded hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-700 transition">
          Foto/Video
        </button>
        <input type="file" ref={fileInputRef} accept="image/*,video/*" onChange={handleMediaPick} style={{ display: "none" }} />
        {selectedMediaBase64 && selectedMediaType === "image" && (
          <img src={selectedMediaBase64} alt="preview" className="w-10 h-10 object-cover rounded" />
        )}
        {selectedMediaBase64 && selectedMediaType === "video" && (
          <video src={selectedMediaBase64} className="w-10 h-10 object-cover rounded" muted />
        )}
        <input
          id="chatInput"
          type="text"
          className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-gray-600 bg-gradient-to-br from-gray-800 to-gray-800 text-white"
          placeholder="Mesajınız..."
          value={newMessage}
          onInput={(e) => setNewMessage((e.target as HTMLInputElement).value)}
        />
        <button id="chatSendButton" onClick={handleSend} className="bg-gradient-to-br from-gray-800 to-gray-800 text-white px-3 py-1 text-sm rounded hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-700 transition">
          Gönder
        </button>
      </div>

      {/* Resim için açılan modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={handleCloseModal}>
          <div className="relative bg-gradient-to-br from-gray-800 to-gray-800 rounded shadow-lg max-w-[80vw] max-h-[80vh] p-2" onClick={(e) => e.stopPropagation()}>
            <button onClick={handleCloseModal} className="absolute top-2 right-2 text-white font-bold text-xl">
              X
            </button>
            <img src={selectedImage} alt="modal-preview" className="max-w-full max-h-[75vh] object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
