/**
 * @site EDITABLE - Site content component
 * @description Services and Impact section
 * @editable true
 * @module site
 */
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useSiteContent } from '@/contexts/SiteContentContext';
import EditableText from '@/components/inline-edit/EditableText';
import EditableElement from '@/components/inline-edit/EditableElement';

/* ── animation variants ── */
const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -100 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' as const } }
};
const smokeEffect: Variants = {
  hidden: { opacity: 0, filter: 'blur(20px)', scale: 0.9, y: 20 },
  visible: { opacity: 1, filter: 'blur(0px)', scale: 1, y: 0, transition: { duration: 1.5, ease: 'easeOut' as const } }
};
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } }
};

const VARIANT_MAP: Record<string, Variants> = {
  light: slideInLeft,
  dark: slideInLeft,
  gradient: fadeInUp,
  'gradient-wide': fadeInUp,
  glass: fadeInUp,
  smoke: smokeEffect
};

/* ── carousel slide components ── */
const ResultsSlide = ({ impact, accent }: {impact: any;accent: string;}) =>
<div className="bg-white rounded-[28px] p-8 md:p-10 text-black h-full flex flex-col justify-between min-h-[340px]">
    <div>
      <h3 className="text-xl md:text-2xl font-black mb-3">{impact.card1Title}</h3>
      <p className="text-xs text-black/50 leading-relaxed max-w-md">{impact.card1Description}</p>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-8">
      {(impact.card1Stats || []).map((stat: {value: string;label: string;}, i: number) =>
    <div key={i}>
          <span className="text-3xl md:text-4xl font-black" style={{ color: accent }}>{stat.value}</span>
          <p className="text-[10px] text-black/40 font-bold uppercase tracking-wider mt-1">{stat.label}</p>
        </div>
    )}
    </div>
  </div>;


const BudgetSlide = ({ impact, accent }: {impact: any;accent: string;}) =>
<div className="bg-white rounded-[28px] p-8 md:p-10 text-black h-full flex flex-col justify-between min-h-[340px] relative overflow-hidden">
    <div>
      <h3 className="text-xl md:text-2xl font-black mb-3">{impact.card2Title}</h3>
      <p className="text-xs text-black/50 leading-relaxed max-w-md">{impact.card2Description}</p>
    </div>
    <span className="text-6xl md:text-8xl font-black mt-auto" style={{ color: accent }}>
      {impact.card2Value}
    </span>
    <div className="absolute bottom-0 left-0 right-0 h-1.5" style={{ background: accent }} />
  </div>;


const GlobalSlide = ({ accent }: {accent: string;}) =>
<div className="bg-white rounded-[28px] p-8 md:p-10 text-black h-full flex flex-col justify-between min-h-[340px]">
    <div>
      <h3 className="text-xl md:text-2xl font-black mb-3">Presença Global</h3>
      <p className="text-xs text-black/50 leading-relaxed max-w-md">
        Expandimos a nossa atuação para mais de 12 países, conectando marcas a audiências internacionais de forma nativa e eficiente.
      </p>
    </div>
    <div className="flex items-end gap-4 mt-auto">
      <span className="text-7xl md:text-8xl font-black leading-none" style={{ color: accent }}>12+</span>
      <span className="text-sm font-bold text-black/40 mb-3">Países<br />atendidos</span>
    </div>
  </div>;


