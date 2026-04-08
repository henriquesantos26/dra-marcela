/**
 * @site EDITABLE - Custom section components
 * @description Generic section templates for the page builder
 * @editable true
 * @module site
 */
import React, { useState } from 'react';
import { useSiteContent } from '@/contexts/SiteContentContext';

import HorizontalSnap from '@/components/effects/HorizontalSnap';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SectionProps {
  data: Record<string, any>;
}

export const TextSection = ({ data }: SectionProps) => {
  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto" style={{ textAlign: data.alignment || 'center' }}>
        {data.title && (
          <h2 className="text-5xl font-black text-white mb-4 tracking-tighter">{data.title}</h2>
        )}
        {data.subtitle && (
          <p className="text-xl text-white/60 mb-8 font-medium">{data.subtitle}</p>
        )}
        {data.body && (
          <div className="text-lg text-white/80 leading-relaxed whitespace-pre-wrap">{data.body}</div>
        )}
      </div>
    </section>
  );
};

export const ImageSection = ({ data }: SectionProps) => {
  return (
    <section className={`${data.fullWidth ? '' : 'py-16 px-6'}`}>
      <div className={data.fullWidth ? '' : 'max-w-5xl mx-auto'}>
        <img
          src={data.imageUrl}
          alt={data.alt || ''}
          className={`w-full ${data.fullWidth ? 'h-[400px]' : 'rounded-3xl max-h-[500px]'} object-cover`}
        />
        {data.caption && (
          <p className="text-center text-sm text-white/40 mt-4">{data.caption}</p>
        )}
      </div>
    </section>
  );
};

export const DividerSection = ({ data }: SectionProps) => {
  return (
    <div className="py-8 px-6">
      <div className="max-w-7xl mx-auto">
        <hr
          className="border-0 h-px"
          style={{ backgroundColor: data.color || 'rgba(255,255,255,0.1)' }}
        />
      </div>
    </div>
  );
};

export const CTASection = ({ data }: SectionProps) => {
  const { content } = useSiteContent();
  const gradient = `linear-gradient(to right, ${content.branding.gradientFrom}, ${content.branding.gradientTo})`;

  return (
    <section className="py-24 px-6 text-center">
      <div className="max-w-3xl mx-auto">
        {data.title && (
          <h2 className="text-5xl font-black text-white mb-4 tracking-tighter">{data.title}</h2>
        )}
        {data.subtitle && (
          <p className="text-xl text-white/60 mb-10 font-medium">{data.subtitle}</p>
        )}
        {data.buttonText && (
          <a
            href={data.buttonUrl || '#'}
            className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-lg shadow-2xl hover:scale-105 transition-all text-white"
            style={{ background: gradient }}
          >
            {data.buttonText}
          </a>
        )}
      </div>
    </section>
  );
};

/* ─── Gallery Layouts ─── */

const GalleryGrid = ({ images, cols, gap, aspectRatio, borderRadius }: { images: any[]; cols: number; gap: number; aspectRatio: string; borderRadius: number }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: `${gap * 4}px` }}>
    {images.map((img: any, idx: number) => (
      <motion.div
        key={idx}
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: idx * 0.08, type: 'spring', stiffness: 100, damping: 15 }}
        className={`overflow-hidden ${aspectRatio === 'square' ? 'aspect-square' : aspectRatio === '16:9' ? 'aspect-video' : ''}`}
        style={{ borderRadius: `${borderRadius}px` }}
      >
        <img src={img.url} alt={img.alt || ''} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
      </motion.div>
    ))}
  </div>
);

const GalleryMasonry = ({ images, cols, gap, borderRadius }: { images: any[]; cols: number; gap: number; borderRadius: number }) => (
  <div style={{ columns: cols, columnGap: `${gap * 4}px` }}>
    {images.map((img: any, idx: number) => (
      <motion.div
        key={idx}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: idx * 0.08 }}
        className="mb-4 break-inside-avoid overflow-hidden"
        style={{ borderRadius: `${borderRadius}px` }}
      >
        <img src={img.url} alt={img.alt || ''} className="w-full object-cover hover:scale-105 transition-transform duration-500" />
      </motion.div>
    ))}
  </div>
);

const GallerySnap = ({ images, gap, borderRadius }: { images: any[]; gap: number; borderRadius: number }) => (
  <HorizontalSnap itemWidth="80%">
    {images.map((img: any, idx: number) => (
      <div key={idx} className="overflow-hidden aspect-video" style={{ borderRadius: `${borderRadius}px`, margin: `0 ${gap * 2}px` }}>
        <img src={img.url} alt={img.alt || ''} className="w-full h-full object-cover" />
      </div>
    ))}
  </HorizontalSnap>
);

const GalleryFeatured = ({ images }: { images: any[] }) => {
  if (images.length === 0) return null;
  const [featured, ...rest] = images;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="rounded-2xl overflow-hidden aspect-square md:row-span-2"
      >
        <img src={featured.url} alt={featured.alt || ''} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
      </motion.div>
      <div className="grid grid-cols-2 gap-4">
        {rest.slice(0, 4).map((img: any, idx: number) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="rounded-2xl overflow-hidden aspect-square"
          >
            <img src={img.url} alt={img.alt || ''} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const GallerySlider = ({ images }: { images: any[] }) => {
  const [current, setCurrent] = useState(0);
  if (images.length === 0) return null;

  return (
    <div className="relative rounded-2xl overflow-hidden aspect-video">
      <AnimatePresence mode="wait">
        <motion.img
          key={current}
          src={images[current].url}
          alt={images[current].alt || ''}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full h-full object-cover absolute inset-0"
        />
      </AnimatePresence>
      {images.length > 1 && (
        <>
          <button
            onClick={() => setCurrent(p => (p - 1 + images.length) % images.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrent(p => (p + 1) % images.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {images.map((_: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`w-2 h-2 rounded-full transition-all ${idx === current ? 'bg-white w-6' : 'bg-white/40'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export const GallerySection = ({ data }: SectionProps) => {
  const layout = data.layout || 'grid';
  const cols = data.columns || 3;
  const gap = data.gap || 4;
  const aspectRatio = data.aspectRatio || 'square';
  const borderRadius = data.borderRadius ?? 16;
  const images = data.images || [];

  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {data.title && (
          <h2 className="text-4xl font-black text-white mb-8 tracking-tighter text-center">{data.title}</h2>
        )}
        {layout === 'grid' && <GalleryGrid images={images} cols={cols} gap={gap} aspectRatio={aspectRatio} borderRadius={borderRadius} />}
        {layout === 'masonry' && <GalleryMasonry images={images} cols={cols} gap={gap} borderRadius={borderRadius} />}
        {layout === 'horizontal-snap' && <GallerySnap images={images} gap={gap} borderRadius={borderRadius} />}
        {layout === 'featured' && <GalleryFeatured images={images} />}
        {layout === 'slider' && <GallerySlider images={images} />}
      </div>
    </section>
  );
};
