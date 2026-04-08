/**
 * @site EDITABLE - Custom Testimonials section with 5 variants
 * @description Testimonial sections for the page builder
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

interface Testimonial {
  name: string;
  role: string;
  text: string;
  avatar?: string;
}

interface TestimonialData {
  variant?: string;
  testimonials?: Testimonial[];
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  { name: 'Ana Silva', role: 'CEO, TechCo', text: 'Incrível resultado! Superou todas as expectativas.', avatar: '' },
  { name: 'Carlos Mendes', role: 'Diretor, AgênciaX', text: 'Profissionalismo e qualidade em cada detalhe.', avatar: '' },
  { name: 'Maria Santos', role: 'Fundadora, StartupY', text: 'Transformou completamente nossa presença digital.', avatar: '' },
];

const Avatar = ({ name, avatar }: { name: string; avatar?: string }) => (
  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg shrink-0">
    {avatar ? <img src={avatar} alt={name} className="w-full h-full rounded-full object-cover" /> : name.charAt(0)}
  </div>
);

const CardsGrid = ({ testimonials }: { testimonials: Testimonial[] }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 md:px-16">
    {testimonials.map((t, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.15 }}
        className="bg-card border border-border rounded-2xl p-6 space-y-4"
      >
        <Quote className="w-8 h-8 text-primary/40" />
        <p className="text-muted-foreground leading-relaxed">{t.text}</p>
        <div className="flex items-center gap-3 pt-2">
          <Avatar name={t.name} avatar={t.avatar} />
          <div>
            <p className="font-semibold text-foreground text-sm">{t.name}</p>
            <p className="text-xs text-muted-foreground">{t.role}</p>
          </div>
        </div>
      </motion.div>
    ))}
  </div>
);

const Carousel = ({ testimonials }: { testimonials: Testimonial[] }) => (
  <div className="overflow-x-auto scrollbar-hide px-6 md:px-16">
    <div className="flex gap-6 snap-x snap-mandatory pb-4" style={{ scrollSnapType: 'x mandatory' }}>
      {testimonials.map((t, i) => (
        <div key={i} className="snap-center shrink-0 w-[85vw] md:w-[400px] bg-card border border-border rounded-2xl p-6 space-y-4">
          <Quote className="w-6 h-6 text-primary/40" />
          <p className="text-muted-foreground">{t.text}</p>
          <div className="flex items-center gap-3">
            <Avatar name={t.name} avatar={t.avatar} />
            <div>
              <p className="font-semibold text-foreground text-sm">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.role}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SingleFocus = ({ testimonials }: { testimonials: Testimonial[] }) => {
  const [idx, setIdx] = useState(0);
  const t = testimonials[idx] || testimonials[0];
  return (
    <div className="flex flex-col items-center px-6 md:px-16 max-w-3xl mx-auto text-center">
      <AnimatePresence mode="wait">
        <motion.div key={idx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
          <Quote className="w-10 h-10 text-primary/30 mx-auto" />
          <p className="text-xl md:text-2xl text-foreground leading-relaxed italic">"{t.text}"</p>
          <div className="flex items-center justify-center gap-3">
            <Avatar name={t.name} avatar={t.avatar} />
            <div className="text-left">
              <p className="font-semibold text-foreground">{t.name}</p>
              <p className="text-sm text-muted-foreground">{t.role}</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="flex gap-4 mt-8">
        <button onClick={() => setIdx(i => (i - 1 + testimonials.length) % testimonials.length)} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button onClick={() => setIdx(i => (i + 1) % testimonials.length)} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const Stacked = ({ testimonials }: { testimonials: Testimonial[] }) => (
  <div className="space-y-4 max-w-2xl mx-auto px-6 md:px-16">
    {testimonials.map((t, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ delay: i * 0.1 }}
        className="flex gap-4 bg-card border border-border rounded-xl p-5"
      >
        <Avatar name={t.name} avatar={t.avatar} />
        <div>
          <p className="text-muted-foreground text-sm">{t.text}</p>
          <p className="text-xs font-semibold text-foreground mt-2">{t.name} · <span className="text-muted-foreground font-normal">{t.role}</span></p>
        </div>
      </motion.div>
    ))}
  </div>
);

const Bubbles = ({ testimonials }: { testimonials: Testimonial[] }) => (
  <div className="space-y-6 max-w-xl mx-auto px-6 md:px-16">
    {testimonials.map((t, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ delay: i * 0.1 }}
        className={`flex ${i % 2 === 0 ? '' : 'justify-end'}`}
      >
        <div className={`max-w-[80%] ${i % 2 === 0 ? 'bg-primary/10 rounded-2xl rounded-bl-sm' : 'bg-muted rounded-2xl rounded-br-sm'} p-4 space-y-2`}>
          <p className="text-sm text-foreground">{t.text}</p>
          <p className="text-xs text-muted-foreground font-semibold">{t.name} · {t.role}</p>
        </div>
      </motion.div>
    ))}
  </div>
);

const CustomTestimonialsSection = ({ data }: { data: Record<string, any> }) => {
  const d = data as TestimonialData;
  const testimonials = d.testimonials?.length ? d.testimonials : DEFAULT_TESTIMONIALS;
  switch (d.variant) {
    case 'carousel': return <Carousel testimonials={testimonials} />;
    case 'single-focus': return <SingleFocus testimonials={testimonials} />;
    case 'stacked': return <Stacked testimonials={testimonials} />;
    case 'bubbles': return <Bubbles testimonials={testimonials} />;
    default: return <CardsGrid testimonials={testimonials} />;
  }
};

export default CustomTestimonialsSection;
