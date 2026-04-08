import React, { useState } from 'react';
import { useInlineEdit } from '@/contexts/InlineEditContext';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { Plus, Heading, Type, ImageIcon, MousePointerClick, GalleryHorizontal, ArrowUpDown, Video, Minus, ChevronUp, ChevronDown, Trash2, Copy, Columns, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

export interface BlankElement {
  id: string;
  type: 'heading' | 'text' | 'image' | 'button' | 'carousel' | 'spacer' | 'video' | 'divider' | 'columns';
  data: Record<string, any>;
}

const ELEMENT_TYPES = [
  { type: 'heading', label: 'Título', icon: Heading, defaultData: { text: 'Título aqui', level: 'h2', align: 'center', color: '', fontSize: '', fontWeight: '700', fontFamily: '', opacity: 100, animation: 'none' } },
  { type: 'text', label: 'Texto', icon: Type, defaultData: { text: 'Escreva seu texto aqui...', align: 'center', color: '', fontSize: '', fontWeight: '400', fontFamily: '', opacity: 100, animation: 'none' } },
  { type: 'image', label: 'Imagem', icon: ImageIcon, defaultData: { url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800', alt: 'Imagem', width: '100%', maxWidth: 800, borderRadius: 12, align: 'center', opacity: 100, animation: 'none' } },
  { type: 'button', label: 'Botão', icon: MousePointerClick, defaultData: { text: 'Clique Aqui', url: '#', style: 'primary', align: 'center', color: '', bgColor: '', fontSize: '14', borderRadius: 8, paddingX: 24, paddingY: 12, animation: 'none' } },
  { type: 'carousel', label: 'Carrossel', icon: GalleryHorizontal, defaultData: { images: [
    { url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400', alt: 'Slide 1' },
    { url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=400', alt: 'Slide 2' },
    { url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=400', alt: 'Slide 3' },
  ], gap: 16, borderRadius: 12, itemWidth: 288 } },
  { type: 'spacer', label: 'Espaçador', icon: ArrowUpDown, defaultData: { height: 40 } },
  { type: 'video', label: 'Vídeo', icon: Video, defaultData: { url: '', autoplay: false, borderRadius: 12, maxWidth: 800, align: 'center' } },
  { type: 'divider', label: 'Divisor', icon: Minus, defaultData: { color: '#ffffff30', thickness: 1, width: 100 } },
  { type: 'columns', label: 'Colunas', icon: Columns, defaultData: { count: 2, gap: 16, children: [[], []] } },
] as const;

// ─── Animation wrapper ───
const AnimationWrapper = ({ animation, children }: { animation?: string; children: React.ReactNode }) => {
  if (!animation || animation === 'none') return <>{children}</>;
  
  const classes: Record<string, string> = {
    'fade-in': 'animate-[fadeIn_0.6s_ease-out]',
    'slide-up': 'animate-[slideUp_0.6s_ease-out]',
    'slide-left': 'animate-[slideLeft_0.6s_ease-out]',
    'slide-right': 'animate-[slideRight_0.6s_ease-out]',
    'scale-in': 'animate-[scaleIn_0.5s_ease-out]',
    'bounce': 'animate-bounce',
  };

  return <div className={classes[animation] || ''}>{children}</div>;
};

// ─── Element Renderers ───

const HeadingEl = ({ data }: { data: Record<string, any> }) => {
  const Tag = (data.level || 'h2') as keyof JSX.IntrinsicElements;
  const defaultSizes: Record<string, number> = { h1: 48, h2: 36, h3: 30, h4: 24 };
  const fontSize = data.fontSize ? `${data.fontSize}px` : `${defaultSizes[data.level || 'h2'] || 36}px`;
  
  return (
    <AnimationWrapper animation={data.animation}>
      <Tag
        className="font-bold leading-tight"
        style={{
          textAlign: data.align || 'center',
          color: data.color || undefined,
          fontSize,
          fontWeight: data.fontWeight || '700',
          fontFamily: data.fontFamily || undefined,
          opacity: (data.opacity ?? 100) / 100,
          letterSpacing: data.letterSpacing ? `${data.letterSpacing}px` : undefined,
        }}
      >
        {data.text}
      </Tag>
    </AnimationWrapper>
  );
};

const TextEl = ({ data }: { data: Record<string, any> }) => (
  <AnimationWrapper animation={data.animation}>
    <p
      className="max-w-3xl mx-auto leading-relaxed"
      style={{
        textAlign: data.align || 'center',
        color: data.color || undefined,
        fontSize: data.fontSize ? `${data.fontSize}px` : '18px',
        fontWeight: data.fontWeight || '400',
        fontFamily: data.fontFamily || undefined,
        opacity: (data.opacity ?? 100) / 100,
        letterSpacing: data.letterSpacing ? `${data.letterSpacing}px` : undefined,
        lineHeight: data.lineHeight ? `${data.lineHeight}` : '1.7',
      }}
    >
      {data.text}
    </p>
  </AnimationWrapper>
);

const ImageEl = ({ data }: { data: Record<string, any> }) => {
  const justifyMap: Record<string, string> = { left: 'flex-start', center: 'center', right: 'flex-end' };
  return (
    <AnimationWrapper animation={data.animation}>
      <div className="flex" style={{ justifyContent: justifyMap[data.align || 'center'] || 'center' }}>
        <img
          src={data.url}
          alt={data.alt || ''}
          className="object-cover"
          style={{
            width: data.width || '100%',
            maxWidth: data.maxWidth ? `${data.maxWidth}px` : '100%',
            borderRadius: `${data.borderRadius ?? 12}px`,
            opacity: (data.opacity ?? 100) / 100,
          }}
        />
      </div>
    </AnimationWrapper>
  );
};

const ButtonEl = ({ data }: { data: Record<string, any> }) => {
  const justifyMap: Record<string, string> = { left: 'flex-start', center: 'center', right: 'flex-end' };
  const bgColor = data.bgColor || undefined;
  const textColor = data.color || undefined;

  const baseStyles: Record<string, React.CSSProperties> = {
    primary: { backgroundColor: bgColor || 'hsl(var(--primary))', color: textColor || 'hsl(var(--primary-foreground))' },
    outline: { border: `2px solid ${bgColor || 'hsl(var(--primary))'}`, color: textColor || bgColor || 'hsl(var(--primary))', backgroundColor: 'transparent' },
    ghost: { color: textColor || bgColor || 'hsl(var(--primary))', backgroundColor: 'transparent' },
  };

  return (
    <AnimationWrapper animation={data.animation}>
      <div className="flex" style={{ justifyContent: justifyMap[data.align || 'center'] || 'center' }}>
        <a
          href={data.url || '#'}
          target={data.url?.startsWith('http') ? '_blank' : '_self'}
          rel="noopener noreferrer"
          className="inline-flex items-center font-semibold transition-all hover:opacity-80"
          style={{
            ...baseStyles[data.style || 'primary'],
            fontSize: data.fontSize ? `${data.fontSize}px` : '14px',
            borderRadius: `${data.borderRadius ?? 8}px`,
            padding: `${data.paddingY ?? 12}px ${data.paddingX ?? 24}px`,
          }}
        >
          {data.text || 'Botão'}
        </a>
      </div>
    </AnimationWrapper>
  );
};

const CarouselEl = ({ data }: { data: Record<string, any> }) => {
  const images = data.images || [];
  return (
    <div className="flex overflow-x-auto pb-4 snap-x snap-mandatory" style={{ gap: `${data.gap ?? 16}px` }}>
      {images.map((img: any, i: number) => (
        <img
          key={i}
          src={img.url}
          alt={img.alt || ''}
          className="object-cover flex-shrink-0 snap-center"
          style={{
            width: `${data.itemWidth ?? 288}px`,
            height: `${(data.itemWidth ?? 288) * 0.67}px`,
            borderRadius: `${data.borderRadius ?? 12}px`,
          }}
        />
      ))}
    </div>
  );
};

const SpacerEl = ({ data }: { data: Record<string, any> }) => (
  <div style={{ height: `${data.height || 40}px` }} />
);

const VideoEl = ({ data }: { data: Record<string, any> }) => {
  const justifyMap: Record<string, string> = { left: 'flex-start', center: 'center', right: 'flex-end' };
  if (!data.url) return <div className="w-full h-48 bg-muted/20 rounded-xl flex items-center justify-center text-muted-foreground text-sm">Adicione a URL do vídeo</div>;
  const isYoutube = data.url.includes('youtube') || data.url.includes('youtu.be');
  
  return (
    <div className="flex" style={{ justifyContent: justifyMap[data.align || 'center'] || 'center' }}>
      {isYoutube ? (
        <div className="aspect-video" style={{ width: '100%', maxWidth: data.maxWidth ? `${data.maxWidth}px` : '800px' }}>
          <iframe
            src={`https://www.youtube.com/embed/${data.url.includes('youtu.be') ? data.url.split('/').pop() : new URLSearchParams(new URL(data.url).search).get('v')}${data.autoplay ? '?autoplay=1&mute=1' : ''}`}
            className="w-full h-full"
            style={{ borderRadius: `${data.borderRadius ?? 12}px` }}
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        </div>
      ) : (
        <video
          src={data.url}
          controls={!data.autoplay}
          autoPlay={data.autoplay}
          muted={data.autoplay}
          loop={data.autoplay}
          style={{ maxWidth: data.maxWidth ? `${data.maxWidth}px` : '800px', borderRadius: `${data.borderRadius ?? 12}px` }}
          className="w-full"
        />
      )}
    </div>
  );
};

const DividerEl = ({ data }: { data: Record<string, any> }) => (
  <div className="flex justify-center">
    <hr className="border-0" style={{ height: `${data.thickness || 1}px`, backgroundColor: data.color || '#ffffff30', width: `${data.width ?? 100}%` }} />
  </div>
);

// ─── Columns Element (supports nested elements) ───
const ColumnsElReadonly = ({ data }: { data: Record<string, any> }) => {
  const count = data.count || 2;
  const gap = data.gap ?? 16;
  const direction = data.direction || 'horizontal';
  const children: BlankElement[][] = data.children || Array.from({ length: count }, () => []);

  return (
    <div className="w-full" style={{ display: 'flex', flexDirection: direction === 'vertical' ? 'column' : 'row', gap: `${gap}px` }}>
      {children.slice(0, count).map((colElements: BlankElement[], colIdx: number) => (
        <div key={colIdx} className="flex-1 min-w-0 flex flex-col" style={{ gap: `${gap / 2}px` }}>
          {colElements.map((el: BlankElement) => {
            const R = RENDERERS_FLAT[el.type];
            return R ? <R key={el.id} data={el.data} /> : null;
          })}
        </div>
      ))}
    </div>
  );
};

const ColumnsElEdit = ({ data, sectionId, elementId }: { data: Record<string, any>; sectionId: string; elementId: string }) => {
  const { updateSectionData, sections } = useSiteContent();
  const { selectedBlankElementId, setSelectedBlankElementId, setSelectedSection, setSelectedSectionType } = useInlineEdit();
  const [colMenuOpen, setColMenuOpen] = useState<string | null>(null);
  const count = data.count || 2;
  const gap = data.gap ?? 16;
  const direction = data.direction || 'horizontal';
  const children: BlankElement[][] = data.children || Array.from({ length: count }, () => []);

  const addToColumn = (colIdx: number, type: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;
    const elements: BlankElement[] = (section.section_data as any).elements || [];
    const template = ELEMENT_TYPES.find(e => e.type === type);
    if (!template) return;
    const newChild: BlankElement = { id: crypto.randomUUID(), type: type as BlankElement['type'], data: { ...template.defaultData } };
    const updatedElements = elements.map(el => {
      if (el.id !== elementId) return el;
      const newChildren = [...(el.data.children || Array.from({ length: count }, () => []))];
      newChildren[colIdx] = [...(newChildren[colIdx] || []), newChild];
      return { ...el, data: { ...el.data, children: newChildren } };
    });
    updateSectionData(sectionId, { ...(section.section_data as any), elements: updatedElements });
    setColMenuOpen(null);
  };

  const removeFromColumn = (colIdx: number, childId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;
    const elements: BlankElement[] = (section.section_data as any).elements || [];
    const updatedElements = elements.map(el => {
      if (el.id !== elementId) return el;
      const newChildren = [...(el.data.children || [])];
      newChildren[colIdx] = (newChildren[colIdx] || []).filter((c: BlankElement) => c.id !== childId);
      return { ...el, data: { ...el.data, children: newChildren } };
    });
    updateSectionData(sectionId, { ...(section.section_data as any), elements: updatedElements });
  };

  return (
    <div className="w-full" style={{ display: 'flex', flexDirection: direction === 'vertical' ? 'column' : 'row', gap: `${gap}px` }}>
      {children.slice(0, count).map((colElements: BlankElement[], colIdx: number) => (
        <div
          key={colIdx}
          className="flex-1 min-w-0 flex flex-col border border-dashed border-white/15 rounded-lg p-2 hover:border-emerald-500/30 transition-all"
          style={{ gap: `${gap / 2}px` }}
        >
          {colElements.map((el: BlankElement) => {
            const R = RENDERERS_FLAT[el.type];
            if (!R) return null;
            const isChildSelected = selectedBlankElementId === el.id;
            return (
              <div
                key={el.id}
                className={`relative group/col-el cursor-pointer transition-all rounded ${isChildSelected ? 'ring-2 ring-emerald-500/80 bg-emerald-500/5' : 'hover:ring-1 hover:ring-white/20'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedBlankElementId(el.id);
                  setSelectedSection(sectionId);
                  setSelectedSectionType('blank');
                }}
              >
                <R data={el.data} />
                <button
                  onClick={(e) => { e.stopPropagation(); removeFromColumn(colIdx, el.id); }}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover/col-el:opacity-100 transition-all text-[10px]"
                >
                  ✕
                </button>
              </div>
            );
          })}
          {/* Add to column button */}
          <div className="relative flex justify-center py-1">
            <button
              onClick={(e) => { e.stopPropagation(); setColMenuOpen(colMenuOpen === `${colIdx}` ? null : `${colIdx}`); }}
              className="w-6 h-6 rounded-full bg-emerald-500/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/50 transition-all"
            >
              <Plus className="w-3 h-3" />
            </button>
            {colMenuOpen === `${colIdx}` && (
              <AddElementMenu
                onAdd={(type) => addToColumn(colIdx, type)}
                onClose={() => setColMenuOpen(null)}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Flat renderers (without columns to avoid circular ref)
const RENDERERS_FLAT: Record<string, React.ComponentType<{ data: Record<string, any> }>> = {
  heading: HeadingEl, text: TextEl, image: ImageEl, button: ButtonEl,
  carousel: CarouselEl, spacer: SpacerEl, video: VideoEl, divider: DividerEl,
};

const RENDERERS: Record<string, React.ComponentType<{ data: Record<string, any> }>> = {
  ...RENDERERS_FLAT, columns: ColumnsElReadonly,
};

// ─── Add Element Menu ───

const AddElementMenu = ({ onAdd, onClose }: { onAdd: (type: string) => void; onClose: () => void }) => (
  <div className="absolute left-1/2 -translate-x-1/2 z-50 mt-2">
    <div className="bg-black/80 backdrop-blur-xl border border-white/15 rounded-2xl p-3 shadow-2xl relative">
      <button onClick={onClose} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white text-xs font-bold transition-all">✕</button>
      <div className="grid grid-cols-3 gap-2 min-w-[240px]">
        {ELEMENT_TYPES.map(et => {
          const Icon = et.icon;
          return (
            <button key={et.type} onClick={() => { onAdd(et.type); onClose(); }}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-white/15 transition-all text-white/70 hover:text-white">
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-semibold">{et.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  </div>
);

// ─── Element Wrapper (edit mode) ───

const ElementWrapper = ({ element, sectionId, index, total, onSelect, isSelected }: {
  element: BlankElement; sectionId: string; index: number; total: number;
  onSelect: (id: string) => void; isSelected: boolean;
}) => {
  const { updateSectionData, sections } = useSiteContent();
  const section = sections.find(s => s.id === sectionId);
  if (!section) return null;
  const elements: BlankElement[] = (section.section_data as any).elements || [];

  const removeElement = () => {
    const updated = elements.filter(e => e.id !== element.id);
    updateSectionData(sectionId, { ...(section.section_data as any), elements: updated });
  };

  const duplicateElement = () => {
    const idx = elements.findIndex(e => e.id === element.id);
    const clone: BlankElement = { ...element, id: crypto.randomUUID(), data: { ...element.data } };
    const newEls = [...elements];
    newEls.splice(idx + 1, 0, clone);
    updateSectionData(sectionId, { ...(section.section_data as any), elements: newEls });
  };

  const moveElement = (dir: 'up' | 'down') => {
    const idx = elements.findIndex(e => e.id === element.id);
    const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= elements.length) return;
    const newEls = [...elements];
    [newEls[idx], newEls[targetIdx]] = [newEls[targetIdx], newEls[idx]];
    updateSectionData(sectionId, { ...(section.section_data as any), elements: newEls });
  };

  const isColumns = element.type === 'columns';
  const Renderer = RENDERERS[element.type];
  if (!Renderer && !isColumns) return null;

  return (
    <div
      className={`relative group/el cursor-pointer transition-all rounded-lg ${isSelected ? 'ring-2 ring-emerald-500/80 bg-emerald-500/5' : 'hover:ring-1 hover:ring-white/20'}`}
      onClick={(e) => { e.stopPropagation(); onSelect(element.id); }}
    >
      {isColumns ? (
        <ColumnsElEdit data={element.data} sectionId={sectionId} elementId={element.id} />
      ) : (
        <Renderer data={element.data} />
      )}

      {/* Floating toolbar centered above element */}
      <div className={`absolute -top-10 left-1/2 -translate-x-1/2 z-40 transition-all ${isSelected ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 pointer-events-none group-hover/el:opacity-100 group-hover/el:translate-y-0 group-hover/el:pointer-events-auto'}`}>
        <div className="flex items-center gap-0.5 bg-black/80 backdrop-blur-xl rounded-lg p-1 border border-white/15 shadow-xl">
          <button onClick={(e) => { e.stopPropagation(); moveElement('up'); }} disabled={index === 0}
            className="p-1.5 rounded hover:bg-white/20 text-white/60 hover:text-white disabled:opacity-30 transition-all" title="Mover para cima">
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); moveElement('down'); }} disabled={index === total - 1}
            className="p-1.5 rounded hover:bg-white/20 text-white/60 hover:text-white disabled:opacity-30 transition-all" title="Mover para baixo">
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-4 bg-white/20 mx-0.5" />
          <button onClick={(e) => { e.stopPropagation(); duplicateElement(); }}
            className="p-1.5 rounded hover:bg-white/20 text-white/60 hover:text-white transition-all" title="Duplicar">
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); removeElement(); }}
            className="p-1.5 rounded hover:bg-red-500/30 text-white/60 hover:text-red-400 transition-all" title="Remover">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Alignment quick-actions on left */}
      {isSelected && (element.type === 'heading' || element.type === 'text' || element.type === 'image' || element.type === 'button') && (
        <div className="absolute -left-10 top-1/2 -translate-y-1/2 z-40">
          <div className="flex flex-col gap-0.5 bg-black/80 backdrop-blur-xl rounded-lg p-0.5 border border-white/15">
            {[
              { val: 'left', Icon: AlignLeft },
              { val: 'center', Icon: AlignCenter },
              { val: 'right', Icon: AlignRight },
            ].map(({ val, Icon }) => (
              <button
                key={val}
                onClick={(e) => {
                  e.stopPropagation();
                  const updated = elements.map(el => el.id === element.id ? { ...el, data: { ...el.data, align: val } } : el);
                  updateSectionData(sectionId, { ...(section.section_data as any), elements: updated });
                }}
                className={`p-1.5 rounded transition-all ${element.data.align === val ? 'bg-emerald-500 text-white' : 'hover:bg-white/20 text-white/60'}`}
              >
                <Icon className="w-3 h-3" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main BlankSection ───

interface BlankSectionProps {
  data: Record<string, any>;
  sectionId?: string;
}

const BlankSection = ({ data, sectionId }: BlankSectionProps) => {
  const { editMode, selectedSection, setSelectedSection, setSelectedSectionType, selectedBlankElementId, setSelectedBlankElementId } = useInlineEdit();
  const { updateSectionData } = useSiteContent();
  const [menuOpenAt, setMenuOpenAt] = useState<number | null>(null);

  const elements: BlankElement[] = data.elements || [];

  const addElement = (type: string, atIndex: number) => {
    const template = ELEMENT_TYPES.find(e => e.type === type);
    if (!template || !sectionId) return;
    const newEl: BlankElement = { id: crypto.randomUUID(), type: type as BlankElement['type'], data: { ...template.defaultData } };
    const newElements = [...elements];
    newElements.splice(atIndex, 0, newEl);
    updateSectionData(sectionId, { ...data, elements: newElements });
    setMenuOpenAt(null);
    setSelectedBlankElementId(newEl.id);
  };

  const handleSelectElement = (elId: string) => {
    setSelectedBlankElementId(elId);
    if (sectionId) {
      setSelectedSection(sectionId);
      setSelectedSectionType('blank');
    }
  };

  // Non-edit mode: just render elements
  if (!editMode) {
    return (
      <div className="space-y-6 w-full max-w-6xl mx-auto px-4">
        {elements.map(el => {
          const Renderer = RENDERERS[el.type];
          return Renderer ? <Renderer key={el.id} data={el.data} /> : null;
        })}
      </div>
    );
  }

  // Edit mode
  return (
    <div className="space-y-2 w-full max-w-6xl mx-auto px-4 min-h-[120px] relative">
      {elements.length === 0 ? (
        <div className="relative flex flex-col items-center justify-center py-16">
          <div className="text-white/30 text-sm font-medium mb-4">Seção em branco</div>
          <button
            onClick={() => setMenuOpenAt(0)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30 transition-all text-sm font-semibold"
          >
            <Plus className="w-4 h-4" /> Adicionar Elemento
          </button>
          {menuOpenAt === 0 && <AddElementMenu onAdd={(type) => addElement(type, 0)} onClose={() => setMenuOpenAt(null)} />}
        </div>
      ) : (
        <>
          {/* Insert before first */}
          <div className="relative flex justify-center py-1">
            <button onClick={() => setMenuOpenAt(0)}
              className="w-6 h-6 rounded-full bg-emerald-500/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/50 transition-all">
              <Plus className="w-3 h-3" />
            </button>
            {menuOpenAt === 0 && <AddElementMenu onAdd={(type) => addElement(type, 0)} onClose={() => setMenuOpenAt(null)} />}
          </div>

          {elements.map((el, idx) => (
            <React.Fragment key={el.id}>
              <ElementWrapper
                element={el}
                sectionId={sectionId || ''}
                index={idx}
                total={elements.length}
                onSelect={handleSelectElement}
                isSelected={selectedBlankElementId === el.id}
              />
              {/* Insert after each element */}
              <div className="relative flex justify-center py-1">
                <button onClick={() => setMenuOpenAt(idx + 1)}
                  className="w-6 h-6 rounded-full bg-emerald-500/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/50 transition-all">
                  <Plus className="w-3 h-3" />
                </button>
                {menuOpenAt === idx + 1 && <AddElementMenu onAdd={(type) => addElement(type, idx + 1)} onClose={() => setMenuOpenAt(null)} />}
              </div>
            </React.Fragment>
          ))}
        </>
      )}
    </div>
  );
};

export default BlankSection;
export { ELEMENT_TYPES, RENDERERS };
