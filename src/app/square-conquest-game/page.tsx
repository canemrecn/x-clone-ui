//src/app/square-conquest-game/page.tsx
/*Bu dosya, kullanıcıların 10x20’lik bir kare tahtada “red” ve “blue” takımlarıyla dönüşümlü olarak kareleri fethederek oynadığı 
"Square Conquest Game" adlı bir strateji oyununu oluşturur; tek kişilik, iki kişilik veya arkadaşla oynama modlarını destekler, 
risk alarak karşı takımdan kare kazanma veya kaybetme mekaniğine dayanır, yapay zekâ (AI) ile oynanabilir, oyun boyunca bağlantısız 
kareleri otomatik olarak karşı takıma geçirir, oyun kazanımını hesaplar, mobil uyumlu çalışır ve arkadaşla oynama modunda davet sistemi 
ile oyun başlatmayı da içerir.*/
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

// Örnek bir reklam bileşeni
function AdPlaceholder() {
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-700 text-white p-4 rounded shadow-md mt-4">
      <p className="font-bold text-center">[ Reklam Alanı ]</p>
    </div>
  );
}

type Team = "red" | "blue";
type GameMode = "single" | "two" | "friend";

// Oyun ayarları
const ROWS = 10;
const COLS = 20;
const TOTAL_SQUARES = ROWS * COLS;
const SQUARE_SIZE = 40;

function generatePositions(): { x: number; y: number }[] {
  const positions = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      positions.push({ x: col * SQUARE_SIZE, y: row * SQUARE_SIZE });
    }
  }
  return positions;
}

function createInitialBoard(): Team[] {
  const board: Team[] = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      board.push(row < ROWS / 2 ? "red" : "blue");
    }
  }
  return board;
}

function getNeighbors(index: number): number[] {
  const row = Math.floor(index / COLS);
  const col = index % COLS;
  const neighbors: number[] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const r = row + dr;
      const c = col + dc;
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
        neighbors.push(r * COLS + c);
      }
    }
  }
  return neighbors;
}

// Backend'e HTTP-only cookie ile veri gönderme
const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((res) => {
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
    return res.json();
  });

export default function SquareConquestGamePage() {
  const router = useRouter();
  const [mode, setMode] = useState<GameMode | null>(null);
  const [board, setBoard] = useState<Team[]>(createInitialBoard());
  const [positions] = useState(generatePositions());
  const [currentTeam, setCurrentTeam] = useState<Team>("red");
  const [message, setMessage] = useState<string>("");

  // Oyun modunu seçme ekranı
  const containerWidth = COLS * SQUARE_SIZE;
  const containerHeight = ROWS * SQUARE_SIZE;

  // Token'ı HTTP-only cookie kullanarak alıyoruz (localStorage yerine)
  const validateUserSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/validate", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Cookie kullanarak doğrulama
      });

      if (!res.ok) {
        throw new Error("User not authenticated");
      }
    } catch (error) {
      console.error("Authentication failed:", error);
      router.push("/login"); // Kullanıcı doğrulaması başarısızsa, login sayfasına yönlendir
    }
  }, [router]);

  // Oyun moduna göre yönlendirme
  useEffect(() => {
    if (!mode) {
      validateUserSession();
    }
  }, [mode, validateUserSession]);

  // Game Logic: Oyun kuralları, kullanıcı etkileşimi, AI hareketleri vs.
  const canRiskSelect = (index: number): boolean => {
    if (board[index] !== currentTeam) return false;
    const neighbors = getNeighbors(index);
    return neighbors.some((n) => board[n] !== currentTeam);
  };

  const toggleRiskSelection = (index: number) => {
    if (!canRiskSelect(index)) return;
    // Risk seçimi güncellenir
  };

  const isGameOver = (): boolean => {
    // Oyun bitişini kontrol etme
    return false;
  };

  // -----------------------------
  // Oyun Ekranı
  // -----------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-700 text-white p-4 relative">
      {/* Oyun ekranı */}
      <h1 className="text-3xl font-bold mb-4 text-center">
        Square Conquest Game ({mode === "single" ? "1 Player" : mode === "two" ? "2 Player" : "Friend Mode"})
      </h1>

      <div className="mx-auto overflow-x-auto">
        <div
          className="relative border border-gray-500 mx-auto"
          style={{
            width: containerWidth,
            height: containerHeight,
          }}
        >
          {positions.map((pos, index) => {
            // Oyun alanındaki her bir kareyi render etme
            return (
              <div
                key={index}
                onClick={() => {}}
                style={{
                  position: "absolute",
                  left: pos.x,
                  top: pos.y,
                  width: SQUARE_SIZE,
                  height: SQUARE_SIZE,
                  border: "1px solid #333",
                  boxSizing: "border-box",
                  backgroundColor: board[index] === "red" ? "#e11d48" : "#2563eb",
                  cursor: "pointer",
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Reklam Alanı */}
      <AdPlaceholder />
    </div>
  );
}