/* ── main component ── */
const Services = () => {
  const { content } = useSiteContent();
  const s = content.services;
  const impact = content.impact;
  const accent = content.branding.gradientFrom;
  const accentTo = content.branding.gradientTo;

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
  { id: 'results', el: <ResultsSlide impact={impact} accent={accent} /> },
  { id: 'budget', el: <BudgetSlide impact={impact} accent={accent} /> },
  { id: 'global', el: <GlobalSlide accent={accent} /> }];


  const nextSlide = useCallback(() => {
    setCurrentSlide((p) => (p + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const t = setInterval(nextSlide, 5000);
    return () => clearInterval(t);
  }, [nextSlide]);

  if (!impact) return null;

  const serviceItems = s.items.map((item, idx) => ({
    ...item,
    id: String(idx + 1).padStart(2, '0'),
    variant: VARIANT_MAP[item.type || 'light'] || slideInLeft,
    colSpan: item.type === 'gradient-wide' || item.type === 'gradient' ? 'lg:col-span-2' : ''
  }));

  return (
    <>
      <section className="relative py-24 md:py-32 px-6 overflow-hidden">
        {/* Noise overlay */}
        <div className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none z-[1]" style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }} />

        {/* Glow blobs */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[200px] opacity-20" style={{ background: accent }} />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[200px] opacity-15" style={{ background: accentTo }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">

          {/* ─── IMPACT SECTION ─── */}
          <div className="mb-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Left: title + tags */}
              <div>
                <h2 className="text-8xl md:text-6xl text-white leading-[1] tracking-tighter mb-20 font-extrabold text-left">
                  <EditableText fieldPath="impact.titleLine1" as="span">{impact.titleLine1}</EditableText><br />
                  <EditableText fieldPath="impact.titleLine2" as="span">{impact.titleLine2}</EditableText><br />
                  <EditableText fieldPath="impact.titleHighlight" as="span" style={{ color: accent }}>{impact.titleHighlight}</EditableText>
                </h2>
                <EditableElement elementId="impact.tags" elementType="container" label="Tags">
                  <div className="flex flex-wrap gap-3">
                    {(impact.tags || []).map((tag: string, idx: number) =>
                    <span
                      key={idx}
                      className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
                      idx === (impact.highlightedTagIndex ?? 2) ? 'text-white' : 'bg-transparent border border-white/20 text-white/80 hover:border-white/40'}`
                      }
                      style={idx === (impact.highlightedTagIndex ?? 2) ? { background: accent } : undefined}>

                        {tag}
                      </span>
                    )}
                  </div>
                </EditableElement>
              </div>

              {/* Right: carousel */}
              <div>
                <div className="relative overflow-hidden rounded-[28px]" style={{ minHeight: 340 }}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={slides[currentSlide].id}
                      initial={{ opacity: 0, x: 80 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -80 }}
                      transition={{ duration: 0.5, ease: 'easeInOut' }}
                      className="w-full">

                      {slides[currentSlide].el}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Indicators + next */}
                <div className="flex items-center justify-between mt-5">
                  <div className="flex gap-2">
                    {slides.map((_, idx) =>
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-1.5 rounded-full transition-all duration-500 ${currentSlide === idx ? 'w-12' : 'w-4 bg-zinc-800'}`}
                      style={currentSlide === idx ? { background: accent } : undefined} />

                    )}
                  </div>
                  <button onClick={nextSlide} className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 transition-colors">
                    <Plus className="w-4 h-4 rotate-90" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ─── SERVICES SECTION ─── */}
          <div className="mb-16 flex flex-col md:flex-row items-baseline gap-4">
            <EditableText fieldPath="services.title" as="h2" className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-[1.05]">
              {s.title}
            </EditableText>
            <EditableText fieldPath="services.subtitle" as="span" className="text-lg md:text-xl text-white/40 italic font-light">
              {s.subtitle}
            </EditableText>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {serviceItems.map((service, idx) => {
              const isHovered = hoveredIndex === idx;
              const isGradient = service.type === 'gradient' || service.type === 'gradient-wide';
              const isGlass = service.type === 'glass';
              const isSmoke = service.type === 'smoke';

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 80 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: idx * 0.12, ease: [0.25, 0.1, 0.25, 1] }}
                  viewport={{ once: false, amount: 0.3, margin: "-50px" }}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`
                    relative rounded-[32px] p-8 md:p-10 min-h-[280px] flex flex-col justify-between transition-all duration-500 cursor-pointer overflow-hidden group
                    ${service.colSpan}
                    ${isHovered ? 'z-20' : 'z-10'}
                    ${service.type === 'light' ? 'bg-white text-black' : ''}
                    ${service.type === 'dark' ? 'bg-zinc-900 border border-zinc-800 text-white' : ''}
                    ${isGlass ? 'bg-white/[0.06] backdrop-blur-xl border border-white/[0.28] text-white' : ''}
                    ${isSmoke ? 'bg-zinc-900 border border-zinc-800 text-white' : ''}
                  `}
                  style={{
                    ...(isGradient ? { background: `linear-gradient(135deg, ${accent}cc, ${accentTo}99, #1a1a2e)` } : {}),
                    ...(isGlass ? { WebkitBackdropFilter: 'blur(9.3px)' } : {}),
                    boxShadow: isHovered ? `0 20px 60px -15px ${accent}66` : 'none'
                  }}>

                  {/* Gradient card effects */}
                  {isGradient &&
                  <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute -right-16 -top-16 w-56 h-56 bg-white opacity-15 blur-3xl rounded-full group-hover:opacity-25 transition-opacity" />
                    </div>
                  }

                  {/* Smoke card effects */}
                  {isSmoke &&
                  <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute bottom-0 left-0 w-full h-1/2 opacity-30 group-hover:opacity-50 transition-opacity" style={{ background: `radial-gradient(ellipse at bottom, ${accent}40, transparent)` }} />
                    </div>
                  }

                  {/* Glass shimmer */}
                  {isGlass &&
                  <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5" />
                      <div className="absolute -right-20 -bottom-20 w-48 h-48 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity" style={{ background: accent }} />
                    </div>
                  }

                  {/* Number + Saiba Mais */}
                  <div className="relative z-10 flex items-start justify-between">
                    <span className="text-lg font-bold" style={{ color: isGradient || isGlass || isSmoke ? 'rgba(255,255,255,0.7)' : accent }}>
                      {service.id}
                    </span>
                    <AnimatePresence>
                      {isHovered &&
                      <motion.span
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
                        style={{ color: service.type === 'light' ? accent : 'white' }}>

                          Saiba Mais
                          <Plus className="w-3.5 h-3.5" />
                        </motion.span>
                      }
                    </AnimatePresence>
                  </div>

                  {/* Title + tags */}
                  <div className="relative z-10 mt-auto">
                    <h3 className="text-xl md:text-2xl font-black tracking-tight leading-tight">{service.title}</h3>
                    {service.tags.length > 0 &&
                    <p className="text-xs mt-2 font-medium" style={{ color: service.type === 'light' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.5)' }}>
                        {service.tags.join(' · ')}
                      </p>
                    }
                  </div>
                </motion.div>);

            })}
          </div>
        </div>
      </section>
    </>);

};

export default Services;