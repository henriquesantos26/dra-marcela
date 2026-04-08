import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const TrackingScriptInjector = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loaded) return;

    const inject = async () => {
      const { data } = await supabase
        .from('tracking_scripts')
        .select('head_code, body_code, is_active, slug')
        .eq('is_active', true);

      if (!data || data.length === 0) return;

      data.forEach((script: any) => {
        // Inject head code
        if (script.head_code?.trim()) {
          const container = document.createElement('div');
          container.innerHTML = script.head_code;
          const nodes = Array.from(container.childNodes);
          nodes.forEach(node => {
            if (node instanceof HTMLScriptElement) {
              const s = document.createElement('script');
              if (node.src) s.src = node.src;
              if (node.async) s.async = true;
              if (node.textContent) s.textContent = node.textContent;
              document.head.appendChild(s);
            } else if (node instanceof HTMLElement) {
              document.head.appendChild(node.cloneNode(true));
            }
          });
        }

        // Inject body code
        if (script.body_code?.trim()) {
          const container = document.createElement('div');
          container.innerHTML = script.body_code;
          const nodes = Array.from(container.childNodes);
          nodes.forEach(node => {
            if (node instanceof HTMLElement) {
              document.body.insertBefore(node.cloneNode(true), document.body.firstChild);
            }
          });
        }
      });

      setLoaded(true);
    };

    inject();
  }, [loaded]);

  return null;
};

export default TrackingScriptInjector;
