//src/components/ChatWindow.tsx
/*Bu dosya, iki kullanıcı arasında gerçek zamanlı birebir mesajlaşmayı sağlayan ChatWindow bileşenini tanımlar; kullanıcılar metin, fotoğraf 
veya video mesajı gönderebilir, mesajlar otomatik olarak yenilenir, okundu bilgisi güncellenir, link önizlemeleri gösterilir ve kelime 
üzerine gelindiğinde çeviri yapılır; ayrıca mobil uyumlu yapısıyla mesaj gönderimi, medya yükleme ve görsel önizleme modalları gibi işlevleri içerir.*/
// src/components/ChatWindow.tsx
"use client";

import React, { useEffect, useRef, useState, ChangeEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import useIsMobile from "@/hooks/useIsMobile";

// Types
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

// Link preview component
const LinkPreview = ({ url }: { url: string }) => {
  const [preview, setPreview] = useState<{ image: string; title: string; description: string } | null>(null);

  useEffect(() => {
    async function fetchPreview() {
      try {
        const res = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setPreview(data);
        } else {
          setPreview({
            image: "/icons/logo22.png",
            title: url,
            description: "",
          });
        }
      } catch (e) {
        setPreview({
          image: "/icons/logo22.png",
          title: url,
          description: "",
        });
      }
    }
    fetchPreview();
  }, [url]);

  if (!preview) return <div className="mt-2 text-xs text-white">Önizleniyor...</div>;

  return (
    <a href={url} className="flex items-center border border-gray-500 p-3 mt-1 rounded hover:bg-gray-700 transition">
      <img src={preview.image} alt="Preview" className="w-40 h-40 rounded mr-2" />
      <div>
        {/* Additional preview info can be added here */}
      </div>
    </a>
  );
};

// URL validation helper
const isValidUrl = (word: string): boolean => {
  return /^https?:\/\//i.test(word);
};

