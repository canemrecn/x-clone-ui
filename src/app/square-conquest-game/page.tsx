"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import useIsMobile from "@/hooks/useIsMobile";
import UsersList from "../direct-messages/UsersList";

// Örnek bir reklam bileşeni - istediğiniz tasarımla özelleştirebilirsiniz
function AdPlaceholder() {
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-700 text-white p-4 rounded shadow-md mt-4">
      <p className="font-bold text-center">[ Reklam Alanı ]</p>
    </div>
  );
}

// Takım tipi
type Team = "red" | "blue";

// Oyun modları: "single" = tek kişilik, "two" = iki kişilik, "friend" = arkadaşla
type GameMode = "single" | "two" | "friend";

// Oyun ayarları
const ROWS = 10;
const COLS = 20;
const TOTAL_SQUARES = ROWS * COLS;
const SQUARE_SIZE = 40;

// Her bir karenin konumunu hesaplar
function generatePositions(): { x: number; y: number }[] {
  const positions = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      positions.push({ x: col * SQUARE_SIZE, y: row * SQUARE_SIZE });
    }
  }
  return positions;
}

// Başlangıçta üst yarı kırmızı, alt yarı mavi
function createInitialBoard(): Team[] {
  const board: Team[] = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      board.push(row < ROWS / 2 ? "red" : "blue");
    }
  }
  return board;
}

// 8 yönlü komşuları döndürür
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

// Kopuk kareleri bulup rakibe geçiren kural
function applyDisconnectionRule(board: Team[]): Team[] {
  let newBoard = [...board];
  (["red", "blue"] as Team[]).forEach((team) => {
    const visited = new Array(TOTAL_SQUARES).fill(false);
    const queue: number[] = [];

    // Kenar karelerde kendi takımından olanları queue'ya ekliyoruz
    for (let i = 0; i < TOTAL_SQUARES; i++) {
      const row = Math.floor(i / COLS);
      const col = i % COLS;
      if (row === 0 || row === ROWS - 1 || col === 0 || col === COLS - 1) {
        if (newBoard[i] === team) {
          queue.push(i);
          visited[i] = true;
        }
      }
    }

    // BFS ile bağlı olanları işaretliyoruz
    while (queue.length) {
      const idx = queue.shift()!;
      const neighbors = getNeighbors(idx);
      neighbors.forEach((n) => {
        if (!visited[n] && newBoard[n] === team) {
          visited[n] = true;
          queue.push(n);
        }
      });
    }

    // Bağlı olmayanları rakibe geçiriyoruz
    const opponent: Team = team === "red" ? "blue" : "red";
    for (let i = 0; i < TOTAL_SQUARES; i++) {
      if (newBoard[i] === team && !visited[i]) {
        newBoard[i] = opponent;
      }
    }
  });
  return newBoard;
}

// Flood fill ile daire içine alınan kareleri hesaplamak için
function getEffectiveCount(team: Team, board: Team[]): number {
  const opponent: Team = team === "red" ? "blue" : "red";
  const visited = new Array(TOTAL_SQUARES).fill(false);
  const queue: number[] = [];

  // Kenar karelerde rakip olanları queue'ya ekliyoruz
  for (let i = 0; i < TOTAL_SQUARES; i++) {
    const row = Math.floor(i / COLS);
    const col = i % COLS;
    if (row === 0 || row === ROWS - 1 || col === 0 || col === COLS - 1) {
      if (board[i] === opponent) {
        queue.push(i);
        visited[i] = true;
      }
    }
  }

  // BFS ile bağlanan rakipleri işaretliyoruz
  while (queue.length) {
    const idx = queue.shift()!;
    const neighbors = getNeighbors(idx);
    neighbors.forEach((n) => {
      if (!visited[n] && board[n] === opponent) {
        visited[n] = true;
        queue.push(n);
      }
    });
  }

  // Ziyaret edilmeyen rakip kareler "daire içinde kalmış" demektir
  let enclosed = 0;
  for (let i = 0; i < TOTAL_SQUARES; i++) {
    if (board[i] === opponent && !visited[i]) {
      enclosed++;
    }
  }

  return board.filter((s) => s === team).length + enclosed;
}

function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

type Phase = "risk" | "conversion";

