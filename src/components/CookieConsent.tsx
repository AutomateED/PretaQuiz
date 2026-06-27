import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'cookie-consent';

function loadTrackingScripts() {
  // GA4
  if (!document.getElementById('gtag-script')) {
    const gtagScript = document.createElement('script');
    gtagScript.id = 'gtag-script';
    gtagScript.async = true;
    gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-BKNEG1EGEG';
    document.head.appendChild(gtagScript);

    const gtagInline = document.createElement('script');
    gtagInline.textContent = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-BKNEG1EGEG');
    `;
    document.head.appendChild(gtagInline);
  }

  // Meta Pixel
  if (!(window as any).fbq) {
    const fbScript = document.createElement('script');
    fbScript.textContent = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '1607971650490647');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(fbScript);
  }
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const isEmbedded = window.self !== window.top;

  useEffect(() => {
    if (isEmbedded) return;
    const consent = localStorage.getItem(STORAGE_KEY);
    if (consent === 'accepted') {
      loadTrackingScripts();
    } else if (!consent) {
      setVisible(true);
    }
  }, [isEmbedded]);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    loadTrackingScripts();
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(STORAGE_KEY, 'declined');
    setVisible(false);
  };

  if (isEmbedded) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 24, stiffness: 260 }}
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg rounded-xl border p-4 shadow-lg backdrop-blur-md sm:bottom-6 sm:left-6 sm:right-auto"
          style={{
            backgroundColor: 'rgba(32, 21, 56, 0.95)',
            borderColor: 'rgba(217, 70, 239, 0.2)',
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: 'rgba(217, 70, 239, 0.15)' }}
            >
              <Cookie className="h-4 w-4" style={{ color: 'hsl(var(--accent))' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium" style={{ color: '#FFFFFF' }}>
                We use cookies
              </p>
              <p className="mt-1 text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
                We use cookies for analytics to improve your experience. You can accept or decline non-essential cookies. See our{' '}
                <Link to="/privacy" className="underline hover:opacity-80" style={{ color: 'hsl(var(--accent))' }}>
                  Privacy Policy
                </Link>
                .
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={decline}
                  className="text-xs font-semibold"
                  style={{
                    backgroundColor: 'transparent',
                    color: '#FFFFFF',
                    borderColor: 'rgba(255,255,255,0.25)',
                  }}
                >
                  Decline
                </Button>
                <Button
                  size="sm"
                  onClick={accept}
                  className="text-xs font-semibold"
                  style={{ backgroundColor: 'hsl(var(--accent))', color: '#FFFFFF' }}
                >
                  Accept
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
