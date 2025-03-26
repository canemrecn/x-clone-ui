import { AuthProvider } from "@/context/AuthContext";
import "@/app/globals.css";

export default function MyApp({ Component, pageProps }: any) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-700 text-white">
        <Component {...pageProps} />
      </div>
    </AuthProvider>
  );
}
