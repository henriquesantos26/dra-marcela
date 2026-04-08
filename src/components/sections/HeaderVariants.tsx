/**
 * @site EDITABLE - Custom Header/Navigation section with 5 variants
 * @description Header sections for the page builder
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

interface NavLink {
  label: string;
  url: string;
}

interface HeaderData {
  variant?: string;
  logoUrl?: string;
  logoText?: string;
  links?: NavLink[];
  ctaText?: string;
  ctaUrl?: string;
}

const DEFAULT_LINKS: NavLink[] = [
  { label: 'Home', url: '#' },
  { label: 'Sobre', url: '#' },
  { label: 'Serviços', url: '#' },
  { label: 'Contato', url: '#' },
];

const Logo = ({ data }: { data: HeaderData }) => (
  data.logoUrl
    ? <img src={data.logoUrl} alt="Logo" className="h-8 object-contain" />
    : <span className="text-xl font-bold text-foreground">{data.logoText || 'Logo'}</span>
);

const Classic = ({ data }: { data: HeaderData }) => {
  const links = data.links?.length ? data.links : DEFAULT_LINKS;
  return (
    <nav className="flex items-center justify-between px-6 md:px-16 py-4 bg-background border-b border-border">
      <Logo data={data} />
      <div className="hidden md:flex items-center gap-6">
        {links.map((l, i) => <a key={i} href={l.url} className="text-sm text-muted-foreground hover:text-foreground transition">{l.label}</a>)}
      </div>
      {data.ctaText && <Button asChild size="sm"><a href={data.ctaUrl || '#'}>{data.ctaText}</a></Button>}
    </nav>
  );
};

const CenteredLogo = ({ data }: { data: HeaderData }) => {
  const links = data.links?.length ? data.links : DEFAULT_LINKS;
  const half = Math.ceil(links.length / 2);
  return (
    <nav className="flex items-center justify-center gap-8 px-6 py-4 bg-background border-b border-border">
      <div className="hidden md:flex gap-6">
        {links.slice(0, half).map((l, i) => <a key={i} href={l.url} className="text-sm text-muted-foreground hover:text-foreground transition">{l.label}</a>)}
      </div>
      <Logo data={data} />
      <div className="hidden md:flex gap-6">
        {links.slice(half).map((l, i) => <a key={i} href={l.url} className="text-sm text-muted-foreground hover:text-foreground transition">{l.label}</a>)}
      </div>
    </nav>
  );
};

const TransparentGlass = ({ data }: { data: HeaderData }) => {
  const links = data.links?.length ? data.links : DEFAULT_LINKS;
  return (
    <nav className="flex items-center justify-between px-6 md:px-16 py-4 backdrop-blur-xl bg-background/30 border-b border-white/10">
      <Logo data={data} />
      <div className="hidden md:flex items-center gap-6">
        {links.map((l, i) => <a key={i} href={l.url} className="text-sm text-foreground/80 hover:text-foreground transition">{l.label}</a>)}
      </div>
      {data.ctaText && <Button asChild size="sm" variant="secondary"><a href={data.ctaUrl || '#'}>{data.ctaText}</a></Button>}
    </nav>
  );
};

const SidebarToggle = ({ data }: { data: HeaderData }) => {
  const [open, setOpen] = useState(false);
  const links = data.links?.length ? data.links : DEFAULT_LINKS;
  return (
    <>
      <nav className="flex items-center justify-between px-6 py-4 bg-background border-b border-border">
        <Logo data={data} />
        <button onClick={() => setOpen(!open)} className="p-2 rounded-lg hover:bg-muted transition">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>
      {open && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-background border-b border-border px-6 py-4 space-y-3">
          {links.map((l, i) => <a key={i} href={l.url} className="block text-sm text-muted-foreground hover:text-foreground transition">{l.label}</a>)}
          {data.ctaText && <Button asChild size="sm" className="w-full"><a href={data.ctaUrl || '#'}>{data.ctaText}</a></Button>}
        </motion.div>
      )}
    </>
  );
};

const FloatingPill = ({ data }: { data: HeaderData }) => {
  const links = data.links?.length ? data.links : DEFAULT_LINKS;
  return (
    <div className="flex justify-center py-4 px-6">
      <nav className="flex items-center gap-6 px-6 py-3 rounded-full bg-card border border-border shadow-lg">
        <Logo data={data} />
        <div className="hidden md:flex items-center gap-4">
          {links.map((l, i) => <a key={i} href={l.url} className="text-sm text-muted-foreground hover:text-foreground transition">{l.label}</a>)}
        </div>
        {data.ctaText && <Button asChild size="sm" className="rounded-full"><a href={data.ctaUrl || '#'}>{data.ctaText}</a></Button>}
      </nav>
    </div>
  );
};

const CustomHeaderSection = ({ data }: { data: Record<string, any> }) => {
  const d = data as HeaderData;
  switch (d.variant) {
    case 'centered-logo': return <CenteredLogo data={d} />;
    case 'transparent-glass': return <TransparentGlass data={d} />;
    case 'sidebar-toggle': return <SidebarToggle data={d} />;
    case 'floating-pill': return <FloatingPill data={d} />;
    default: return <Classic data={d} />;
  }
};

export default CustomHeaderSection;
