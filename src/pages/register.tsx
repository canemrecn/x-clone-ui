// src/app/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Register() {
  const [user, setUser] = useState({
    full_name: "",
    username: "",
    email: "",
    password: "",
    securityQuestion: "",
    securityAnswer: "",
  });

  const router = useRouter();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(user),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (res.ok) {
      router.push("/login");
    } else {
      // Hata mesajını gösterebilirsiniz.
      alert(data.message);
    }
  };

  return (
    <div className="flex min-h-screen overflow-hidden bg-gradient-to-br from-[#C8D6DF] via-[#E1E8ED] to-[#CAD4DB] relative">
      {/* Arka Plan İçin Ekstra Işıklandırmalar */}
      <div className="absolute inset-0 bg-white/10 blur-[120px] rounded-3xl"></div>

      {/* Sol Taraf */}
      <div className="w-1/2 flex items-center justify-center relative">
        <Image
          src="/icons/son_logo2.png"
          alt="Left column background"
          width={900}
          height={900}
          className="object-contain drop-shadow-xl"
        />
      </div>

      {/* Sağ Taraf */}
      <div className="w-1/2 flex items-center justify-center relative">
        {/* Form Konteyneri */}
        <div className="relative p-10 rounded-2xl bg-gradient-to-br from-[#FAFCF2] via-[#A8DBF0] to-[#BDC4BF] border border-[#BDC4BF] shadow-lg before:absolute before:inset-0 before:bg-white/20 before:blur-xl before:rounded-2xl">
          <div className="p-6 md:p-10 relative z-10">
            <form onSubmit={handleRegister} className="flex flex-col gap-6">
              <h1 className="text-center text-2xl font-bold text-[#3E6A8A]">
                Register
              </h1>

              {/* GIF */}
              <div className="flex justify-center">
                <h1 className="text-lg font-semibold text-[#3E6A8A]">UNDERGO</h1>
              </div>

              {/* Inputs */}
              <input
                type="text"
                placeholder="Full Name"
                className="p-3 rounded-lg text-gray-800 bg-white/40 placeholder-gray-600 border border-[#BDC4BF] focus:outline-none focus:ring-2 focus:ring-[#A8DBF0] shadow-sm"
                onChange={(e) =>
                  setUser({ ...user, full_name: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder="Username"
                className="p-3 rounded-lg text-gray-800 bg-white/40 placeholder-gray-600 border border-[#BDC4BF] focus:outline-none focus:ring-2 focus:ring-[#A8DBF0] shadow-sm"
                onChange={(e) =>
                  setUser({ ...user, username: e.target.value })
                }
                required
              />
              <input
                type="email"
                placeholder="Email"
                className="p-3 rounded-lg text-gray-800 bg-white/40 placeholder-gray-600 border border-[#BDC4BF] focus:outline-none focus:ring-2 focus:ring-[#A8DBF0] shadow-sm"
                onChange={(e) =>
                  setUser({ ...user, email: e.target.value })
                }
                required
              />
              <input
                type="password"
                placeholder="Password"
                className="p-3 rounded-lg text-gray-800 bg-white/40 placeholder-gray-600 border border-[#BDC4BF] focus:outline-none focus:ring-2 focus:ring-[#A8DBF0] shadow-sm"
                onChange={(e) =>
                  setUser({ ...user, password: e.target.value })
                }
                required
              />
              {/* Güvenlik Sorusu ve Cevabı */}
              <input
                type="text"
                placeholder="Security Question (Örn: İlk evcil hayvanınızın adı?)"
                className="p-3 rounded-lg text-gray-800 bg-white/40 placeholder-gray-600 border border-[#BDC4BF] focus:outline-none focus:ring-2 focus:ring-[#A8DBF0] shadow-sm"
                onChange={(e) =>
                  setUser({ ...user, securityQuestion: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder="Security Answer (Örn: Karabaş)"
                className="p-3 rounded-lg text-gray-800 bg-white/40 placeholder-gray-600 border border-[#BDC4BF] focus:outline-none focus:ring-2 focus:ring-[#A8DBF0] shadow-sm"
                onChange={(e) =>
                  setUser({ ...user, securityAnswer: e.target.value })
                }
                required
              />

              {/* Butonlar */}
              <button
                type="submit"
                className="py-3 px-4 font-semibold rounded-lg bg-[#A8DBF0] text-[#3E6A8A] hover:bg-[#3E6A8A] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#A8DBF0] shadow-md"
              >
                Register
              </button>

              <button
                type="button"
                onClick={() => router.push("/login")}
                className="py-3 px-4 font-semibold rounded-lg bg-[#BDC4BF] text-[#3E6A8A] hover:bg-[#3E6A8A] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#BDC4BF] shadow-md"
              >
                Do you have an account?
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
