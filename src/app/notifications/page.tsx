"use client";

import { useCallback, useMemo } from "react";
import useSWR from "swr";
import Image from "next/image";

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

// SWR fetcher: Token'ı localStorage'dan okuyoruz
const fetcher = (url: string) => {
  const token = localStorage.getItem("token");
  return fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => {
    if (!res.ok) {
      throw new Error(`Error fetching notifications: ${res.status}`);
    }
    return res.json();
  });
};

function renderMessage(noti: NotificationRow): string {
  switch (noti.type) {
    case "follow":
      return `${noti.from_username} started following you.`;
    case "comment":
      return `${noti.from_username} commented on your post.`;
    default:
      return `${noti.from_username} liked your post.`;
  }
}

function renderIcon(noti: NotificationRow): string {
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

export default function NotificationsPage() {
  // SWR ile sosyal hesap verilerini çekiyoruz
  const { data, error, mutate } = useSWR<{ notifications: NotificationRow[] }>(
    "/api/notifications",
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  // Silme işlemi useCallback ile optimize edildi
  const deleteNotification = useCallback(
    async (id: number) => {
      try {
        await fetch("/api/notifications", {
          method: "DELETE",
          body: JSON.stringify({ id }),
          headers: { "Content-Type": "application/json" },
        });
        // Mutate ile veri yeniden doğrulanıyor
        mutate();
      } catch (err) {
        console.error("Bildirim silme hatası:", err);
      }
    },
    [mutate]
  );

  // Notifikasyon listesinin render işlemi useMemo ile optimize ediliyor
  const renderedNotifications = useMemo(() => {
    if (!data?.notifications || data.notifications.length === 0) {
      return (
        <p className="text-center text-lg text-white">
          No notifications yet.
        </p>
      );
    }
    return (
      <div className="flex flex-col gap-4">
        {data.notifications.map((noti) => (
          <div
            key={noti.id}
            className="p-4 border border-gray-300 bg-gradient-to-br from-gray-800 to-gray-800 rounded-lg flex items-center gap-4 shadow-md"
          >
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-gray-800 to-gray-800 flex items-center justify-center border-2 border-gray-300 shadow-md">
              <Image src={renderIcon(noti)} alt={noti.type} width={28} height={28} />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold">{renderMessage(noti)}</p>
              <p className="text-xs text-white">
                {new Date(noti.created_at).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => deleteNotification(noti.id)}
              className="bg-gradient-to-br from-gray-800 to-gray-800 text-white px-3 py-2 rounded-lg font-bold shadow-md hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-600 transition-all"
            >
              ✖
            </button>
          </div>
        ))}
      </div>
    );
  }, [data, deleteNotification]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-700 p-4 sm:p-6">
        <p className="text-center text-white font-bold text-lg">
          Error loading notifications.
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-700 p-4 sm:p-6">
        <p className="text-center text-white font-bold text-lg">
          Loading notifications...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-700 text-white p-4 sm:p-6">
      <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-gray-800 to-gray-800 p-4 rounded-lg shadow-md">
        Notifications
      </h1>
      <div className="max-w-full sm:max-w-2xl mx-auto mt-6">
        {renderedNotifications}
      </div>
    </div>
  );
}
