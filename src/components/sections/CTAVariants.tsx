/**
 * @site EDITABLE - Custom CTA section with 5 variants
 * @description CTA sections for the page builder
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface CTAData {
  variant?: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonUrl?: string;
  deadline?: string;
}

const Centered = ({ data }: { data: CTAData }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center py-20 px-6 max-w-3xl mx-auto">
    <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">{data.title || 'Pronto para começar?'}</h2>
    <p className="text-lg text-muted-foreground mb-8">{data.subtitle || 'Entre em contato conosco'}</p>
    {data.buttonText && <Button asChild size="lg" className="text-lg px-8 py-6"><a href={data.buttonUrl || '#'}>{data.buttonText}</a></Button>}
  </motion.div>
);

const SplitAction = ({ data }: { data: CTAData }) => (
  <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="flex flex-col md:flex-row items-center justify-between gap-6 py-16 px-6 md:px-16">
    <div>
      <h2 className="text-2xl md:text-4xl font-bold text-foreground">{data.title || 'Vamos conversar?'}</h2>
      <p className="text-muted-foreground mt-2">{data.subtitle || 'Estamos prontos para ajudar'}</p>
    </div>
    {data.buttonText && <Button asChild size="lg" className="shrink-0"><a href={data.buttonUrl || '#'}>{data.buttonText}</a></Button>}
  </motion.div>
);

const CardCTA = ({ data }: { data: CTAData }) => (
  <div className="px-6 md:px-16 py-16">
    <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} className="bg-card border-2 border-border rounded-3xl p-8 md:p-12 text-center max-w-3xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{data.title || 'CTA em Card'}</h2>
      <p className="text-muted-foreground mb-8">{data.subtitle || 'Destaque com borda'}</p>
      {data.buttonText && <Button asChild size="lg"><a href={data.buttonUrl || '#'}>{data.buttonText}</a></Button>}
    </motion.div>
  </div>
);

const GradientBanner = ({ data }: { data: CTAData }) => (
  <div className="bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] py-16 px-6 md:px-16">
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
      <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-4">{data.title || 'Ação Agora'}</h2>
      <p className="text-primary-foreground/80 text-lg mb-8">{data.subtitle || 'Não perca esta oportunidade'}</p>
      {data.buttonText && <Button asChild size="lg" variant="secondary"><a href={data.buttonUrl || '#'}>{data.buttonText}</a></Button>}
    </motion.div>
  </div>
);

const Countdown = ({ data }: { data: CTAData }) => {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const target = data.deadline ? new Date(data.deadline).getTime() : Date.now() + 3 * 24 * 60 * 60 * 1000;
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setTimeLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [data.deadline]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center py-20 px-6">
      <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">{data.title || 'Oferta por tempo limitado'}</h2>
      <p className="text-muted-foreground mb-8">{data.subtitle || 'Aproveite antes que acabe'}</p>
      <div className="flex justify-center gap-4 mb-8">
        {[
          { label: 'Dias', value: timeLeft.d },
          { label: 'Horas', value: timeLeft.h },
          { label: 'Min', value: timeLeft.m },
          { label: 'Seg', value: timeLeft.s },
        ].map((u) => (
          <div key={u.label} className="bg-card border border-border rounded-xl p-4 min-w-[70px]">
            <div className="text-3xl font-bold text-foreground">{String(u.value).padStart(2, '0')}</div>
            <div className="text-xs text-muted-foreground">{u.label}</div>
          </div>
        ))}
      </div>
      {data.buttonText && <Button asChild size="lg"><a href={data.buttonUrl || '#'}>{data.buttonText}</a></Button>}
    </motion.div>
  );
};

const CustomCTASection = ({ data }: { data: Record<string, any> }) => {
  const d = data as CTAData;
  switch (d.variant) {
    case 'split-action': return <SplitAction data={d} />;
    case 'card-cta': return <CardCTA data={d} />;
    case 'gradient-banner': return <GradientBanner data={d} />;
    case 'countdown': return <Countdown data={d} />;
    default: return <Centered data={d} />;
  }
};

export default CustomCTASection;
