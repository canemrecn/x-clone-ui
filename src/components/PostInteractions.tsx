//src/components/PostInteractions.tsx
/*Bu dosya, gönderi (post) ile ilgili etkileşimleri yöneten bir PostInteractions bileşeni tanımlar. Kullanıcılar 
bir gönderiyi beğenebilir (like), yorum yapabilir (comment) ve doğrudan mesajla (DM) başkalarına gönderebilir. 
Beğeni sayısı ve yorum sayısı anlık olarak güncellenir, gönder butonuna basıldığında arkadaş listesinden bir 
kullanıcı seçilerek gönderi paylaşılabilir. Her işlemde token kontrolü yapılır ve görsel ikonlar kullanılarak 
kullanıcı etkileşimi sağlanır. Ayrıca, modal açılarak kullanıcı seçimiyle gönderme işlemi yapılır.*/
// src/components/PostInteractions.tsx
/*Bu dosya, gönderi (post) ile ilgili etkileşimleri yöneten bir PostInteractions bileşeni tanımlar. Kullanıcılar 
bir gönderiyi beğenebilir (like), yorum yapabilir (comment) ve doğrudan mesajla (DM) başkalarına gönderebilir. 
Beğeni sayısı ve yorum sayısı anlık olarak güncellenir, gönder butonuna basıldığında arkadaş listesinden bir 
kullanıcı seçilerek gönderi paylaşılabilir. Her işlemde kimlik doğrulaması yapılır ve görsel ikonlar kullanılarak 
kullanıcı etkileşimi sağlanır. Ayrıca, modal açılarak kullanıcı seçimiyle gönderme işlemi yapılır.*/
"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import UsersList from "@/app/direct-messages/UsersList";

interface PostInteractionsProps {
  postId: number;
  initialLikes: number | string;
  initialComments: number | string;
  onCommentClick?: () => void; // Yorum ikonuna tıklanınca çalışacak fonksiyon
}

const PostInteractions: React.FC<PostInteractionsProps> = React.memo(
  ({ postId, initialLikes, initialComments }) => {
    const [likeCount, setLikeCount] = useState(Number(initialLikes) || 0);
    const [commentCount, setCommentCount] = useState(Number(initialComments) || 0);
    const [isLiked, setIsLiked] = useState(false);
    const [showSendModal, setShowSendModal] = useState(false);

    const handleLike = useCallback(async () => {
      try {
        const res = await fetch(`/api/posts/${postId}/like`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // HTTP-only cookie gönderimi için gerekli
        });
        if (res.ok) {
          const data = await res.json();
          if (data.message === "Post liked") {
            setLikeCount((prev) => prev + 1);
            setIsLiked(true);
          } else if (data.message === "Post unliked") {
            setLikeCount((prev) => (prev > 0 ? prev - 1 : 0));
            setIsLiked(false);
          }
        }
      } catch (error) {
        console.error("Error in handleLike:", error);
      }
    }, [postId]);

    const handleComment = useCallback(async () => {
      const text = prompt("Yorumunuzu yazın:") || "";
      if (!text.trim()) return;

      try {
        const res = await fetch(`/api/posts/${postId}/comment`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // HTTP-only cookie gönderimi için gerekli
          body: JSON.stringify({ text }),
        });
        if (res.ok) {
          setCommentCount((prev) => prev + 1);
        }
      } catch (error) {
        console.error("Error in handleComment:", error);
      }
    }, [postId]);

    const handleSendPost = useCallback(
      async (buddyId: number) => {
        try {
          const res = await fetch("/api/dm_messages/send", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include", // HTTP-only cookie gönderimi için gerekli
            body: JSON.stringify({ toUserId: buddyId, postId }),
          });
          if (res.ok) {
            const data = await res.json();
            console.log("DM sent successfully:", data);
            alert("Gönderi başarıyla gönderildi!");
          } else {
            console.error("Failed to send DM:", res.status);
            alert("Gönderi gönderilemedi.");
          }
        } catch (error) {
          console.error("Error sending DM:", error);
          alert("Gönderi gönderilirken hata oluştu.");
        } finally {
          setShowSendModal(false);
        }
      },
      [postId]
    );

    return (
      <div className="flex items-center gap-4 my-2 text-white">
        {/* Yorum Butonu */}
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={handleComment}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              className="fill-white group-hover:fill-gray-300"
              d="M1.751 10C1.751 5.58 5.335 2 9.756 2h4.366c4.39 0 8.129 3.64 8.129 8.13 
                 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6
                 c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 
                 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"
            />
          </svg>
          <span className="group-hover:text-gray-300 text-sm">{commentCount}</span>
        </div>

        {/* Like Butonu */}
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={handleLike}
        >
          <Image
            src="/icons/like.png"
            alt="Like"
            width={20}
            height={20}
            className={`group-hover:opacity-70 ${isLiked ? "brightness-150" : ""}`}
          />
          <span className="text-sm">{likeCount}</span>
        </div>

        {/* Gönder Butonu */}
        <div className="mt-2">
          <button onClick={() => setShowSendModal(true)}>
            <Image src="/icons/gonder.png" alt="Gönder" width={15} height={15} />
          </button>
        </div>

        {/* Gönder Modalı */}
        {showSendModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
            <div className="bg-gradient-to-br from-gray-800 to-gray-800 p-4 rounded shadow-lg w-full max-w-md">
              <div className="flex items-center gap-2 mb-4">
                <Image src="/icons/gonder.png" alt="Gönder" width={20} height={20} />
                <h2 className="text-white text-lg font-bold">Gönder</h2>
              </div>
              <UsersList onSelectBuddy={handleSendPost} />
              <button
                onClick={() => setShowSendModal(false)}
                className="mt-4 text-white underline"
              >
                Kapat
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
);

export default PostInteractions;
