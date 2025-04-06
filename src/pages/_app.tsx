// src/pages/_app.tsx
import React from 'react';
import { AuthProvider } from '@/context/AuthContext'; // AuthContext'i import et


function MyApp({ Component, pageProps }: any) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
