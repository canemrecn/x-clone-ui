// src/app/layout.tsx
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import LeftBar from "@/components/LeftBar";
import RightBar from "@/components/RightBar";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "X-Clone",
  description: "Social media clone with Next.js",
};

export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#cae1ff] text-black">
        <AuthProvider>
          <Navbar />
          {/* LeftBar ve Navbar arasında minik bir boşluk (isteğe bağlı) */}
          <div className="mb-4" />

          <LeftBar />

          <div className="min-h-screen flex">
            <aside className="hidden lg:block lg:w-1/4"></aside>

            {/* Ana içerik: Navbar ile arasında boşluk için mt-8 eklendi */}
            <main className="mt-8 w-full lg:w-1/2 p-1">
              {children}
              {modal}
            </main>

            <aside className="hidden lg:block lg:w-1/4">
              <RightBar />
            </aside>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
