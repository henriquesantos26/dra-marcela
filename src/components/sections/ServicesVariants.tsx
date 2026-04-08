/**
 * @site EDITABLE - Custom Services section with 5 variants
 * @description Services sections for the page builder
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Code, Palette, Rocket, Zap, Settings } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface ServiceItem {
  icon?: string;
  title: string;
  description: string;
}

interface ServicesData {
  variant?: string;
  title?: string;
  services?: ServiceItem[];
}

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  briefcase: Briefcase, code: Code, palette: Palette, rocket: Rocket, zap: Zap, settings: Settings,
};

const DEFAULT_SERVICES: ServiceItem[] = [
  { icon: 'code', title: 'Desenvolvimento', description: 'Sites e aplicações modernas e performáticas.' },
  { icon: 'palette', title: 'Design', description: 'Interfaces elegantes e experiências memoráveis.' },
  { icon: 'rocket', title: 'Marketing', description: 'Estratégias digitais para crescimento acelerado.' },
  { icon: 'zap', title: 'Automação', description: 'Fluxos inteligentes para otimizar processos.' },
];

const getIcon = (name?: string) => {
  const Icon = ICON_MAP[name || ''] || Briefcase;
  return <Icon className="w-6 h-6" />;
};

const IconGrid = ({ data }: { data: ServicesData }) => {
  const services = data.services?.length ? data.services : DEFAULT_SERVICES;
  return (
    <div className="px-6 md:px-16">
      {data.title && <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-12">{data.title}</h2>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="text-center space-y-3 p-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">{getIcon(s.icon)}</div>
            <h3 className="text-lg font-semibold text-foreground">{s.title}</h3>
            <p className="text-sm text-muted-foreground">{s.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const CardsHover = ({ data }: { data: ServicesData }) => {
  const services = data.services?.length ? data.services : DEFAULT_SERVICES;
  return (
    <div className="px-6 md:px-16">
      {data.title && <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-12">{data.title}</h2>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="bg-card border border-border rounded-2xl p-6 space-y-3 cursor-default transition-shadow hover:shadow-xl"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">{getIcon(s.icon)}</div>
            <h3 className="text-lg font-semibold text-foreground">{s.title}</h3>
            <p className="text-sm text-muted-foreground">{s.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const Timeline = ({ data }: { data: ServicesData }) => {
  const services = data.services?.length ? data.services : DEFAULT_SERVICES;
  return (
    <div className="px-6 md:px-16 max-w-3xl mx-auto">
      {data.title && <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-12">{data.title}</h2>}
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
        {services.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }} className="relative pl-16 pb-10">
            <div className="absolute left-4 top-1 w-5 h-5 rounded-full bg-primary border-4 border-background" />
            <h3 className="text-lg font-semibold text-foreground">{s.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{s.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const TabsLayout = ({ data }: { data: ServicesData }) => {
  const services = data.services?.length ? data.services : DEFAULT_SERVICES;
  const [active, setActive] = useState(0);
  return (
    <div className="px-6 md:px-16 max-w-4xl mx-auto">
      {data.title && <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-12">{data.title}</h2>}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {services.map((s, i) => (
          <button key={i} onClick={() => setActive(i)} className={`px-4 py-2 rounded-full text-sm font-semibold transition ${active === i ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
            {s.title}
          </button>
        ))}
      </div>
      <motion.div key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">{getIcon(services[active]?.icon)}</div>
        <h3 className="text-2xl font-bold text-foreground mb-2">{services[active]?.title}</h3>
        <p className="text-muted-foreground">{services[active]?.description}</p>
      </motion.div>
    </div>
  );
};

const AccordionLayout = ({ data }: { data: ServicesData }) => {
  const services = data.services?.length ? data.services : DEFAULT_SERVICES;
  return (
    <div className="px-6 md:px-16 max-w-3xl mx-auto">
      {data.title && <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-12">{data.title}</h2>}
      <Accordion type="single" collapsible className="w-full">
        {services.map((s, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger className="text-left">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">{getIcon(s.icon)}</div>
                <span className="font-semibold text-foreground">{s.title}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground pl-11">{s.description}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

const CustomServicesSection = ({ data }: { data: Record<string, any> }) => {
  const d = data as ServicesData;
  switch (d.variant) {
    case 'cards-hover': return <CardsHover data={d} />;
    case 'timeline': return <Timeline data={d} />;
    case 'tabs': return <TabsLayout data={d} />;
    case 'accordion': return <AccordionLayout data={d} />;
    default: return <IconGrid data={d} />;
  }
};

export default CustomServicesSection;
