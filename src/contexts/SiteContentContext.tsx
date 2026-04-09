/**
 * @system DO NOT EDIT - Core system file
 * @description Site content and dynamic sections management
 * @module system
 */
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useLocale } from './LocaleContext';
import { translations, Locale } from '@/lib/translations';
import { supabase } from '@/integrations/supabase/client';
import type { SiteSection } from '@/components/sections/DynamicSectionRenderer';

export interface SiteContent {
  hero: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    placeholder: string;
  };
  trustedBy: {
    label: string;
    items: { name: string; logoUrl: string }[];
  };
  featureBanner: {
    subtitle: string;
    titleLine1: string;
    titleLine2: string;
    description: string;
  };
  stats: {
    items: { value: string; label: string; sublabel: string }[];
    logos: string[];
  };
  clientLogos: {
    title: string;
    items: { name: string; logoUrl: string }[];
  };
  testimonials: {
    title: string;
    subtitle: string;
    items: { name: string; role: string; text: string; avatar: string }[];
  };
  faqs: {
    title: string;
    subtitle: string;
    items: { question: string; answer: string }[];
  };
  services: {
    title: string;
    subtitle: string;
    items: { title: string; tags: string[]; type?: string }[];
  };
  impact: {
    titleLine1: string;
    titleLine2: string;
    titleHighlight: string;
    tags: string[];
    highlightedTagIndex: number;
    card1Title: string;
    card1Description: string;
    card1Stats: { value: string; label: string }[];
    card2Title: string;
    card2Description: string;
    card2Value: string;
  };
  footerCta: {
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
  };
  socialLinks: {
    facebook: string;
    instagram: string;
    whatsapp: string;
  };
  heroMusic: {
    url: string;
    label: string;
  };
  branding: {
    logoUrl: string;
    faviconUrl: string;
    gradientFrom: string;
    gradientTo: string;
    buttonColor: string;
    buttonTextColor: string;
    linkColor: string;
    badgeColor: string;
    blogCtaBackground: string;
  };
  marcela?: {
    hero: {
      badge: string;
      title: string;
      subtitle1: string;
      subtitle2: string;
      subtitle3: string;
      ctaText1: string;
      ctaText2: string;
    };
    about: {
      title: string;
      name: string;
      text1: string;
      text2: string;
      ctaText: string;
    };
    purpose: {
      title: string;
      text: string;
    };
    services: {
      title: string;
      subtitle: string;
      ctaText: string;
      items: { title: string }[];
    };
    testimonials: {
      title: string;
      items: { name: string; text: string }[];
    };
    stats: {
      item1: { value: number; label: string };
      item2: { value: number; label: string };
      item3: { value: number; label: string };
    };
    contact: {
      title: string;
      subtitle: string;
      text1: string;
      address: string;
      ctaText: string;
      mapUrl: string;
    };
    blogTitle: string;
    blogSubtitle: string;
  };
  customStyles?: Record<string, { color?: string; fontSize?: string; fontFamily?: string; fontWeight?: string; textAlign?: string; letterSpacing?: string }>;
  sectionStyles?: Record<string, { backgroundType?: string; backgroundColor?: string; gradientFrom?: string; gradientTo?: string; gradientAngle?: number; backgroundImage?: string; backgroundOverlayOpacity?: number; paddingY?: string }>;
}

interface SiteContentContextType {
  content: SiteContent;
  updateContent: (content: SiteContent) => Promise<void>;
  saving: boolean;
  // Dynamic sections
  sections: SiteSection[];
  sectionsLoading: boolean;
  addSection: (sectionType: string, sectionData: Record<string, any>, atPosition?: number) => Promise<void>;
  removeSection: (sectionId: string) => Promise<void>;
  moveSection: (sectionId: string, direction: 'up' | 'down') => Promise<void>;
  duplicateSection: (sectionId: string) => Promise<void>;
  toggleSectionVisibility: (sectionId: string) => Promise<void>;
  updateSectionData: (sectionId: string, data: Record<string, any>) => Promise<void>;
}

const SiteContentContext = createContext<SiteContentContextType>({
  content: translations.pt,
  updateContent: async () => {},
  saving: false,
  sections: [],
  sectionsLoading: true,
  addSection: async () => {},
  removeSection: async () => {},
  moveSection: async () => {},
  duplicateSection: async () => {},
  toggleSectionVisibility: async () => {},
  updateSectionData: async () => {},
});

export const useSiteContent = () => useContext(SiteContentContext);