export default function SquareConquestGamePage() {
  const router = useRouter();
  const isMobile = useIsMobile();

  // Oyun ve mod durumları
  const [mode, setMode] = useState<GameMode | null>(null);
  const [board, setBoard] = useState<Team[]>(() => createInitialBoard());
  const [positions] = useState(generatePositions());
  const [currentTeam, setCurrentTeam] = useState<Team>("red");
  const [phase, setPhase] = useState<Phase>("risk");
  const [riskSelection, setRiskSelection] = useState<number[]>([]);
  const [conversionSelection, setConversionSelection] = useState<number[]>([]);
  const [message, setMessage] = useState<string>("");

  // Arkadaşla oynama için ek durumlar:
  const [showFriendModal, setShowFriendModal] = useState<boolean>(false);
  const [gameId, setGameId] = useState<string | null>(null);

  const containerWidth = COLS * SQUARE_SIZE;
  const containerHeight = ROWS * SQUARE_SIZE;

  // Takımın kare sayısını hesapla
  const countSquares = (team: Team) =>
    board.filter((square) => square === team).length;

  const getOpponent = (team: Team) => (team === "red" ? "blue" : "red");

  const isGameOver = (): boolean => {
    if (getEffectiveCount(currentTeam, board) === TOTAL_SQUARES) {
      setMessage(`${currentTeam.toUpperCase()} TAKIMI OYUNU KAZANDI!`);
      return true;
    }
    return false;
  };

  // -----------------------------
  // İNSAN OYUNCU TIKLAMALARI
  // -----------------------------
  const canRiskSelect = (index: number): boolean => {
    if (board[index] !== currentTeam) return false;
    const neighbors = getNeighbors(index);
    return neighbors.some((n) => board[n] !== currentTeam);
  };

  const toggleRiskSelection = (index: number) => {
    if (!canRiskSelect(index)) return;
    setRiskSelection((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const canConversionSelect = (index: number): boolean => {
    const opponent = getOpponent(currentTeam);
    if (board[index] !== opponent) return false;
    const neighbors = getNeighbors(index);
    return neighbors.some(
      (n) => riskSelection.includes(n) || conversionSelection.includes(n)
    );
  };

  const toggleConversionSelection = (index: number) => {
    if (!canConversionSelect(index)) return;
    setConversionSelection((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const confirmRisk = () => {
    if (riskSelection.length === 0) {
      setMessage("Lütfen risk etmek için en az bir kare seçin.");
      return;
    }
    const win = Math.random() < 0.5;
    if (win) {
      setMessage(
        `${currentTeam.toUpperCase()} takımı kazandı! Şimdi rakipten tam olarak ${riskSelection.length} kare seçin.`
      );
      setPhase("conversion");
    } else {
      const opponent = getOpponent(currentTeam);
      let newBoard = [...board];
      riskSelection.forEach((idx) => {
        newBoard[idx] = opponent;
      });
      setBoard(newBoard);
      setMessage(
        `${currentTeam.toUpperCase()} takımı kaybetti! Risk ettiğiniz kareler rakibe geçti.`
      );
      setRiskSelection([]);
      setPhase("risk");
      setCurrentTeam(opponent);

      newBoard = applyDisconnectionRule(newBoard);
      setBoard(newBoard);
    }
  };

  const confirmConversion = () => {
    if (conversionSelection.length !== riskSelection.length) {
      setMessage(`Lütfen tam olarak ${riskSelection.length} kare seçin.`);
      return;
    }
    let newBoard = [...board];
    conversionSelection.forEach((idx) => {
      newBoard[idx] = currentTeam;
    });
    setBoard(newBoard);
    setMessage(
      `${currentTeam.toUpperCase()} takımı, ${conversionSelection.length} kare kazandı!`
    );
    const opponent = getOpponent(currentTeam);
    setCurrentTeam(opponent);
    setRiskSelection([]);
    setConversionSelection([]);
    setPhase("risk");

    newBoard = applyDisconnectionRule(newBoard);
    setBoard(newBoard);
  };

  // -----------------------------
  // BİLGİSAYAR (AI) STRATEJİSİ
  // -----------------------------
  const aiTurn = () => {
    let newBoard = [...board];
    const opponent = getOpponent(currentTeam);
    const myCount = countSquares(currentTeam);
    const theirCount = countSquares(opponent);

    const validRiskIndices: number[] = [];
    for (let i = 0; i < TOTAL_SQUARES; i++) {
      if (newBoard[i] === currentTeam) {
        const neighbors = getNeighbors(i);
        if (neighbors.some((n) => newBoard[n] === opponent)) {
          validRiskIndices.push(i);
        }
      }
    }
    if (validRiskIndices.length === 0) {
      setMessage(`Bilgisayar (${currentTeam.toUpperCase()}) risk edemiyor, pas geçiyor.`);
      setCurrentTeam(opponent);
      return;
    }

    let riskCount = 2;
    if (myCount < theirCount) {
      riskCount = 2 + Math.floor(Math.random() * 2);
    } else if (myCount > theirCount) {
      riskCount = 1 + Math.floor(Math.random() * 2);
    }
    if (riskCount > validRiskIndices.length) {
      riskCount = validRiskIndices.length;
    }

    const chosenRisk = shuffle([...validRiskIndices]).slice(0, riskCount);
    const win = Math.random() < 0.5;
    if (win) {
      const validRedIndices: number[] = [];
      for (let i = 0; i < TOTAL_SQUARES; i++) {
        if (newBoard[i] === opponent) {
          const neighbors = getNeighbors(i);
          if (neighbors.some((n) => newBoard[n] === currentTeam)) {
            validRedIndices.push(i);
          }
        }
      }
      const redIndices = validRedIndices.length
        ? validRedIndices
        : newBoard.map((sq, idx) => (sq === opponent ? idx : -1)).filter((x) => x !== -1);

      if (redIndices.length === 0) {
        setMessage(`Bilgisayar (${currentTeam.toUpperCase()}) kazanacak rakip kare bulamadı!`);
      } else {
        const convertCount = Math.min(redIndices.length, chosenRisk.length);
        const chosenConvert = shuffle([...redIndices]).slice(0, convertCount);
        chosenConvert.forEach((idx) => {
          newBoard[idx] = currentTeam;
        });
        setMessage(
          `Bilgisayar (${currentTeam.toUpperCase()}) kazandı! ${convertCount} kare dönüştürdü.`
        );
      }
    } else {
      chosenRisk.forEach((idx) => {
        newBoard[idx] = opponent;
      });
      setMessage(
        `Bilgisayar (${currentTeam.toUpperCase()}) kaybetti! ${chosenRisk.length} kare rakibe geçti.`
      );
    }

    newBoard = applyDisconnectionRule(newBoard);
    setBoard(newBoard);
    setCurrentTeam(opponent);
  };

  useEffect(() => {
    if (mode === "single" && currentTeam === "blue") {
      const timer = setTimeout(() => {
        if (!isGameOver()) {
          aiTurn();
          setTimeout(() => {
            isGameOver();
          }, 300);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [mode, currentTeam]);

  // -----------------------------
  // ARKADAŞ İLE OYNA MODU & DAVET GÖNDERME
  // -----------------------------
  async function handleSelectBuddy(buddyId: number) {
    const newGameId = uuidv4();
    setGameId(newGameId);
    await sendGameInvite(buddyId, newGameId);
    router.push(`/game?gameId=${newGameId}&team=red`);
  }

  async function sendGameInvite(buddyId: number, gameId: string) {
    console.log(`Davet gönderildi: Buddy ID ${buddyId}, Game ID ${gameId}`);
    // Gerçek API çağrısı burada yapılabilir.
  }

  // -----------------------------
  // MOD SEÇİM EKRANI + OYUN ALANI
  // -----------------------------
  if (!mode) {
    // Oyun modu seçme ekranı
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-700 text-white flex flex-col items-center justify-center gap-6 p-4">
        <h1 className="text-3xl font-bold">Square Conquest Game</h1>
        <p className="text-lg">Oyun Modu Seçin:</p>
        <div className="flex gap-4">
          <button
            onClick={() => setMode("single")}
            className="px-4 py-2 bg-gradient-to-br from-blue-800 to-blue-700 rounded hover:bg-gradient-to-br hover:from-blue-700 hover:to-blue-600 transition"
          >
            1 Kişilik
          </button>
          <button
            onClick={() => setMode("two")}
            className="px-4 py-2 bg-gradient-to-br from-green-800 to-green-700 rounded hover:bg-gradient-to-br hover:from-green-700 hover:to-green-600 transition"
          >
            2 Kişilik
          </button>
        </div>

        {/* Reklam: Mod seçimi ekranının altında */}
        <AdPlaceholder />
      </div>
    );
  }

  // Oyun ekranı
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-700 text-white p-4 relative">
      {/* Arkadaş Seçimi Modal */}
      {showFriendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-800 to-gray-800 p-6 rounded shadow-md w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Arkadaşını Seç</h2>
            <UsersList
              onSelectBuddy={(buddyId) => {
                setShowFriendModal(false);
                handleSelectBuddy(buddyId);
              }}
            />
            <button
              onClick={() => setShowFriendModal(false)}
              className="mt-4 px-4 py-2 bg-gradient-to-br from-red-800 to-red-700 rounded hover:bg-gradient-to-br hover:from-red-700 hover:to-red-600 transition w-full"
            >
              İptal
            </button>
          </div>
        </div>
      )}

      <h1 className="text-3xl font-bold mb-4 text-center">
        Square Conquest Game (
        {mode === "single"
          ? "1 Kişilik"
          : mode === "two"
          ? "2 Kişilik"
          : "Arkadaşla"}
        )
      </h1>
      <p className="mb-2 text-center">
        Şu an: <span className="font-bold">{currentTeam.toUpperCase()} TAKIMI</span> oynuyor. (Etkili Kareler:{" "}
        {getEffectiveCount(currentTeam, board)})
      </p>
      {message && (
        <p className="mb-4 text-center font-bold text-lg">{message}</p>
      )}

      <div className="mx-auto overflow-x-auto">
        <div
          className="relative border border-gray-500 mx-auto"
          style={{
            width: containerWidth,
            height: containerHeight,
          }}
        >
          {positions.map((pos, index) => {
            const isRiskSelected = riskSelection.includes(index);
            const isConversionSelected = conversionSelection.includes(index);
            let onClick;
            // Tek kişilik modda mavi => Bilgisayar
            const isUserTurn = !(mode === "single" && currentTeam === "blue");

            if (isUserTurn) {
              if (phase === "risk" && board[index] === currentTeam) {
                onClick = () => toggleRiskSelection(index);
              } else if (phase === "conversion" && board[index] !== currentTeam) {
                onClick = () => toggleConversionSelection(index);
              }
            }

            return (
              <div
                key={index}
                onClick={onClick}
                style={{
                  position: "absolute",
                  left: pos.x,
                  top: pos.y,
                  width: SQUARE_SIZE,
                  height: SQUARE_SIZE,
                  border: "1px solid #333",
                  boxSizing: "border-box",
                  backgroundColor:
                    board[index] === "red" ? "#e11d48" : "#2563eb",
                  opacity:
                    (phase === "risk" &&
                      board[index] === currentTeam &&
                      isRiskSelected) ||
                    (phase === "conversion" &&
                      board[index] !== currentTeam &&
                      isConversionSelected)
                      ? 0.6
                      : 1,
                  cursor: onClick ? "pointer" : "default",
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Risk veya Dönüştür butonları */}
      {!(mode === "friend" && currentTeam === "blue") && (
        <div className="mt-4 text-center">
          {phase === "risk" ? (
            <button
              onClick={() => {
                confirmRisk();
                if (!isGameOver()) {
                  setTimeout(() => {
                    isGameOver();
                  }, 300);
                }
              }}
              className="px-4 py-2 bg-gradient-to-br from-green-800 to-green-700 rounded hover:bg-gradient-to-br hover:from-green-700 hover:to-green-600 transition"
            >
              Risk Et
            </button>
          ) : (
            <button
              onClick={() => {
                confirmConversion();
                if (!isGameOver()) {
                  setTimeout(() => {
                    isGameOver();
                  }, 300);
                }
              }}
              className="px-4 py-2 bg-gradient-to-br from-green-800 to-green-700 rounded hover:bg-gradient-to-br hover:from-green-700 hover:to-green-600 transition"
            >
              Dönüştür
            </button>
          )}
        </div>
      )}

      {/* Alt kısım: Durum bilgisi + Reklam */}
      <div className="mt-4 text-center">
        <p className="mb-2">
          Kırmızı: {board.filter((s) => s === "red").length}, Mavi:{" "}
          {board.filter((s) => s === "blue").length}
        </p>

        {/* Reklam: Oyun ekranının da altında */}
        <AdPlaceholder />
      </div>
    </div>
  );
}
