import React, { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';
import { Locale, LOCALE_LABELS, LOCALE_FLAGS } from '@/lib/translations';

const LOCALES: Locale[] = ['pt', 'en', 'fr', 'es', 'it'];

const LanguageSwitcher = () => {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-foreground/5 border border-foreground/10 text-primary-foreground/80 hover:text-primary-foreground hover:bg-foreground/10 transition-all text-sm font-bold backdrop-blur-xl"
      >
        <Globe className="w-5 h-5" />
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[90]" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-[100] bg-rocket-navy/95 backdrop-blur-2xl rounded-2xl border border-foreground/10 shadow-2xl overflow-hidden min-w-[180px]">
            {LOCALES.map((l) => (
              <button
                key={l}
                onClick={() => { setLocale(l); setOpen(false); }}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 text-sm font-bold transition-all ${
                  locale === l
                    ? 'bg-primary/20 text-primary'
                    : 'text-primary-foreground/70 hover:bg-foreground/5 hover:text-primary-foreground'
                }`}
              >
                <span className="text-lg">{LOCALE_FLAGS[l]}</span>
                {LOCALE_LABELS[l]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSwitcher;
