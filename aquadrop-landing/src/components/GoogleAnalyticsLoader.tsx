'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

const GA_MEASUREMENT_ID = 'G-KE6Z8CCYL4';
const COOKIE_CONSENT_KEY = 'aquadrop_cookie_consent';

export default function GoogleAnalyticsLoader() {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const consentValue = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    setHasConsent(consentValue === 'accepted');
  }, []);

  if (!hasConsent) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `,
        }}
      />
    </>
  );
}
