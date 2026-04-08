import React, { useState } from 'react';
import {
  Palette, Type, Award, Star, Briefcase,
  Image as ImageIcon, BarChart3, MessageSquareQuote,
  HelpCircle, Megaphone, Share2, Music,
} from 'lucide-react';
import { SiteContent } from '@/contexts/SiteContentContext';
import AdminSectionRenderer from './AdminSectionRenderer';

const TABS = [
  { id: 'branding', label: 'Branding', icon: Palette },
  { id: 'hero', label: 'Hero', icon: Type },
  { id: 'socialMusic', label: 'Redes & Música', icon: Music },
  { id: 'trustedBy', label: 'Marcas Parceiras', icon: Award },
  { id: 'featureBanner', label: 'Banner Destaque', icon: Star },
  { id: 'services', label: 'Serviços', icon: Briefcase },
  { id: 'clientLogos', label: 'Logos Clientes', icon: ImageIcon },
  { id: 'stats', label: 'Estatísticas', icon: BarChart3 },
  { id: 'testimonials', label: 'Depoimentos', icon: MessageSquareQuote },
  { id: 'faqs', label: 'FAQs', icon: HelpCircle },
  { id: 'footerCta', label: 'Footer CTA', icon: Megaphone },
];

interface Props {
  draft: SiteContent;
  updateField: (path: string, value: string) => void;
  updateArrayItem: (path: string, index: number, field: string, value: string) => void;
  addFaq: () => void;
  removeFaq: (i: number) => void;
  addTestimonial: () => void;
  removeTestimonial: (i: number) => void;
  addService: () => void;
  removeService: (i: number) => void;
  updateServiceTag: (si: number, ti: number, v: string) => void;
  addServiceTag: (si: number) => void;
  removeServiceTag: (si: number, ti: number) => void;
  addClientLogo: () => void;
  removeClientLogo: (i: number) => void;
  setDraft: (d: SiteContent) => void;
}

const AdminLayoutPage = (props: Props) => {
  const [activeTab, setActiveTab] = useState('branding');

  return (
    <div>
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 pb-4 border-b border-border">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                isActive
                  ? 'text-white shadow-lg'
                  : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
              }`}
              style={isActive ? { background: 'linear-gradient(135deg, #5766fe, #820dd1)' } : undefined}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <AdminSectionRenderer
        activeSection={activeTab}
        draft={props.draft}
        updateField={props.updateField}
        updateArrayItem={props.updateArrayItem}
        addFaq={props.addFaq}
        removeFaq={props.removeFaq}
        addTestimonial={props.addTestimonial}
        removeTestimonial={props.removeTestimonial}
        addService={props.addService}
        removeService={props.removeService}
        updateServiceTag={props.updateServiceTag}
        addServiceTag={props.addServiceTag}
        removeServiceTag={props.removeServiceTag}
        addClientLogo={props.addClientLogo}
        removeClientLogo={props.removeClientLogo}
        setDraft={props.setDraft}
      />
    </div>
  );
};

export default AdminLayoutPage;
