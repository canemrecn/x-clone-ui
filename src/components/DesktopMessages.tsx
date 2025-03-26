"use client";

import React, { useState } from "react";
import useIsMobile from "@/hooks/useIsMobile";
import UsersList from "@/app/direct-messages/UsersList";
import ChatWindow from "@/components/ChatWindow";

export default function DesktopMessages() {
  const isMobile = useIsMobile();
  const [showPanel, setShowPanel] = useState(false);
  const [selectedBuddyId, setSelectedBuddyId] = useState<number | null>(null);

  // Sadece masaüstünde çalışsın
  if (isMobile) return null;

  function handleSelectBuddy(buddyId: number) {
    setSelectedBuddyId(buddyId);
  }

  return (
    <>
      {!showPanel && (
        <button
          onClick={() => setShowPanel(true)}
          className="fixed right-4 bottom-0 bg-gradient-to-br from-gray-800 to-gray-800 text-white px-4 py-2 rounded-full shadow-lg hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-600 transition"
        >
          Mesajlar
        </button>
      )}

      {showPanel && (
        <div className="fixed right-4 bottom-0 w-[600px] h-[500px] bg-gradient-to-br from-gray-800 to-gray-800 shadow-lg border border-gray-300 rounded-lg flex overflow-hidden z-[2000]">
          {/* Sol kenar (ChatWindow) */}
          <div className="flex-1 border-r border-gray-300 relative">
            {selectedBuddyId ? (
              <ChatWindow
                buddyId={selectedBuddyId}
                onClose={() => setSelectedBuddyId(null)}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-white">
                Bir kullanıcı seçin
              </div>
            )}
          </div>

          {/* Sağ kenar (UsersList) */}
          <div className="w-[220px]">
            <UsersList onSelectBuddy={handleSelectBuddy} />
          </div>

          {/* Paneli kapatma butonu */}
          <button
            onClick={() => setShowPanel(false)}
            className="absolute top-2 right-2 text-white hover:text-gray-300 font-bold"
          >
            X
          </button>
        </div>
      )}
    </>
  );
}