export default function ChatWindow({ buddyId, onClose }: ChatWindowProps) {
  const auth = useAuth();
  const router = useRouter();
  const isMobile = useIsMobile();

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [buddyInfo, setBuddyInfo] = useState<Buddy | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedMediaBase64, setSelectedMediaBase64] = useState<string | null>(null);
  const [selectedMediaType, setSelectedMediaType] = useState<"image" | "video" | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);
  const [translatedWord, setTranslatedWord] = useState<string | null>(null);
  const [loadingTranslation, setLoadingTranslation] = useState<boolean>(false);
  const [replyInfo, setReplyInfo] = useState<{ id: number; message: string } | null>(null);

  // Fetch buddy data from API
  useEffect(() => {
    if (!auth?.user) return;

    async function fetchBuddyData() {
      try {
        const res = await fetch("/api/users", { credentials: "include" });
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

  // Fetch messages from API
  useEffect(() => {
    if (!auth?.user) return;

    async function fetchMessages() {
      try {
        const res = await fetch(`/api/dm_messages?buddyId=${buddyId}`, { credentials: "include" });
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

  // Mark unread messages as read
  useEffect(() => {
    if (!auth?.user) return;

    const hasUnread = messages.some((msg) => msg.senderId === buddyId && !msg.isRead);
    if (hasUnread) {
      async function markAsRead() {
        try {
          await fetch("/api/dm_messages/markRead", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ fromUserId: buddyId }),
          });
          setMessages((prevMessages) =>
            prevMessages.map((msg) => (msg.senderId === buddyId ? { ...msg, isRead: true } : msg))
          );
        } catch (error) {
          console.error("Mesajların okunma durumu güncellenirken hata:", error);
        }
      }
      markAsRead();
    }
  }, [messages, buddyId, auth?.user]);

  // Translate word on hover
  const translateWord = async (word: string) => {
    setHoveredWord(word);
    setTranslatedWord(null);
    setLoadingTranslation(true);
    try {
      const targetLang = "tr"; // Assuming 'tr' as default target language (can be dynamically set later)
      const res = await fetch('/api/translate', {
        method: 'POST',
        credentials: 'include', // ⚠️ bu önemli!
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word, targetLang })
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

  // Handle sending messages
  // Handle sending messages
async function handleSend() {
  if (!auth?.user) {
    alert("Lütfen giriş yapın.");
    return;
  }

  try {
    // Eğer medya varsa önce medya mesajı gönder
    if (selectedMediaBase64 && selectedMediaType) {
      const res = await fetch("/api/dm_messages/createMedia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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
    }

    // Eğer metin mesajı varsa gönder
    if (newMessage.trim()) {
      const textRes = await fetch("/api/dm_messages/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          replyTo: replyInfo?.id || null,
          receiverId: buddyId,
          message: newMessage,
        }),
      });

      if (textRes.ok) {
        const textData = await textRes.json();
        setMessages((prev) => [...prev, textData.newMessage]);
        setNewMessage("");         // mesaj input temizle
        setReplyInfo(null);        // yalnızca başarılıysa yanıt kutusunu temizle
      } else {
        console.warn("Mesaj gönderilemedi:", await textRes.text());
      }
    }
  } catch (err) {
    console.error("Mesaj gönderilirken hata:", err);
  }
}


  // Handle media file input
  function handleMediaClick() {
    fileInputRef.current?.click();
  }

  // Handle media file selection
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

  // Handle image modal
  function handleImageClick(url: string) {
    setSelectedImage(url);
  }

  // Close image modal
  function handleCloseModal() {
    setSelectedImage(null);
  }

  // Handle back button
  function handleBack() {
    if (onClose) {
      onClose();
    } else {
      router.push("/direct-messages");
    }
  }

  // Format date
  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleString();
  }

  const myPhoto = auth?.user?.profile_image || "/icons/pp.png";
  const buddyPhoto = buddyInfo?.profile_image || "/icons/pp.png";
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const mobileOffset = isMobile ? 60 : 0;

  // Scroll helper
  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  function isUserNearBottom(): boolean {
    const container = messagesContainerRef.current;
    if (!container) return false;
    return container.scrollHeight - container.scrollTop - container.clientHeight < 150;
  }

  // İlk açılışta otomatik scroll
  useEffect(() => {
    scrollToBottom();
  }, []);

  // Sadece kullanıcı en alttaysa scroll
  useEffect(() => {
    if (isUserNearBottom()) scrollToBottom();
  }, [messages]);


  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-gradient-to-br from-[#1e1e2f] to-[#2c2c3e] text-white">
      {/* Top Bar */}
      <div className={`${isMobile ? "fixed top-0 left-0 right-0 z-50" : ""} flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-gradient-to-br from-[#25253a] to-[#2f2f45] shadow-md`}>
        <button onClick={handleBack} className="text-sm text-white hover:text-gray-300 font-semibold transition">
          &larr; Geri
        </button>
        <div className="flex items-center gap-3">
          <img src={buddyPhoto} alt="Buddy Photo" className="w-9 h-9 rounded-full object-cover ring-2 ring-purple-600" />
          <div className="flex items-center gap-1">
            <h2 className="font-bold text-base">{buddyInfo?.username || `Buddy ID: ${buddyId}`}</h2>
            <span className={`w-3 h-3 rounded-full ${buddyInfo?.isOnline ? "bg-green-500" : "bg-gray-500"}`} title={buddyInfo?.isOnline ? "Çevrimiçi" : "Çevrimdışı"} />
          </div>
        </div>
        <div className="w-8 h-8" />
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto px-4 py-5" style={{ marginTop: `${mobileOffset}px`, marginBottom: `${mobileOffset}px` }}>
        <div className="flex flex-col justify-end gap-4">
          {messages.map((msg) => {
            const isMe = msg.senderId === auth?.user?.id;
            const senderPhoto = isMe ? myPhoto : buddyPhoto;
            const urlMatch = msg.message.match(/(https?:\/\/[^\s]+)/i);
            return (
              <div
                key={msg.id}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setReplyInfo({ id: msg.id, message: msg.message });
                }}
                onTouchStart={() => {
                  setReplyInfo({ id: msg.id, message: msg.message });
                }}

                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm shadow-md transition-all duration-300 ${isMe ? "bg-gradient-to-br from-indigo-600 to-purple-700 self-end text-right" : "bg-gradient-to-br from-gray-700 to-gray-800 self-start text-left"
                  }`}
              >
                <div className="flex items-start gap-3">
                  <img src={senderPhoto} alt="Sender Photo" className="w-7 h-7 rounded-full object-cover" />
                  <div className="flex flex-col">
                   {(msg as any).replyTo && (
  <div className="text-xs p-2 mb-1 rounded bg-gray-600 text-gray-200">
    Yanıtlanan: {messages.find((m) => m.id === (msg as any).replyTo)?.message || "(silinmiş mesaj)"}
  </div>
)}

                    {msg.message && (
                      <div className="break-words whitespace-pre-wrap w-full leading-relaxed">
                        {msg.message.split(" ").map((word, index) => (
                          <span key={index} className="relative group cursor-pointer mx-1 inline-block" onMouseEnter={() => translateWord(word)} onMouseLeave={() => setHoveredWord(null)}>
                            {word}
                            {hoveredWord === word && (
                              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded-md shadow-lg whitespace-nowrap">
                                {loadingTranslation ? "Çeviriliyor..." : translatedWord || ""}
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    )}
                    {urlMatch && <LinkPreview url={urlMatch[0]} />}
                    {msg.attachmentUrl && msg.attachmentType === "image" && (
                      <img src={msg.attachmentUrl} alt="img-attachment" className="mt-2 max-w-[250px] rounded-lg cursor-pointer shadow-md" onClick={() => handleImageClick(msg.attachmentUrl!)} />
                    )}
                    {msg.attachmentUrl && msg.attachmentType === "video" && (
                      <video src={msg.attachmentUrl} className="mt-2 max-w-[250px] rounded-lg shadow" controls />
                    )}
                    <div className="text-xs flex items-center gap-2 mt-2 text-gray-300">
                      <span>{formatDate(msg.created_at)}</span>
                      {isMe && (
                        <>
                          {!msg.isRead ? (
                            <span className="text-white" title="Gönderildi">✓</span>
                          ) : (
                            <span className="flex items-center gap-1 text-white" title="Görüldü">
                              <span>✓✓</span>
                              <span className="text-green-400">Görüldü</span>
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

      {/* Bottom Bar: Input + Media + Send */}
      <div className={`${isMobile ? "fixed left-0 right-0 bottom-0 z-50" : ""} flex gap-3 px-4 py-3 bg-[#1f1f30] border-t border-gray-700 relative`}>

        <button
          onClick={handleMediaClick}
          className="bg-gray-700 hover:bg-purple-600 transition text-white px-2 py-1 rounded-lg flex items-center justify-center"
        >
          <img src="/icons/camera.png" alt="Foto/Video" className="w-5 h-5" />
        </button>

        <input type="file" ref={fileInputRef} accept="image/*,video/*" onChange={handleMediaPick} style={{ display: "none" }} />
        {selectedMediaBase64 && selectedMediaType === "image" && (
          <img src={selectedMediaBase64} alt="preview" className="w-10 h-10 object-cover rounded" />
        )}
        {selectedMediaBase64 && selectedMediaType === "video" && (
          <video src={selectedMediaBase64} className="w-10 h-10 object-cover rounded" muted />
        )}
        {replyInfo && (
  <div className="absolute bottom-20 left-4 right-4 text-xs text-gray-300 bg-gray-800 px-3 py-2 rounded-md flex justify-between items-center z-10">
    <span className="truncate max-w-[85%]">Yanıtla: {replyInfo.message.slice(0, 50)}</span>
    <button onClick={() => setReplyInfo(null)} className="ml-2 text-red-400 hover:underline">İptal</button>
  </div>
)}

        <input
          id="chatInput"
          type="text"
          className="flex-1 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none bg-gray-900 text-white"
          placeholder="Mesajınızı yazın..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button
          id="chatSendButton"
          onClick={handleSend}
          className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 text-sm rounded-lg transition font-semibold"
        >
          Gönder
        </button>
      </div>

      {/* Modal for image preview */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70" onClick={handleCloseModal}>
          <div className="relative bg-gray-900 rounded-xl shadow-lg max-w-[85vw] max-h-[85vh] p-3" onClick={(e) => e.stopPropagation()}>
            <button onClick={handleCloseModal} className="absolute top-2 right-2 text-white font-bold text-xl hover:text-red-400 transition">
              ×
            </button>
            <img src={selectedImage} alt="modal-preview" className="max-w-full max-h-[75vh] object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
