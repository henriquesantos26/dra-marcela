/**
 * @site EDITABLE - Custom Hero section with 5 variants
 * @description Hero sections for the page builder
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface HeroData {
  variant?: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonUrl?: string;
  imageUrl?: string;
}

const HeroCentered = ({ data }: { data: HeroData }) => (
  <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6">
    <motion.h1
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-5xl md:text-7xl font-bold text-foreground mb-6 max-w-4xl"
    >
      {data.title || 'Título Principal'}
    </motion.h1>
    <motion.p
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl"
    >
      {data.subtitle || 'Subtítulo descritivo aqui'}
    </motion.p>
    {data.buttonText && (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
        <Button asChild size="lg" className="text-lg px-8 py-6">
          <a href={data.buttonUrl || '#'}>{data.buttonText}</a>
        </Button>
      </motion.div>
    )}
  </div>
);

const HeroSplit = ({ data }: { data: HeroData }) => (
  <div className="min-h-[80vh] flex flex-col md:flex-row items-center gap-12 px-6 md:px-16 py-20">
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="flex-1 space-y-6"
    >
      <h1 className="text-4xl md:text-6xl font-bold text-foreground">{data.title || 'Título Principal'}</h1>
      <p className="text-lg text-muted-foreground">{data.subtitle || 'Subtítulo descritivo aqui'}</p>
      {data.buttonText && (
        <Button asChild size="lg">
          <a href={data.buttonUrl || '#'}>{data.buttonText}</a>
        </Button>
      )}
    </motion.div>
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="flex-1"
    >
      <img
        src={data.imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800'}
        alt=""
        className="w-full rounded-2xl shadow-2xl object-cover max-h-[500px]"
      />
    </motion.div>
  </div>
);

const HeroVideoBg = ({ data }: { data: HeroData }) => (
  <div className="relative min-h-[90vh] flex items-center justify-center text-center overflow-hidden">
    <div
      className="absolute inset-0 bg-cover bg-center"
      style={{ backgroundImage: `url(${data.imageUrl || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1920'})` }}
    />
    <div className="absolute inset-0 bg-black/60" />
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative z-10 px-6 max-w-4xl"
    >
      <h1 className="text-5xl md:text-8xl font-bold text-white mb-6">{data.title || 'Título Impactante'}</h1>
      <p className="text-xl text-white/80 mb-8">{data.subtitle || 'Subtítulo aqui'}</p>
      {data.buttonText && (
        <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
          <a href={data.buttonUrl || '#'}>{data.buttonText}</a>
        </Button>
      )}
    </motion.div>
  </div>
);

const HeroMinimal = ({ data }: { data: HeroData }) => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center px-6">
    <motion.h1
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="text-6xl md:text-9xl font-black text-foreground tracking-tighter text-center"
    >
      {data.title || 'BOLD'}
    </motion.h1>
    <motion.p
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.5 }}
      className="text-lg text-muted-foreground mt-6 text-center"
    >
      {data.subtitle || 'Minimalismo é poder'}
    </motion.p>
  </div>
);

const HeroGradientWave = ({ data }: { data: HeroData }) => (
  <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20" />
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative z-10"
    >
      <h1 className="text-5xl md:text-8xl font-bold mb-6">
        <span className="bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-[gradient-shift_3s_ease-in-out_infinite] bg-clip-text text-transparent">
          {data.title || 'Gradiente Vivo'}
        </span>
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
        {data.subtitle || 'Texto com efeito gradiente animado'}
      </p>
      {data.buttonText && (
        <Button asChild size="lg" className="text-lg px-8 py-6">
          <a href={data.buttonUrl || '#'}>{data.buttonText}</a>
        </Button>
      )}
    </motion.div>
  </div>
);

const CustomHeroSection = ({ data }: { data: Record<string, any> }) => {
  const heroData = data as HeroData;
  switch (heroData.variant) {
    case 'split': return <HeroSplit data={heroData} />;
    case 'video-bg': return <HeroVideoBg data={heroData} />;
    case 'minimal': return <HeroMinimal data={heroData} />;
    case 'gradient-wave': return <HeroGradientWave data={heroData} />;
    default: return <HeroCentered data={heroData} />;
  }
};

export default CustomHeroSection;
