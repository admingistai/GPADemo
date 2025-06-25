import '../styles/globals.css';
import Head from 'next/head';
import { useEffect } from 'react';
import * as amplitude from '@amplitude/analytics-browser';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Initialize Amplitude with your API key
    amplitude.init('YOUR-API-KEY-HERE', {
      defaultTracking: true,
    });
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