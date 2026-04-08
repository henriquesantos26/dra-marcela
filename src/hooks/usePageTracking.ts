import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const SESSION_KEY = '7zion_session_id';

const getSessionId = () => {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
};

const getUtmParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get('utm_source'),
    utmMedium: params.get('utm_medium'),
    utmCampaign: params.get('utm_campaign'),
    utmTerm: params.get('utm_term'),
    utmContent: params.get('utm_content'),
  };
};

export const usePageTracking = () => {
  useEffect(() => {
    const track = async () => {
      try {
        const utm = getUtmParams();
        await supabase.functions.invoke('track-visit', {
          body: {
            sessionId: getSessionId(),
            pageUrl: window.location.pathname,
            referrer: document.referrer || null,
            userAgent: navigator.userAgent,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            language: navigator.language,
            ...utm,
          },
        });
      } catch {
        // Silent fail - don't break user experience
      }
    };

    // Small delay to not block rendering
    const timer = setTimeout(track, 1000);
    return () => clearTimeout(timer);
  }, []);
};
