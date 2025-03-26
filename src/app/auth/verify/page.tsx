// src/app/auth/verify/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function VerifyEmail() {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const router = useRouter();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, verificationCode }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        router.push("/login");
      } else {
        alert(data.error || data.message);
      }
    } catch (error: any) {
      alert(error.message || "Verification failed.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-800 to-gray-700 text-white">
      <form onSubmit={handleVerify} className="p-10 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-700 shadow-2xl">
        <h1 className="text-center text-2xl font-bold mb-4">Doğrulama</h1>
        <input
          type="email"
          placeholder="Email"
          className="p-3 rounded-lg mb-3 bg-gray-900 text-white border border-gray-300 focus:ring-2 focus:ring-gray-600 outline-none"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Doğrulama Kodu"
          className="p-3 rounded-lg mb-3 bg-gray-900 text-white border border-gray-300 focus:ring-2 focus:ring-gray-600 outline-none"
          onChange={(e) => setVerificationCode(e.target.value)}
          required
        />
        <button
          type="submit"
          className="py-3 px-4 font-semibold rounded-lg bg-gradient-to-br from-gray-800 to-gray-700 text-white hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-600 transition-all"
        >
          Doğrula
        </button>
      </form>
    </div>
  );
}
