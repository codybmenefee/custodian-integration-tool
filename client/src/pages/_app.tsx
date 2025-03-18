import React, { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { AuthProvider } from '../contexts/AuthContext';
import { CustomChakraProvider } from '../ui/chakra-adapter';
import { RouterAdapter } from '../components/router/RouterAdapter';
import { initializeGlobalErrorHandlers } from '../utils/globalErrorHandler';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  // Initialize global error handlers on client-side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      initializeGlobalErrorHandlers();
    }
  }, []);

  return (
    <CustomChakraProvider>
      <RouterAdapter>
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      </RouterAdapter>
    </CustomChakraProvider>
  );
} 