/**
 * @site EDITABLE - Site content components
 * @description Landing page section components (Hero, TrustedBy, Stats, etc.)
 * @editable true
 * @module site
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronDown, Menu, X, Send,
  ArrowRight, Quote, Twitter, Instagram,
  Linkedin, Github, ChevronUp,
} from 'lucide-react';
import { triggerChat } from '@/hooks/useChatTrigger';
import { useSiteContent } from '@/contexts/SiteContentContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLocale } from '@/contexts/LocaleContext';
import HeroBlogCard from '@/components/HeroBlogCard';
import HeroMusicPlayer from '@/components/HeroMusicPlayer';
import HeroSocialLinks from '@/components/HeroSocialLinks';
import EditableText from '@/components/inline-edit/EditableText';
import EditableElement from '@/components/inline-edit/EditableElement';

const TEMPLATE_CATEGORIES = ["One prompt", "Backend", "Launch", "Templates", "Landing pages"];

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { content } = useSiteContent();
  const gradient = `linear-gradient(to right, ${content.branding.gradientFrom}, ${content.branding.gradientTo})`;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 ${scrolled ? 'py-4 bg-rocket-dark/95 backdrop-blur-xl shadow-lg' : 'py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center">
          <EditableElement elementId="navbar.logo" elementType="image" label="Logo">
            <img src={content.branding.logoUrl} alt="7 Zion" className="h-10 w-auto" />
          </EditableElement>
        </div>

        <div className={`hidden md:flex items-center gap-5 px-6 py-2.5 rounded-full border text-sm font-medium transition-all duration-300 ${scrolled ? 'bg-foreground/10 border-foreground/10 text-primary-foreground' : 'bg-foreground/5 backdrop-blur-xl border-foreground/10 text-primary-foreground/90'}`}>
          <a href="#" className="hover:text-primary transition-colors whitespace-nowrap">Google Ads</a>
          <a href="#" className="hover:text-primary transition-colors whitespace-nowrap">Meta Ads</a>
          <a href="#" className="hover:text-primary transition-colors whitespace-nowrap">Mídia Social</a>
          <a href="#" className="hover:text-primary transition-colors whitespace-nowrap">Branding</a>
          <a href="#" className="hover:text-primary transition-colors whitespace-nowrap">Edição de Vídeos</a>
          <a href="#" className="hover:text-primary transition-colors whitespace-nowrap">Dev de Sistemas</a>
        </div>

        <div className="hidden md:flex items-center">
          <LanguageSwitcher />
        </div>

        <div className="md:hidden flex items-center gap-2">
          <LanguageSwitcher />
          <button className="text-primary-foreground p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-4 right-4 mt-2 bg-rocket-navy/95 backdrop-blur-2xl p-6 rounded-3xl border border-foreground/10 shadow-2xl flex flex-col gap-4">
          <a href="#" className="block py-3 text-lg font-medium text-primary-foreground border-b border-foreground/5">Google Ads</a>
          <a href="#" className="block py-3 text-lg font-medium text-primary-foreground border-b border-foreground/5">Meta Ads</a>
          <a href="#" className="block py-3 text-lg font-medium text-primary-foreground border-b border-foreground/5">Mídia Social</a>
          <a href="#" className="block py-3 text-lg font-medium text-primary-foreground border-b border-foreground/5">Branding</a>
          <a href="#" className="block py-3 text-lg font-medium text-primary-foreground border-b border-foreground/5">Edição de Vídeos</a>
          <a href="#" className="block py-3 text-lg font-medium text-primary-foreground border-b border-foreground/5">Dev de Sistemas</a>
        </div>
      )}
    </nav>
  );
};

export const Hero = () => {
  const { content } = useSiteContent();
  const [heroInput, setHeroInput] = useState('');
  const h = content.hero;
  const gradient = `linear-gradient(to right, ${content.branding.gradientFrom}, ${content.branding.gradientTo})`;

  const handleHeroSend = () => {
    if (!heroInput.trim()) return;
    triggerChat(heroInput.trim());
    setHeroInput('');
  };

  return (
    <section className="relative min-h-screen w-full flex flex-col items-center justify-center text-center px-4 overflow-visible pt-20">
      <div className="absolute inset-0 z-0 bg-rocket-dark">
        <div
          className="absolute inset-0 opacity-40 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-rocket-dark/80 to-rocket-dark" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[120px] pointer-events-none" style={{ background: `${content.branding.gradientFrom}33` }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
        <EditableElement elementId="hero.badge" elementType="container" label="Badge">
          <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-[0.2em] backdrop-blur-md animate-bounce-subtle" style={{ background: `${content.branding.badgeColor}1a`, borderColor: `${content.branding.badgeColor}33`, color: content.branding.badgeColor }}>
            <span className="w-2 h-2 rounded-full" style={{ background: content.branding.badgeColor, boxShadow: `0 0 10px ${content.branding.badgeColor}cc` }}></span>
            <EditableText fieldPath="hero.badge" className="inline">{h.badge}</EditableText>
          </div>
        </EditableElement>

        <h1 className="text-6xl md:text-8xl font-black text-primary-foreground mb-6 tracking-tight leading-[0.9] drop-shadow-2xl">
          <EditableText fieldPath="hero.titleLine1" as="span">{h.titleLine1}</EditableText><br />
          <EditableText fieldPath="hero.titleLine2" as="span" className="text-transparent bg-clip-text" style={{ backgroundImage: gradient }}>{h.titleLine2}</EditableText>
        </h1>

        <EditableText fieldPath="hero.subtitle" as="p" className="text-xl md:text-2xl text-muted-foreground mb-12 font-medium max-w-2xl">
          {h.subtitle}
        </EditableText>

        <EditableElement elementId="hero.inputBox" elementType="container" label="Input Box">
          <div className="w-full max-w-2xl">
            <div className="relative bg-white/[0.06] backdrop-blur-2xl rounded-2xl border border-white/[0.15] p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:border-white/[0.25] transition-all group">
              <div className="flex items-center gap-3 px-5 py-3">
                <input
                  type="text"
                  value={heroInput}
                  onChange={(e) => setHeroInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleHeroSend()}
                  placeholder={h.placeholder}
                  className="flex-1 bg-transparent text-primary-foreground placeholder-white/30 text-lg outline-none font-medium"
                />
                <button
                  onClick={handleHeroSend}
                  disabled={!heroInput.trim()}
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-primary-foreground shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-30"
                  style={{ background: gradient }}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </EditableElement>
      </div>

      <HeroSocialLinks />
      <HeroBlogCard />
      <HeroMusicPlayer />
    </section>
  );
};

export const TrustedBy = () => {
  const { content } = useSiteContent();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const brandItems = content.trustedBy.items || [];

  const itemsWithLogo = brandItems.filter((b) => b.logoUrl);
  const needsInfiniteScroll = itemsWithLogo.length >= 5;
  const displayItems = needsInfiniteScroll ? [...itemsWithLogo, ...itemsWithLogo] : itemsWithLogo;

  useEffect(() => {
    if (!needsInfiniteScroll) return;
    const el = scrollRef.current;
    if (!el) return;
    let animationId: number;
    let pos = 0;
    const step = () => {
      if (!isPaused && el) {
        pos += 0.4;
        if (pos >= el.scrollWidth / 2) pos = 0;
        el.scrollLeft = pos;
      }
      animationId = requestAnimationFrame(step);
    };
    animationId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationId);
  }, [isPaused, needsInfiniteScroll]);

  if (itemsWithLogo.length === 0) return null;

  return (
    <div className="py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-xs font-black text-muted-foreground mb-10 uppercase tracking-[0.3em] text-center">{content.trustedBy.label}</p>
      </div>
      <div
        ref={scrollRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className={`flex gap-5 overflow-hidden hide-scrollbar px-6 ${!needsInfiniteScroll ? 'justify-center' : ''}`}
      >
        {displayItems.map((brand, idx) => (
          <div
            key={`brand-${idx}`}
            className="flex-shrink-0 flex items-center justify-center px-5 py-3 rounded-xl border border-foreground/10 bg-transparent hover:border-foreground/25 transition-all duration-300 cursor-default select-none group/brand"
          >
            <img
              src={brand.logoUrl}
              alt={brand.name || 'Marca parceira'}
              className="h-8 w-auto opacity-60 grayscale group-hover/brand:grayscale-0 group-hover/brand:opacity-100 transition-all duration-300 invert"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export const FeatureBanner = () => {
  const { content } = useSiteContent();
  const f = content.featureBanner;
  return (
    <div className="py-32 px-6">
      <div className="max-w-7xl mx-auto relative rounded-[48px] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] h-[600px] group border border-border">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[2s] group-hover:scale-110"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2064&auto=format&fit=crop')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-rocket-dark/90 to-primary/40" />
        </div>

        <EditableElement elementId="featureBanner.content" elementType="container" label="Banner Content">
          <div className="relative z-10 h-full flex flex-col justify-center px-12 md:px-24 text-primary-foreground max-w-4xl">
            <EditableText fieldPath="featureBanner.subtitle" as="h2" className="text-xl font-bold mb-4 text-primary uppercase tracking-widest">{f.subtitle}</EditableText>
            <h3 className="text-6xl md:text-7xl font-black mb-8 leading-[0.95] tracking-tighter">
              <EditableText fieldPath="featureBanner.titleLine1" as="span">{f.titleLine1}</EditableText>{' '}<br />
              <EditableText fieldPath="featureBanner.titleLine2" as="span" className="italic">{f.titleLine2}</EditableText>
            </h3>
            <EditableText fieldPath="featureBanner.description" as="p" className="text-xl text-primary-foreground/80 max-w-xl leading-relaxed bg-foreground/10 backdrop-blur-xl p-8 rounded-[32px] border border-foreground/20 shadow-2xl">
              {f.description}
            </EditableText>
          </div>
        </EditableElement>

        <div className="absolute right-[-80px] top-1/2 -translate-y-1/2 hidden xl:block w-[700px] h-[450px] bg-rocket-navy rounded-3xl border-[12px] border-rocket-slate/30 shadow-2xl p-6 transform rotate-[-3deg] group-hover:rotate-0 transition-transform duration-700">
          <div className="w-full h-full bg-rocket-dark rounded-xl overflow-hidden font-mono text-sm p-8 text-primary/80 flex flex-col gap-4">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive/50"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-rocket-emerald/50"></div>
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-primary">$ npx create-rocket-app@latest</p>
              <p className="text-muted-foreground">&gt; Analyzing prompt: "Build a modern CRM..."</p>
              <p className="text-rocket-emerald">&gt; Backend logic generated.</p>
              <p className="text-rocket-emerald">&gt; Postgres DB provisioned.</p>
              <p className="text-rocket-emerald">&gt; Authentication initialized.</p>
              <p className="text-primary">&gt; Deploying to Vercel... 100%</p>
              <p className="text-primary-foreground font-bold mt-4">🚀 Successfully launched at rocket-crm.app</p>
              <div className="w-full h-1 bg-rocket-navy rounded-full mt-8">
                <div className="w-full h-full bg-rocket-emerald shadow-[0_0_10px_hsl(var(--rocket-emerald))] animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Templates = () => {
  const [activeCategory, setActiveCategory] = useState(TEMPLATE_CATEGORIES[0]);

  return (
    <div className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20">
          <h2 className="text-6xl font-black text-foreground mb-6 tracking-tighter">Templates</h2>
          <p className="text-muted-foreground text-2xl font-medium">Jump start your ideas today.</p>
          <p className="text-sm font-bold text-muted-foreground/60 mt-2 uppercase tracking-widest">Top quality templates created by experts. Select one to clone.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-16">
          <div className="w-full lg:w-72 flex-shrink-0">
            <div className="flex flex-col gap-3">
              {TEMPLATE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-left px-6 py-4 rounded-2xl text-lg font-bold transition-all ${
                    activeCategory === cat
                      ? 'bg-foreground text-background shadow-xl translate-x-2'
                      : 'text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  {cat}
                </button>
              ))}
              <EditableElement elementId="templates.cta" elementType="button" label="CTA Button">
                <button className="mt-12 bg-primary text-primary-foreground px-8 py-5 rounded-2xl text-lg font-black hover:bg-primary/90 transition-all text-center shadow-2xl shadow-primary/30 hover:scale-[1.02]">
                  Explore 500+ templates
                </button>
              </EditableElement>
            </div>
          </div>

          <div className="flex-1 bg-secondary rounded-[40px] p-8 lg:p-12 min-h-[600px] relative overflow-hidden group">
            <div className="bg-background rounded-[32px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] overflow-hidden h-full flex flex-col border border-border transition-transform duration-700 group-hover:scale-[1.02]">
              <div className="bg-secondary px-6 py-4 border-b flex items-center gap-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-border"></div>
                  <div className="w-3 h-3 rounded-full bg-border"></div>
                  <div className="w-3 h-3 rounded-full bg-border"></div>
                </div>
                <div className="flex-1 bg-background border border-border rounded-full h-8 flex items-center px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  https://rocket.ai/preview/landing-v2
                </div>
              </div>
              <div className="flex-1 relative bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop)' }}>
                <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] flex flex-col items-center justify-center p-12">
                  <div className="text-center text-primary-foreground">
                    <h3 className="text-5xl font-black mb-6 tracking-tight">SaaS Landing Page</h3>
                    <p className="text-lg text-primary-foreground/80 mb-8 max-w-md mx-auto">Conversion-optimized layout with dark mode support and interactive charts.</p>
                    <button className="bg-primary-foreground text-rocket-dark px-10 py-4 rounded-2xl font-black text-lg shadow-2xl shadow-primary-foreground/20 hover:scale-105 transition-transform">Use this Template</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Stats = () => {
  const { content } = useSiteContent();
  const gradient = `linear-gradient(to right, ${content.branding.gradientFrom}, ${content.branding.gradientTo})`;
  return (
    <div className="text-primary-foreground py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-0">
          {content.stats.items.map((stat, idx) => (
            <div key={idx} className="text-center group">
              <div className="text-7xl md:text-8xl font-black mb-4 tracking-tighter text-transparent bg-clip-text group-hover:scale-110 transition-transform duration-500" style={{ backgroundImage: gradient }}>{stat.value}</div>
              <div className="text-lg font-bold text-primary-foreground mb-2">{stat.label}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-[0.4em]">{stat.sublabel}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const Testimonials = () => {
  const { content } = useSiteContent();
  const t = content.testimonials;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animationId: number;
    let scrollPos = el.scrollLeft;

    const step = () => {
      if (!isPaused && el) {
        scrollPos += 0.6;
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

  const displayItems = [...t.items, ...t.items];

  return (
    <section className="relative py-40 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-rocket-dark via-transparent to-rocket-dark" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-24">
          <EditableText fieldPath="testimonials.title" as="h2" className="text-6xl md:text-7xl font-black text-primary-foreground mb-6 tracking-tighter">{t.title}</EditableText>
          <EditableText fieldPath="testimonials.subtitle" as="p" className="text-muted-foreground max-w-2xl mx-auto text-xl font-medium">{t.subtitle}</EditableText>
        </div>

        <div
          ref={scrollRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="flex gap-8 overflow-hidden hide-scrollbar pb-12 px-4"
        >
          {displayItems.map((item, idx) => (
            <div key={`${item.name}-${idx}`} className="min-w-[350px] w-[calc(33.333%-22px)] flex-shrink-0 bg-foreground/5 backdrop-blur-3xl rounded-[40px] p-10 text-primary-foreground border border-foreground/10 relative group hover:bg-foreground/10 transition-all duration-500 hover:scale-105 hover:z-20 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] cursor-default shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <img src={item.avatar} alt={item.name} className="w-14 h-14 rounded-2xl border-2 border-foreground/20 shadow-xl" />
                  <div>
                    <div className="font-black text-lg tracking-tight">{item.name}</div>
                    <div className="text-sm font-bold text-primary uppercase tracking-widest">{item.role}</div>
                  </div>
                </div>
                <Quote className="w-8 h-8 text-primary opacity-50" />
              </div>
              <p className="text-xl leading-relaxed font-medium text-muted-foreground italic">"{item.text}"</p>
            </div>
          ))}
        </div>

        <EditableElement elementId="testimonials.cta" elementType="button" label="CTA Button">
          <div className="flex justify-center mt-12">
            <button className="bg-primary-foreground text-foreground px-10 py-4 rounded-2xl font-black text-lg shadow-2xl hover:scale-105 hover:shadow-primary-foreground/10 transition-all flex items-center gap-3">
              Read all stories <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </EditableElement>
      </div>
    </section>
  );
};

export const FAQ = () => {
  const { content } = useSiteContent();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="py-40 px-6">
      <div className="max-w-4xl mx-auto">
        <EditableText fieldPath="faqs.title" as="h2" className="text-6xl font-black text-foreground text-center mb-8 tracking-tighter">{content.faqs.title}</EditableText>
        <EditableText fieldPath="faqs.subtitle" as="p" className="text-center text-muted-foreground mb-20 text-xl font-medium">{content.faqs.subtitle}</EditableText>

        <div className="flex flex-col gap-6">
          {content.faqs.items.map((faq, idx) => (
            <div key={idx} className={`rounded-[32px] overflow-hidden transition-all duration-500 border-2 ${openIndex === idx ? 'bg-foreground border-foreground' : 'bg-secondary border-border hover:border-muted-foreground/20'}`}>
              <button
                className={`w-full flex items-center justify-between p-8 text-left text-xl font-black transition-colors ${openIndex === idx ? 'text-background' : 'text-foreground'}`}
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              >
                {faq.question}
                <div className={`p-2 rounded-full transition-all ${openIndex === idx ? 'bg-background/10 rotate-180' : 'bg-border'}`}>
                  {openIndex === idx ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                </div>
              </button>

              <div className={`px-8 transition-all duration-500 ease-in-out overflow-hidden ${openIndex === idx ? 'max-h-[300px] opacity-100 pb-8' : 'max-h-0 opacity-0'}`}>
                <p className={`text-lg leading-relaxed font-medium ${openIndex === idx ? 'text-muted-foreground' : 'text-muted-foreground'}`}>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>

        <EditableElement elementId="faq.links" elementType="container" label="FAQ Links">
          <div className="text-center mt-20 text-muted-foreground font-bold">
            Still have questions? <br />
            <div className="mt-4 flex flex-wrap justify-center gap-6">
              <a href="#" className="hover:opacity-80 underline decoration-2 underline-offset-4 transition-colors" style={{ color: content.branding.linkColor }}>Documentation</a>
              <a href="#" className="hover:opacity-80 underline decoration-2 underline-offset-4 transition-colors" style={{ color: content.branding.linkColor }}>Features</a>
              <a href="#" className="hover:opacity-80 underline decoration-2 underline-offset-4 transition-colors" style={{ color: content.branding.linkColor }}>Discord Community</a>
            </div>
          </div>
        </EditableElement>
      </div>
    </div>
  );
};

export const FooterCTA = () => {
  const { content } = useSiteContent();
  const c = content.footerCta;
  const gradient = `linear-gradient(to right, ${content.branding.gradientFrom}, ${content.branding.gradientTo})`;
  return (
    <section className="relative py-32 md:py-40 overflow-hidden text-center">
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-bottom opacity-25"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=2072&auto=format&fit=crop')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-rocket-dark h-1/2" />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 flex flex-col items-center">
        <h2 className="text-6xl md:text-8xl font-black text-primary-foreground mb-6 tracking-tighter leading-[0.85]">
          <EditableText fieldPath="footerCta.titleLine1" as="span">{c.titleLine1}</EditableText><br />
          <EditableText fieldPath="footerCta.titleLine2" as="span" className="text-transparent bg-clip-text" style={{ backgroundImage: gradient }}>{c.titleLine2}</EditableText>
        </h2>
        <EditableText fieldPath="footerCta.subtitle" as="p" className="text-muted-foreground mb-12 text-xl md:text-2xl font-medium max-w-2xl">{c.subtitle}</EditableText>

        <EditableElement elementId="footerCta.button" elementType="button" label="CTA Button">
          <a
            href="#"
            className="inline-flex items-center gap-3 px-12 py-5 rounded-2xl font-black text-lg shadow-2xl hover:scale-105 transition-all text-primary-foreground"
            style={{ background: gradient }}
          >
            Fale Conosco <ArrowRight className="w-5 h-5" />
          </a>
        </EditableElement>
      </div>
    </section>
  );
};

export const Footer = () => {
  const { content } = useSiteContent();

  const linkGroups = [
    {
      title: 'Empresa',
      links: [
        { label: 'Sobre Nós', href: '#' },
        { label: 'Carreiras', href: '#' },
        { label: 'Blog', href: '/blog' },
        { label: 'Contato', href: '#' },
      ],
    },
    {
      title: 'Serviços',
      links: [
        { label: 'Marketing Digital', href: '#' },
        { label: 'Branding', href: '#' },
        { label: 'Performance', href: '#' },
        { label: 'Consultoria', href: '#' },
      ],
    },
    {
      title: 'Recursos',
      links: [
        { label: 'Documentação', href: '#' },
        { label: 'Cases', href: '#' },
        { label: 'FAQ', href: '#' },
        { label: 'Suporte', href: '#' },
      ],
    },
  ];

  return (
    <footer className="bg-rocket-dark text-muted-foreground pt-20 pb-10 px-6 border-t border-foreground/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-6">
            <EditableElement elementId="footer.logo" elementType="image" label="Logo Footer">
              <img src={content.branding.logoUrl} alt="7 Zion" className="h-10 w-auto" />
            </EditableElement>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Transformamos marcas em referências digitais com estratégia, performance e tecnologia de ponta.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Instagram, href: content.socialLinks?.instagram || '#' },
                { icon: Linkedin, href: '#' },
                { icon: Twitter, href: '#' },
                { icon: Github, href: '#' },
              ].map(({ icon: Icon, href }, idx) => (
                <a
                  key={idx}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl border border-foreground/10 bg-foreground/5 flex items-center justify-center text-muted-foreground hover:text-primary-foreground hover:border-foreground/25 hover:bg-foreground/10 transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {linkGroups.map((group) => (
            <div key={group.title}>
              <h4 className="text-sm font-black text-primary-foreground uppercase tracking-widest mb-5">{group.title}</h4>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-muted-foreground hover:text-primary-foreground transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="h-px w-full bg-foreground/10 mb-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
            © {new Date().getFullYear()} 7 Zion. Todos os direitos reservados.
          </p>
          <div className="flex gap-8 text-xs font-bold uppercase tracking-widest">
            <a href="#" className="text-muted-foreground hover:text-primary-foreground transition-colors">Privacidade</a>
            <a href="#" className="text-muted-foreground hover:text-primary-foreground transition-colors">Termos</a>
            <a href="#" className="text-muted-foreground hover:text-primary-foreground transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
