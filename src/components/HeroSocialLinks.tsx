import React from 'react';
import { Facebook, Instagram, MessageCircle } from 'lucide-react';
import { useSiteContent } from '@/contexts/SiteContentContext';

const HeroSocialLinks = () => {
  const { content } = useSiteContent();
  const links = content.socialLinks;

  if (!links) return null;

  const items = [
    { url: links.facebook, icon: Facebook, label: 'Facebook' },
    { url: links.instagram, icon: Instagram, label: 'Instagram' },
    { url: links.whatsapp, icon: MessageCircle, label: 'WhatsApp' },
  ].filter((item) => item.url);

  if (!items.length) return null;

  return (
    <div className="absolute left-6 top-1/2 -translate-y-1/2 z-20 hidden xl:flex flex-col gap-4">
      {items.map(({ url, icon: Icon, label }) => (
        <a
          key={label}
          href={label === 'WhatsApp' ? `https://wa.me/${url.replace(/\D/g, '')}` : url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-11 h-11 rounded-full border border-white/15 bg-white/[0.05] backdrop-blur-xl flex items-center justify-center text-white/40 hover:text-white hover:border-white/40 hover:bg-white/10 hover:scale-110 transition-all"
          aria-label={label}
        >
          <Icon className="w-5 h-5" strokeWidth={1.5} />
        </a>
      ))}
    </div>
  );
};

export default HeroSocialLinks;
