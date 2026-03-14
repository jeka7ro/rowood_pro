import { useEffect } from 'react';

export default function GoogleAnalytics() {
  useEffect(() => {
    // Load Google Analytics script
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = 'https://www.googletagmanager.com/gtag/js?id=G-8775NHNB9B';
    document.head.appendChild(script1);

    // Initialize gtag
    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-8775NHNB9B');
    `;
    document.head.appendChild(script2);

    return () => {
      // Cleanup on unmount
      document.head.removeChild(script1);
      document.head.removeChild(script2);
    };
  }, []);

  return null;
}