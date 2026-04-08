/**
 * @site EDITABLE - Site content component
 * @description Client logos carousel section
 * @editable true
 * @module site
 */
import React, { useRef, useEffect, useState } from 'react';
import { useSiteContent } from '@/contexts/SiteContentContext';

const ClientLogosCarousel = () => {
  const { content } = useSiteContent();
  const c = content.clientLogos;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animationId: number;
    let scrollPos = 0;

    const step = () => {
      if (!isPaused && el) {
        scrollPos += 0.8;
        if (scrollPos >= el.scrollWidth / 2) {
          scrollPos = 0;
        }
        el.scrollLeft = scrollPos;
      }
      animationId = requestAnimationFrame(step);
    };

    animationId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationId);
  }, [isPaused]);

  if (c.items.length === 0) return null;

  // Duplicate items for infinite scroll effect
  const displayItems = [...c.items, ...c.items];

  return (
    <div className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-center text-xs font-black text-muted-foreground mb-12 uppercase tracking-[0.3em]">
          {c.title}
        </h2>

        <div
          ref={scrollRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="flex gap-16 overflow-hidden hide-scrollbar"
        >
          {displayItems.map((item, idx) => (
            <div
              key={`${item.name}-${idx}`}
              className="flex-shrink-0 flex items-center justify-center w-[160px] h-[80px] group cursor-pointer"
            >
              <img
                src={item.logoUrl}
                alt={item.name}
                className="max-w-[140px] max-h-[60px] object-contain brightness-0 invert opacity-30 grayscale transition-all duration-500 group-hover:opacity-100 group-hover:grayscale-0 group-hover:scale-110 group-hover:brightness-0 group-hover:invert"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientLogosCarousel;
