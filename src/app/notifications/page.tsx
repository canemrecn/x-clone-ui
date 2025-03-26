"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

interface NotificationRow {
  id: number;
  user_id: number;
  type: string;
  from_user_id: number;
  from_username?: string;
  from_profile_image?: string;
  post_id?: number;
  created_at: string;
}

export default function NotificationsPage() {
  const auth = useAuth();
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("/api/notifications", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setNotifications(data.notifications || []);
      })
      .catch((err) => console.error(err));
  }, []);

  const deleteNotification = async (id: number) => {
    try {
      await fetch("/api/notifications", {
        method: "DELETE",
        body: JSON.stringify({ id }),
        headers: { "Content-Type": "application/json" },
      });
      setNotifications((prev) => prev.filter((noti) => noti.id !== id));
    } catch (error) {
      console.error("Bildirim silme hatası:", error);
    }
  };

  function renderMessage(noti: NotificationRow) {
    switch (noti.type) {
      case "follow":
        return `${noti.from_username} started following you.`;
      case "comment":
        return `${noti.from_username} commented on your post.`;
      default:
        return `${noti.from_username} liked your post.`;
    }
  }

  function renderIcon(noti: NotificationRow) {
    switch (noti.type) {
      case "follow":
        return "/icons/follow.png";
      case "comment":
        return "/icons/comment.png";
      case "like":
      default:
        return "/icons/like.png";
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFCF2] text-black p-4 sm:p-6">
      <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-[#A8DBF0] via-[#FAFCF2] to-[#BDC4BF] p-4 rounded-lg shadow-md">
        Notifications
      </h1>

      <div className="max-w-full sm:max-w-2xl mx-auto mt-6">
        {notifications.length === 0 ? (
          <p className="text-center text-lg">No notifications yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {notifications.map((noti) => (
              <div
                key={noti.id}
                className="p-4 border border-[#BDC4BF] bg-[#A8DBF0] rounded-lg flex items-center gap-4 shadow-md"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-[#FAFCF2] flex items-center justify-center border-2 border-[#3E6A8A] shadow-md">
                  <Image src={renderIcon(noti)} alt={noti.type} width={28} height={28} />
                </div>

                <div className="flex-1">
                  <p className="text-black font-semibold">{renderMessage(noti)}</p>
                  <p className="text-xs text-black">
                    {new Date(noti.created_at).toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={() => deleteNotification(noti.id)}
                  className="bg-red-500 text-black px-3 py-2 rounded-lg font-bold shadow-md hover:bg-red-700 transition-all"
                >
                  ✖
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
