//src/pages/_app.tsx
import { AuthProvider } from "@/context/AuthContext";
import "@/app/globals.css";

export default function MyApp({ Component, pageProps }: any) {
  return (
    <AuthProvider> {/* ✅ AuthProvider eklendi */}
      <Component {...pageProps} />
    </AuthProvider>
  );
}
