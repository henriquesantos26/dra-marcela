/**
 * @system DO NOT EDIT - Core system file
 * @description Maps section_type to the correct React component
 * @module system
 */
import React from 'react';
import { Hero, TrustedBy, FeatureBanner, Templates, Stats, Testimonials, FAQ, FooterCTA } from '@/components/LandingSections';
import Services from '@/components/Services';
import ClientLogosCarousel from '@/components/ClientLogosCarousel';
import BlogSection from '@/components/BlogSection';
import { TextSection, ImageSection, DividerSection, CTASection, GallerySection } from './CustomSections';
import BlankSection from './BlankSection';
import CustomHeroSection from './HeroVariants';
import CustomTestimonialsSection from './TestimonialVariants';
import CustomBannerSection from './BannerVariants';
import CustomHeaderSection from './HeaderVariants';
import CustomCTASection from './CTAVariants';
import CustomServicesSection from './ServicesVariants';
import EditableSection from '@/components/inline-edit/EditableSection';
import { useInlineEdit } from '@/contexts/InlineEditContext';

export interface SiteSection {
  id: string;
  locale: string;
  section_type: string;
  section_data: Record<string, any>;
  position: number;
  is_visible: boolean;
}

/** Map of section_type to built-in components */
const BUILT_IN_COMPONENTS: Record<string, React.ComponentType<any>> = {
  hero: Hero,
  trustedBy: TrustedBy,
  featureBanner: FeatureBanner,
  services: Services,
  templates: Templates,
  stats: Stats,
  clientLogos: ClientLogosCarousel,
  testimonials: Testimonials,
  blog: BlogSection,
  faq: FAQ,
  footerCta: FooterCTA,
};

/** Map of section_type to custom components that accept data prop */
const CUSTOM_COMPONENTS: Record<string, React.ComponentType<{ data: Record<string, any> }>> = {
  text: TextSection,
  image: ImageSection,
  divider: DividerSection,
  cta: CTASection,
  gallery: GallerySection,
  'custom-hero': CustomHeroSection,
  'custom-testimonials': CustomTestimonialsSection,
  'custom-banner': CustomBannerSection,
  'custom-header': CustomHeaderSection,
  'custom-cta': CustomCTASection,
  'custom-services': CustomServicesSection,
  blank: BlankSection,
};

interface DynamicSectionRendererProps {
  section: SiteSection;
}

const DynamicSectionRenderer = ({ section }: DynamicSectionRendererProps) => {
  const { editMode } = useInlineEdit();

  // In edit mode, show hidden sections (so they can be reactivated)
  // In normal mode, hide them
  if (!section.is_visible && !editMode) return null;

  const BuiltInComponent = BUILT_IN_COMPONENTS[section.section_type];
  const CustomComponent = CUSTOM_COMPONENTS[section.section_type];

  if (BuiltInComponent) {
    return (
      <EditableSection sectionId={section.id} sectionType={section.section_type} dbSectionId={section.id}>
        <BuiltInComponent />
      </EditableSection>
    );
  }

  if (CustomComponent) {
    const extraProps = section.section_type === 'blank' ? { sectionId: section.id } : {};
    return (
      <EditableSection sectionId={section.id} sectionType={section.section_type} dbSectionId={section.id}>
        <CustomComponent data={section.section_data} {...extraProps} />
      </EditableSection>
    );
  }

  return null;
};

export default DynamicSectionRenderer;
