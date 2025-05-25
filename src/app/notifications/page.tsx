//src/app/notifications/page.tsx
/*Bu dosya, kullanıcının bildirimlerini listeleyen bir sayfa oluşturur; SWR ile /api/notifications endpoint’inden kullanıcıya özel bildirimleri 
çeker, bildirim türüne göre simge ve mesaj gösterir, her bildirimin yanında silme butonu bulunur ve butona tıklanınca ilgili bildirim silinir, 
ardından liste güncellenir.*/
"use client";

/* 
  Bu dosya, kullanıcının bildirimlerini listeleyen bir sayfa oluşturur; SWR ile /api/notifications endpoint’inden kullanıcıya özel bildirimleri 
  çeker, bildirim türüne göre simge ve mesaj gösterir, her bildirimin yanında silme butonu bulunur ve butona tıklanınca ilgili bildirim silinir, 
  ardından liste güncellenir.
*/

import { useCallback, useMemo } from "react";
import useSWR from "swr";
import Image from "next/image";
import Cookies from "js-cookie";

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

// SWR fetcher
const fetcher = (url: string) => {
  const token = Cookies.get("token");
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
  const { data, error, mutate } = useSWR<{ notifications: NotificationRow[] }>(
    "/api/notifications",
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  const deleteNotification = useCallback(
    async (id: number) => {
      try {
        await fetch("/api/notifications", {
          method: "DELETE",
          body: JSON.stringify({ id }),
          headers: { "Content-Type": "application/json" },
        });
        mutate();
      } catch (err) {
        console.error("Bildirim silme hatası:", err);
      }
    },
    [mutate]
  );

  const renderedNotifications = useMemo(() => {
    if (!data?.notifications || data.notifications.length === 0) {
      return (
        <p className="text-center text-lg text-gray-300 mt-10">
          No notifications yet.
        </p>
      );
    }
    return (
      <div className="flex flex-col gap-5">
        {data.notifications.map((noti) => (
          <div
            key={noti.id}
            className="p-4 border border-gray-700 bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl flex items-center gap-4 shadow-lg hover:ring-2 hover:ring-orange-500 transition-all"
          >
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-900 flex items-center justify-center border-2 border-gray-600 shadow">
              <Image src={renderIcon(noti)} alt={noti.type} width={28} height={28} />
            </div>

            <div className="flex-1">
              <p className="text-gray-200 font-semibold">{renderMessage(noti)}</p>
              <p className="text-xs text-gray-400">
                {new Date(noti.created_at).toLocaleString()}
              </p>
            </div>

            <button
              onClick={() => deleteNotification(noti.id)}
              className="bg-gradient-to-br from-red-600 to-red-500 text-white px-3 py-2 rounded-lg font-bold shadow hover:scale-105 hover:brightness-110 transition-all"
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 sm:p-6">
        <p className="text-center text-red-400 font-bold text-lg">
          Error loading notifications.
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 sm:p-6">
        <p className="text-center text-gray-300 font-medium text-lg">
          Loading notifications...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4 sm:p-6 pt-24 pb-20">
      <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-gray-800 to-gray-700 p-5 rounded-xl shadow-xl tracking-wide">
        Notifications
      </h1>
      <div className="max-w-full sm:max-w-2xl mx-auto mt-8">
        {renderedNotifications}
      </div>
    </div>
  );
}
