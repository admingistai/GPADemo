import { useEffect } from 'react';
import { initAnalytics } from '../utils/analytics';
import '../styles/globals.css';
import Head from 'next/head';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Initialize Amplitude with API key from environment variable
    const AMPLITUDE_API_KEY = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;
    if (AMPLITUDE_API_KEY) {
      initAnalytics(AMPLITUDE_API_KEY);
    } else {
      console.warn('Amplitude API key not found in environment variables');
    }
  }, []);

  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Poppins:wght@300;400;500;600;700;800;900&family=Kalam:wght@300;400;700&display=swap" 
          rel="stylesheet" 
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}