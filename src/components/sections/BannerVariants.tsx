/**
 * @site EDITABLE - Custom Banner section with 5 variants
 * @description Banner sections for the page builder
 */
import React, { useRef, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface BannerData {
  variant?: string;
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonUrl?: string;
  videoUrl?: string;
  scrollDistance?: number;
}

const FullImage = ({ data }: { data: BannerData }) => (
  <div className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${data.imageUrl || 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1920'})` }} />
    <div className="absolute inset-0 bg-black/50" />
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="relative z-10 text-center px-6 max-w-3xl">
      <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">{data.title || 'Banner Título'}</h2>
      <p className="text-lg text-white/80 mb-6">{data.subtitle || 'Subtítulo do banner'}</p>
      {data.buttonText && <Button asChild size="lg" variant="secondary"><a href={data.buttonUrl || '#'}>{data.buttonText}</a></Button>}
    </motion.div>
  </div>
);

const SplitHalf = ({ data }: { data: BannerData }) => (
  <div className="flex flex-col md:flex-row min-h-[50vh]">
    <div className="flex-1 bg-cover bg-center min-h-[300px]" style={{ backgroundImage: `url(${data.imageUrl || 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=960'})` }} />
    <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} className="flex-1 flex flex-col justify-center p-8 md:p-16 bg-card">
      <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">{data.title || 'Banner Split'}</h2>
      <p className="text-muted-foreground mb-6">{data.subtitle || 'Subtítulo aqui'}</p>
      {data.buttonText && <Button asChild className="w-fit"><a href={data.buttonUrl || '#'}>{data.buttonText}</a></Button>}
    </motion.div>
  </div>
);

const Glassmorphic = ({ data }: { data: BannerData }) => (
  <div className="relative min-h-[40vh] flex items-center justify-center overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30" />
    <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} className="relative z-10 backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 md:p-12 text-center max-w-2xl mx-6 shadow-2xl">
      <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">{data.title || 'Glass Banner'}</h2>
      <p className="text-muted-foreground mb-6">{data.subtitle || 'Efeito glassmorphism'}</p>
      {data.buttonText && <Button asChild><a href={data.buttonUrl || '#'}>{data.buttonText}</a></Button>}
    </motion.div>
  </div>
);

const GradientCTA = ({ data }: { data: BannerData }) => (
  <div className="bg-gradient-to-r from-primary to-accent py-16 px-6 md:px-16">
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto text-center">
      <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-4">{data.title || 'Banner Gradiente'}</h2>
      <p className="text-primary-foreground/80 text-lg mb-8">{data.subtitle || 'Call to action vibrante'}</p>
      {data.buttonText && <Button asChild size="lg" variant="secondary"><a href={data.buttonUrl || '#'}>{data.buttonText}</a></Button>}
    </motion.div>
  </div>
);

const MinimalLine = ({ data }: { data: BannerData }) => (
  <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="py-16 px-6 md:px-16 max-w-4xl mx-auto">
    <div className="flex items-center gap-6 mb-8">
      <div className="w-16 h-0.5 bg-primary" />
      <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Destaque</span>
    </div>
    <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">{data.title || 'Banner Minimalista'}</h2>
    <p className="text-muted-foreground text-lg mb-6">{data.subtitle || 'Elegância na simplicidade'}</p>
    {data.buttonText && <Button asChild variant="outline"><a href={data.buttonUrl || '#'}>{data.buttonText}</a></Button>}
  </motion.div>
);

const VideoScroll = ({ data }: { data: BannerData }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number>(0);
  const scrollDistance = data.scrollDistance || 500;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end end'],
  });

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const video = videoRef.current;
      if (video && video.duration && isFinite(video.duration)) {
        video.currentTime = latest * video.duration;
      }
    });
  });

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  if (!data.videoUrl) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] bg-muted">
        <div className="text-center space-y-2">
          <div className="text-4xl">🎬</div>
          <p className="text-muted-foreground font-medium">Adicione uma URL de vídeo nas configurações</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative" style={{ height: `${scrollDistance}vh` }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <video
          ref={videoRef}
          src={data.videoUrl}
          muted
          playsInline
          preload="auto"
          onLoadedMetadata={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        {(data.title || data.subtitle || data.buttonText) && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center px-6 max-w-3xl">
              {data.title && <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">{data.title}</h2>}
              {data.subtitle && <p className="text-lg text-white/80 mb-6">{data.subtitle}</p>}
              {data.buttonText && (
                <Button asChild size="lg" variant="secondary">
                  <a href={data.buttonUrl || '#'}>{data.buttonText}</a>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CustomBannerSection = ({ data }: { data: Record<string, any> }) => {
  const d = data as BannerData;
  switch (d.variant) {
    case 'split-half': return <SplitHalf data={d} />;
    case 'glassmorphic': return <Glassmorphic data={d} />;
    case 'gradient-cta': return <GradientCTA data={d} />;
    case 'minimal-line': return <MinimalLine data={d} />;
    case 'video-scroll': return <VideoScroll data={d} />;
    default: return <FullImage data={d} />;
  }
};

export default CustomBannerSection;