export const SiteContentProvider = ({ children }: { children: ReactNode }) => {
  const { locale } = useLocale();
  const [content, setContent] = useState<SiteContent>(translations[locale]);
  const [saving, setSaving] = useState(false);
  const [sections, setSections] = useState<SiteSection[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(true);

  // Load content from DB
  useEffect(() => {
    const loadFromDb = async () => {
      try {
        const { data } = await supabase
          .from('site_content')
          .select('content')
          .eq('locale', locale)
          .maybeSingle();

        if (data?.content) {
          setContent(data.content as unknown as SiteContent);
        } else {
          setContent(translations[locale]);
        }
      } catch {
        setContent(translations[locale]);
      }
    };
    loadFromDb();
  }, [locale]);

  // Load sections from DB
  useEffect(() => {
    const loadSections = async () => {
      setSectionsLoading(true);
      try {
        const { data, error } = await supabase
          .from('site_sections')
          .select('*')
          .eq('locale', locale)
          .order('position', { ascending: true });

        if (data && !error) {
          setSections(data as unknown as SiteSection[]);
        }
      } catch {
        // fallback: empty
      } finally {
        setSectionsLoading(false);
      }
    };
    loadSections();
  }, [locale]);

  // Dynamic favicon
  useEffect(() => {
    const faviconUrl = content.branding?.faviconUrl;
    if (!faviconUrl) return;
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = faviconUrl;
  }, [content.branding?.faviconUrl]);

  const updateContent = async (newContent: SiteContent) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_content')
        .upsert(
          { locale, content: newContent as any, updated_at: new Date().toISOString() },
          { onConflict: 'locale' }
        );
      if (error) throw error;
      setContent(newContent);
    } finally {
      setSaving(false);
    }
  };

  const addSection = useCallback(async (sectionType: string, sectionData: Record<string, any>, atPosition?: number) => {
    let insertPos: number;
    
    if (atPosition !== undefined) {
      // Shift all sections at or after atPosition up by 1
      const toShift = sections.filter(s => s.position >= atPosition);
      if (toShift.length > 0) {
        const shifted = toShift.map(s => ({ ...s, position: s.position + 1 }));
        setSections(prev => prev.map(s => {
          const found = shifted.find(sh => sh.id === s.id);
          return found || s;
        }));
        await Promise.all(shifted.map(s => supabase.from('site_sections').update({ position: s.position }).eq('id', s.id)));
      }
      insertPos = atPosition;
    } else {
      insertPos = sections.length > 0 ? Math.max(...sections.map(s => s.position)) + 1 : 0;
    }

    const { data, error } = await supabase
      .from('site_sections')
      .insert({ locale, section_type: sectionType, section_data: sectionData, position: insertPos, is_visible: true })
      .select()
      .single();

    if (data && !error) {
      setSections(prev => [...prev, data as unknown as SiteSection].sort((a, b) => a.position - b.position));
    }
  }, [locale, sections]);

  const removeSection = useCallback(async (sectionId: string) => {
    const { error } = await supabase.from('site_sections').delete().eq('id', sectionId);
    if (!error) {
      setSections(prev => prev.filter(s => s.id !== sectionId));
    }
  }, []);

  const moveSection = useCallback(async (sectionId: string, direction: 'up' | 'down') => {
    const idx = sections.findIndex(s => s.id === sectionId);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;

    const newSections = [...sections];
    const temp = newSections[idx];
    newSections[idx] = newSections[targetIdx];
    newSections[targetIdx] = temp;

    // Update positions
    const updates = newSections.map((s, i) => ({ ...s, position: i }));
    setSections(updates);

    // Persist
    await Promise.all(
      updates.map(s =>
        supabase.from('site_sections').update({ position: s.position }).eq('id', s.id)
      )
    );
  }, [sections]);

  const duplicateSection = useCallback(async (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    const maxPos = Math.max(...sections.map(s => s.position)) + 1;
    const { data, error } = await supabase
      .from('site_sections')
      .insert({
        locale: section.locale,
        section_type: section.section_type,
        section_data: section.section_data,
        position: maxPos,
        is_visible: section.is_visible,
      })
      .select()
      .single();

    if (data && !error) {
      setSections(prev => [...prev, data as unknown as SiteSection]);
    }
  }, [sections]);

  const toggleSectionVisibility = useCallback(async (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    const newVisibility = !section.is_visible;
    const { error } = await supabase
      .from('site_sections')
      .update({ is_visible: newVisibility })
      .eq('id', sectionId);

    if (!error) {
      setSections(prev => prev.map(s => s.id === sectionId ? { ...s, is_visible: newVisibility } : s));
    }
  }, [sections]);

  const updateSectionData = useCallback(async (sectionId: string, data: Record<string, any>) => {
    const { error } = await supabase
      .from('site_sections')
      .update({ section_data: data })
      .eq('id', sectionId);

    if (!error) {
      setSections(prev => prev.map(s => s.id === sectionId ? { ...s, section_data: data } : s));
    }
  }, []);

  return (
    <SiteContentContext.Provider value={{
      content,
      updateContent,
      saving,
      sections,
      sectionsLoading,
      addSection,
      removeSection,
      moveSection,
      duplicateSection,
      toggleSectionVisibility,
      updateSectionData,
    }}>
      {children}
    </SiteContentContext.Provider>
  );
};
