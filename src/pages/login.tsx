"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

export default function Login() {
  const auth = useAuth();
  const [user, setUser] = useState({ email: "", password: "" });
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Gelen Login Bilgileri:", user);

    if (auth?.login) {
      await auth.login(user.email, user.password);
      router.push("/");
    } else {
      console.error("❌ AuthContext içinde `login` fonksiyonu bulunamadı!");
    }
  };

  return (
    <div className="flex min-h-screen overflow-hidden bg-gradient-to-br from-[#C8D6DF] via-[#E1E8ED] to-[#CAD4DB] relative">
      {/* Güçlü Işık Efektleri ve Gölgelendirme */}
      <div className="absolute inset-0">
        <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-white/15 blur-[200px] rounded-full"></div>
        <div className="absolute bottom-[-150px] right-[-150px] w-[600px] h-[600px] bg-[#A8DBF0]/20 blur-[250px] rounded-full"></div>
        <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
      </div>

      {/* Sol Taraf */}
      <div className="w-1/2 flex items-center justify-center relative z-10">
        <Image
          src="/icons/son_logo2.png"
          alt="Left column background"
          width={900}
          height={900}
          className="object-contain drop-shadow-2xl"
        />
      </div>

      {/* Sağ Taraf */}
      <div className="w-1/2 flex items-center justify-center relative z-10">
        {/* Form Konteyneri */}
        <div className="relative p-10 rounded-2xl bg-gradient-to-br from-[#FAFCF2] via-[#A8DBF0] to-[#BDC4BF] border border-[#BDC4BF] shadow-[0_15px_50px_rgba(0,0,0,0.3)] before:absolute before:inset-0 before:bg-white/30 before:blur-3xl before:rounded-2xl">
          <div className="p-6 md:p-10 relative z-10">
            <form onSubmit={handleLogin} className="flex flex-col gap-6">
              <h1 className="text-center text-2xl font-bold text-[#3E6A8A]">
                Login
              </h1>

              {/* GIF */}
              <div className="flex justify-center">
                <h1 className="text-lg font-semibold text-[#3E6A8A]">UNDERGO</h1>
              </div>

              {/* Email Input */}
              <input
                type="email"
                placeholder="Email"
                className="p-3 rounded-lg text-gray-800 bg-white/50 placeholder-gray-600 border border-[#BDC4BF] focus:outline-none focus:ring-2 focus:ring-[#A8DBF0] shadow-md"
                onChange={(e) => setUser({ ...user, email: e.target.value })}
              />

              {/* Password Input */}
              <input
                type="password"
                placeholder="Password"
                className="p-3 rounded-lg text-gray-800 bg-white/50 placeholder-gray-600 border border-[#BDC4BF] focus:outline-none focus:ring-2 focus:ring-[#A8DBF0] shadow-md"
                onChange={(e) => setUser({ ...user, password: e.target.value })}
              />

              {/* Login Button */}
              <button
                type="submit"
                className="py-3 px-4 font-semibold rounded-lg bg-[#A8DBF0] text-[#3E6A8A] hover:bg-[#3E6A8A] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#A8DBF0] shadow-lg"
              >
                Login
              </button>

              {/* Şifremi Unuttum Linki */}
              <button
                type="button"
                onClick={() => router.push("/forgot-password")}
                className="text-sm text-blue-600 hover:underline"
              >
                Şifremi Unuttum?
              </button>

              {/* Go to Register */}
              <button
                type="button"
                onClick={() => router.push("/register")}
                className="py-3 px-4 font-semibold rounded-lg bg-[#BDC4BF] text-[#3E6A8A] hover:bg-[#3E6A8A] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#BDC4BF] shadow-lg"
              >
                Don't have an account?
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
