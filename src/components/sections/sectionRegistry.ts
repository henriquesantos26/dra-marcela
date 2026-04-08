/**
 * @system DO NOT EDIT - Core system file
 * @description Registry of all available section types and their default data
 * @module system
 */
import { LayoutTemplate, BarChart3, MessageSquareQuote, Megaphone, Type, Image, Grid3X3, Minus, Briefcase, Users, Star, HelpCircle, Rocket, SquareDashed } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface SectionTemplate {
  id: string;
  label: string;
  icon: LucideIcon;
  desc: string;
  defaultData: Record<string, any>;
  /** Whether this is a built-in section that reads from site_content */
  builtIn: boolean;
}

export const SECTION_TEMPLATES: SectionTemplate[] = [
  {
    id: 'hero',
    label: 'Hero',
    icon: LayoutTemplate,
    desc: 'Banner principal com título e CTA',
    builtIn: true,
    defaultData: {},
  },
  {
    id: 'trustedBy',
    label: 'Marcas Parceiras',
    icon: Users,
    desc: 'Faixa de logos de marcas parceiras',
    builtIn: true,
    defaultData: {},
  },
  {
    id: 'featureBanner',
    label: 'Banner Destaque',
    icon: Megaphone,
    desc: 'Faixa destaque com imagem e texto',
    builtIn: true,
    defaultData: {},
  },
  {
    id: 'services',
    label: 'Serviços',
    icon: Briefcase,
    desc: 'Grid de serviços + impacto',
    builtIn: true,
    defaultData: {},
  },
  {
    id: 'templates',
    label: 'Templates',
    icon: Grid3X3,
    desc: 'Galeria de templates',
    builtIn: true,
    defaultData: {},
  },
  {
    id: 'stats',
    label: 'Estatísticas',
    icon: BarChart3,
    desc: 'Números e métricas em destaque',
    builtIn: true,
    defaultData: {},
  },
  {
    id: 'clientLogos',
    label: 'Logos Clientes',
    icon: Star,
    desc: 'Carrossel de logos de clientes',
    builtIn: true,
    defaultData: {},
  },
  {
    id: 'testimonials',
    label: 'Depoimentos',
    icon: MessageSquareQuote,
    desc: 'Carrossel de depoimentos',
    builtIn: true,
    defaultData: {},
  },
  {
    id: 'blog',
    label: 'Blog',
    icon: Type,
    desc: 'Últimos posts do blog',
    builtIn: true,
    defaultData: {},
  },
  {
    id: 'faq',
    label: 'FAQ',
    icon: HelpCircle,
    desc: 'Perguntas frequentes',
    builtIn: true,
    defaultData: {},
  },
  {
    id: 'footerCta',
    label: 'CTA Final',
    icon: Rocket,
    desc: 'Chamada para ação antes do footer',
    builtIn: true,
    defaultData: {},
  },
  {
    id: 'blank',
    label: 'Seção em Branco',
    icon: SquareDashed,
    desc: 'Container livre para adicionar elementos',
    builtIn: false,
    defaultData: { elements: [] },
  },
  // ─── Custom section templates with variants ───
  {
    id: 'custom-hero',
    label: 'Hero Custom',
    icon: LayoutTemplate,
    desc: 'Seção hero com 5 variações visuais',
    builtIn: false,
    defaultData: {
      variant: 'centered',
      title: 'Título Principal',
      subtitle: 'Subtítulo descritivo aqui',
      buttonText: 'Saiba Mais',
      buttonUrl: '#',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800',
    },
  },
  {
    id: 'custom-testimonials',
    label: 'Depoimentos Custom',
    icon: MessageSquareQuote,
    desc: 'Depoimentos com 5 layouts diferentes',
    builtIn: false,
    defaultData: {
      variant: 'cards-grid',
      testimonials: [
        { name: 'Ana Silva', role: 'CEO, TechCo', text: 'Incrível resultado! Superou todas as expectativas.', avatar: '' },
        { name: 'Carlos Mendes', role: 'Diretor, AgênciaX', text: 'Profissionalismo e qualidade em cada detalhe.', avatar: '' },
        { name: 'Maria Santos', role: 'Fundadora, StartupY', text: 'Transformou completamente nossa presença digital.', avatar: '' },
      ],
    },
  },
  {
    id: 'custom-banner',
    label: 'Banner Custom',
    icon: Megaphone,
    desc: 'Banner com 5 estilos visuais',
    builtIn: false,
    defaultData: {
      variant: 'full-image',
      title: 'Banner Destaque',
      subtitle: 'Texto de apoio do banner',
      buttonText: 'Ver Mais',
      buttonUrl: '#',
      imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1920',
      videoUrl: '',
      scrollDistance: 500,
    },
  },
  {
    id: 'custom-header',
    label: 'Cabeçalho Custom',
    icon: LayoutTemplate,
    desc: 'Navegação com 5 layouts',
    builtIn: false,
    defaultData: {
      variant: 'classic',
      logoText: 'Logo',
      links: [
        { label: 'Home', url: '#' },
        { label: 'Sobre', url: '#' },
        { label: 'Serviços', url: '#' },
        { label: 'Contato', url: '#' },
      ],
      ctaText: 'Começar',
      ctaUrl: '#',
    },
  },
  {
    id: 'custom-cta',
    label: 'CTA Custom',
    icon: Megaphone,
    desc: 'Call to action com 5 variações',
    builtIn: false,
    defaultData: {
      variant: 'centered',
      title: 'Pronto para começar?',
      subtitle: 'Entre em contato conosco',
      buttonText: 'Fale Conosco',
      buttonUrl: '#',
    },
  },
  {
    id: 'custom-services',
    label: 'Serviços Custom',
    icon: Briefcase,
    desc: 'Serviços com 5 layouts diferentes',
    builtIn: false,
    defaultData: {
      variant: 'icon-grid',
      title: 'Nossos Serviços',
      services: [
        { icon: 'code', title: 'Desenvolvimento', description: 'Sites e aplicações modernas.' },
        { icon: 'palette', title: 'Design', description: 'Interfaces elegantes.' },
        { icon: 'rocket', title: 'Marketing', description: 'Estratégias de crescimento.' },
        { icon: 'zap', title: 'Automação', description: 'Fluxos inteligentes.' },
      ],
    },
  },
  // ─── Simple custom sections ───
  {
    id: 'text',
    label: 'Texto',
    icon: Type,
    desc: 'Bloco de texto livre',
    builtIn: false,
    defaultData: {
      title: 'Título da Seção',
      subtitle: 'Subtítulo opcional',
      body: 'Escreva seu conteúdo aqui...',
      alignment: 'center',
    },
  },
  {
    id: 'image',
    label: 'Imagem',
    icon: Image,
    desc: 'Imagem em destaque',
    builtIn: false,
    defaultData: {
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2064&auto=format&fit=crop',
      alt: 'Imagem em destaque',
      caption: '',
      fullWidth: true,
    },
  },
  {
    id: 'divider',
    label: 'Divisor',
    icon: Minus,
    desc: 'Linha separadora',
    builtIn: false,
    defaultData: {
      style: 'line',
      color: '#ffffff20',
    },
  },
  {
    id: 'cta',
    label: 'CTA',
    icon: Megaphone,
    desc: 'Chamada para ação customizada',
    builtIn: false,
    defaultData: {
      title: 'Pronto para começar?',
      subtitle: 'Entre em contato conosco',
      buttonText: 'Fale Conosco',
      buttonUrl: '#',
    },
  },
  {
    id: 'gallery',
    label: 'Galeria',
    icon: Grid3X3,
    desc: 'Grade de imagens com 5 layouts',
    builtIn: false,
    defaultData: {
      layout: 'grid',
      columns: 3,
      gap: 4,
      aspectRatio: 'square',
      title: '',
      images: [
        { url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400', alt: 'Imagem 1' },
        { url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=400', alt: 'Imagem 2' },
        { url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=400', alt: 'Imagem 3' },
      ],
    },
  },
];

export const getSectionTemplate = (type: string): SectionTemplate | undefined => {
  return SECTION_TEMPLATES.find(t => t.id === type);
};

export const getCustomTemplates = (): SectionTemplate[] => {
  return SECTION_TEMPLATES.filter(t => !t.builtIn);
};

export const getAllTemplates = (): SectionTemplate[] => {
  return SECTION_TEMPLATES;
};
