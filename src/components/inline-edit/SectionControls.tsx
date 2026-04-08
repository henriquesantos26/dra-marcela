import React from 'react';
import { useInlineEdit, SectionStyle } from '@/contexts/InlineEditContext';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Grid3X3, LayoutGrid, GalleryHorizontal, Star, SlidersHorizontal, AlignLeft, AlignCenter, AlignRight, MousePointer } from 'lucide-react';
import type { BlankElement } from '@/components/sections/BlankSection';
import { ELEMENT_TYPES } from '@/components/sections/BlankSection';
import { FONT_OPTIONS } from './FontLoader';

const GALLERY_LAYOUTS = [
  { id: 'grid', label: 'Grid', icon: Grid3X3 },
  { id: 'masonry', label: 'Masonry', icon: LayoutGrid },
  { id: 'horizontal-snap', label: 'Carrossel', icon: GalleryHorizontal },
  { id: 'featured', label: 'Destaque', icon: Star },
  { id: 'slider', label: 'Slider', icon: SlidersHorizontal },
];

const ASPECT_RATIOS = [
  { id: 'square', label: '1:1' },
  { id: '16:9', label: '16:9' },
  { id: 'auto', label: 'Auto' },
];

const GalleryControls = ({ sectionId }: { sectionId: string }) => {
  const { sections, updateSectionData } = useSiteContent();
  const section = sections.find(s => s.id === sectionId);
  if (!section) return null;

  const data = section.section_data as Record<string, any>;
  const layout = data.layout || 'grid';
  const cols = data.columns || 3;
  const gap = data.gap || 4;
  const aspectRatio = data.aspectRatio || 'square';

  const updateData = (partial: Record<string, any>) => {
    updateSectionData(sectionId, { ...data, ...partial });
  };

  return (
    <div className="space-y-5 border-t border-white/10 pt-5">
      <div className="text-xs font-bold text-emerald-400/80 uppercase tracking-wider">Galeria</div>

      {/* Layout selector */}
      <div className="space-y-2">
        <Label className="text-white/70 text-xs font-bold">Layout</Label>
        <div className="grid grid-cols-5 gap-1.5">
          {GALLERY_LAYOUTS.map(l => {
            const Icon = l.icon;
            return (
              <button
                key={l.id}
                onClick={() => updateData({ layout: l.id })}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg text-[10px] font-bold transition-all ${
                  layout === l.id
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                <Icon className="w-4 h-4" />
                {l.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Columns - only for grid/masonry */}
      {(layout === 'grid' || layout === 'masonry') && (
        <div className="space-y-2">
          <Label className="text-white/70 text-xs font-bold">Colunas: {cols}</Label>
          <Slider
            value={[cols]}
            onValueChange={([v]) => updateData({ columns: v })}
            min={1}
            max={6}
            step={1}
            className="w-full"
          />
        </div>
      )}

      {/* Gap */}
      {(layout === 'grid' || layout === 'masonry' || layout === 'featured' || layout === 'horizontal-snap') && (
        <div className="space-y-2">
          <Label className="text-white/70 text-xs font-bold">Espaçamento: {gap}</Label>
          <Slider
            value={[gap]}
            onValueChange={([v]) => updateData({ gap: v })}
            min={0}
            max={12}
            step={1}
            className="w-full"
          />
        </div>
      )}

      {/* Border Radius */}
      <div className="space-y-2">
        <Label className="text-white/70 text-xs font-bold">Curvatura das Bordas: {data.borderRadius ?? 16}px</Label>
        <Slider
          value={[data.borderRadius ?? 16]}
          onValueChange={([v]) => updateData({ borderRadius: v })}
          min={0}
          max={48}
          step={2}
          className="w-full"
        />
      </div>

      {/* Aspect Ratio - only for grid */}
      {layout === 'grid' && (
        <div className="space-y-2">
          <Label className="text-white/70 text-xs font-bold">Proporção</Label>
          <div className="grid grid-cols-3 gap-2">
            {ASPECT_RATIOS.map(ar => (
              <button
                key={ar.id}
                onClick={() => updateData({ aspectRatio: ar.id })}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  aspectRatio === ar.id
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                {ar.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const VARIANT_OPTIONS: Record<string, { id: string; label: string }[]> = {
  'custom-hero': [
    { id: 'centered', label: 'Centralizado' },
    { id: 'split', label: 'Dividido' },
    { id: 'video-bg', label: 'Fundo Imagem' },
    { id: 'minimal', label: 'Minimalista' },
    { id: 'gradient-wave', label: 'Gradiente' },
  ],
  'custom-testimonials': [
    { id: 'cards-grid', label: 'Grid Cards' },
    { id: 'carousel', label: 'Carrossel' },
    { id: 'single-focus', label: 'Foco Único' },
    { id: 'stacked', label: 'Empilhado' },
    { id: 'bubbles', label: 'Balões' },
  ],
  'custom-banner': [
    { id: 'full-image', label: 'Imagem Full' },
    { id: 'split-half', label: 'Dividido' },
    { id: 'glassmorphic', label: 'Glass' },
    { id: 'gradient-cta', label: 'Gradiente' },
    { id: 'minimal-line', label: 'Minimalista' },
    { id: 'video-scroll', label: 'Vídeo Scroll' },
  ],
  'custom-header': [
    { id: 'classic', label: 'Clássico' },
    { id: 'centered-logo', label: 'Logo Centro' },
    { id: 'transparent-glass', label: 'Glass' },
    { id: 'sidebar-toggle', label: 'Hamburguer' },
    { id: 'floating-pill', label: 'Pill' },
  ],
  'custom-cta': [
    { id: 'centered', label: 'Centralizado' },
    { id: 'split-action', label: 'Dividido' },
    { id: 'card-cta', label: 'Card' },
    { id: 'gradient-banner', label: 'Gradiente' },
    { id: 'countdown', label: 'Countdown' },
  ],
  'custom-services': [
    { id: 'icon-grid', label: 'Grid Ícones' },
    { id: 'cards-hover', label: 'Cards Hover' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'tabs', label: 'Abas' },
    { id: 'accordion', label: 'Acordeão' },
  ],
};

const VideoScrollControls = ({ sectionId }: { sectionId: string }) => {
  const { sections, updateSectionData } = useSiteContent();
  const section = sections.find(s => s.id === sectionId);
  if (!section) return null;

  const data = section.section_data as Record<string, any>;
  if (data.variant !== 'video-scroll') return null;

  const videoUrl = data.videoUrl || '';
  const scrollDistance = data.scrollDistance || 500;

  const updateData = (partial: Record<string, any>) => {
    updateSectionData(sectionId, { ...data, ...partial });
  };

  return (
    <div className="space-y-4 border-t border-white/10 pt-5">
      <div className="text-xs font-bold text-emerald-400/80 uppercase tracking-wider">Vídeo Scroll</div>
      <div className="space-y-2">
        <Label className="text-white/70 text-xs font-bold">URL do Vídeo</Label>
        <Input
          value={videoUrl}
          onChange={(e) => updateData({ videoUrl: e.target.value })}
          placeholder="https://exemplo.com/video.mp4"
          className="bg-white/10 border-white/20 text-white text-xs h-10"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-white/70 text-xs font-bold">Distância de Scroll: {scrollDistance}vh</Label>
        <Slider
          value={[scrollDistance]}
          onValueChange={([v]) => updateData({ scrollDistance: v })}
          min={300}
          max={1100}
          step={50}
          className="w-full"
        />
      </div>
    </div>
  );
};

const VariantSelector = ({ sectionId, sectionType }: { sectionId: string; sectionType: string }) => {
  const { sections, updateSectionData } = useSiteContent();
  const section = sections.find(s => s.id === sectionId);
  if (!section) return null;

  const data = section.section_data as Record<string, any>;
  const currentVariant = data.variant || VARIANT_OPTIONS[sectionType]?.[0]?.id || '';
  const options = VARIANT_OPTIONS[sectionType] || [];

  return (
    <div className="space-y-3 border-t border-white/10 pt-5">
      <div className="text-xs font-bold text-emerald-400/80 uppercase tracking-wider">Variação</div>
      <div className="grid grid-cols-2 gap-1.5">
        {options.map(o => (
          <button
            key={o.id}
            onClick={() => updateSectionData(sectionId, { ...data, variant: o.id })}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              currentVariant === o.id
                ? 'bg-emerald-500 text-white'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
};

const ANIMATION_OPTIONS = [
  { id: 'none', label: 'Nenhum' },
  { id: 'fade-in', label: 'Fade In' },
  { id: 'slide-up', label: 'Slide Up' },
  { id: 'slide-left', label: 'Slide Left' },
  { id: 'slide-right', label: 'Slide Right' },
  { id: 'scale-in', label: 'Scale In' },
  { id: 'bounce', label: 'Bounce' },
];

const WEIGHT_OPTIONS = [
  { label: 'Light', value: '300' },
  { label: 'Regular', value: '400' },
  { label: 'Medium', value: '500' },
  { label: 'Semi', value: '600' },
  { label: 'Bold', value: '700' },
  { label: 'Black', value: '900' },
];

const BlankElementControls = ({ sectionId }: { sectionId: string }) => {
  const { sections, updateSectionData } = useSiteContent();
  const { selectedBlankElementId, setSelectedBlankElementId } = useInlineEdit();
  const section = sections.find(s => s.id === sectionId);
  if (!section) return null;

  const elements: BlankElement[] = ((section.section_data as any).elements || []);

  // Recursively find element (supports nested column children)
  const findElementRecursive = (els: BlankElement[], id: string): BlankElement | null => {
    for (const el of els) {
      if (el.id === id) return el;
      if (el.type === 'columns' && el.data.children) {
        for (const col of el.data.children) {
          const found = findElementRecursive(col, id);
          if (found) return found;
        }
      }
    }
    return null;
  };

  const selectedEl = selectedBlankElementId ? findElementRecursive(elements, selectedBlankElementId) : null;

  // Recursively update element data (supports nested column children)
  const updateElementRecursive = (els: BlankElement[], id: string, newData: Record<string, any>): BlankElement[] => {
    return els.map(el => {
      if (el.id === id) return { ...el, data: { ...el.data, ...newData } };
      if (el.type === 'columns' && el.data.children) {
        const newChildren = el.data.children.map((col: BlankElement[]) => updateElementRecursive(col, id, newData));
        return { ...el, data: { ...el.data, children: newChildren } };
      }
      return el;
    });
  };

  const updateElement = (newData: Record<string, any>) => {
    if (!selectedEl) return;
    const updated = updateElementRecursive(elements, selectedEl.id, newData);
    updateSectionData(sectionId, { ...(section.section_data as any), elements: updated });
  };

  if (!selectedEl) {
    return (
      <div className="space-y-3 border-t border-white/10 pt-5">
        <div className="text-xs font-bold text-emerald-400/80 uppercase tracking-wider">Elementos ({elements.length})</div>
        <div className="flex flex-col items-center justify-center py-6 text-white/40 text-xs text-center gap-2">
          <MousePointer className="w-5 h-5 text-white/20" />
          <span>Clique em um elemento<br/>na seção para editá-lo</span>
        </div>
        {/* Quick list of elements */}
        <div className="space-y-1">
          {elements.map(el => {
            const typeInfo = ELEMENT_TYPES.find(t => t.type === el.type);
            const Icon = typeInfo ? (ELEMENT_TYPES as any).find((t: any) => t.type === el.type)?.icon : null;
            return (
              <button
                key={el.id}
                onClick={() => setSelectedBlankElementId(el.id)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs transition-all text-left"
              >
                {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" />}
                <span className="truncate">{typeInfo?.label || el.type}: {el.data.text || el.data.url || '...'}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const typeInfo = ELEMENT_TYPES.find(t => t.type === selectedEl.type);
  const isTextType = selectedEl.type === 'heading' || selectedEl.type === 'text';
  const hasAlign = selectedEl.type === 'heading' || selectedEl.type === 'text' || selectedEl.type === 'image' || selectedEl.type === 'button' || selectedEl.type === 'video';

  return (
    <div className="space-y-4 border-t border-white/10 pt-5">
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold text-emerald-400/80 uppercase tracking-wider">{typeInfo?.label || selectedEl.type}</div>
        <button onClick={() => setSelectedBlankElementId(null)} className="text-[10px] text-white/40 hover:text-white/70 transition-colors">← Voltar</button>
      </div>

      {/* ─── Content fields ─── */}
      {selectedEl.type === 'heading' && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-white/70 text-xs font-bold">Texto</Label>
            <Input value={selectedEl.data.text || ''} onChange={(e) => updateElement({ text: e.target.value })}
              placeholder="Texto do título" className="bg-white/10 border-white/20 text-white text-xs h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/70 text-xs font-bold">Nível</Label>
            <div className="grid grid-cols-4 gap-1">
              {['h1','h2','h3','h4'].map(l => (
                <button key={l} onClick={() => updateElement({ level: l })}
                  className={`px-2 py-1.5 rounded-lg text-[10px] font-bold ${selectedEl.data.level === l ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedEl.type === 'text' && (
        <div className="space-y-1.5">
          <Label className="text-white/70 text-xs font-bold">Texto</Label>
          <textarea value={selectedEl.data.text || ''} onChange={(e) => updateElement({ text: e.target.value })}
            className="w-full bg-white/10 border border-white/20 text-white text-xs rounded-lg p-2 min-h-[80px] resize-y outline-none focus:border-emerald-500/50" placeholder="Texto..." />
        </div>
      )}

      {selectedEl.type === 'image' && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-white/70 text-xs font-bold">URL da Imagem</Label>
            <Input value={selectedEl.data.url || ''} onChange={(e) => updateElement({ url: e.target.value })}
              placeholder="https://..." className="bg-white/10 border-white/20 text-white text-xs h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/70 text-xs font-bold">Largura Máxima: {selectedEl.data.maxWidth ?? 800}px</Label>
            <Slider value={[selectedEl.data.maxWidth ?? 800]} onValueChange={([v]) => updateElement({ maxWidth: v })}
              min={100} max={1400} step={20} className="w-full" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/70 text-xs font-bold">Curvatura: {selectedEl.data.borderRadius ?? 12}px</Label>
            <Slider value={[selectedEl.data.borderRadius ?? 12]} onValueChange={([v]) => updateElement({ borderRadius: v })}
              min={0} max={100} step={2} className="w-full" />
          </div>
        </div>
      )}

      {selectedEl.type === 'button' && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-white/70 text-xs font-bold">Texto</Label>
            <Input value={selectedEl.data.text || ''} onChange={(e) => updateElement({ text: e.target.value })}
              placeholder="Texto do botão" className="bg-white/10 border-white/20 text-white text-xs h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/70 text-xs font-bold">URL do Link</Label>
            <Input value={selectedEl.data.url || ''} onChange={(e) => updateElement({ url: e.target.value })}
              placeholder="https://..." className="bg-white/10 border-white/20 text-white text-xs h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/70 text-xs font-bold">Estilo</Label>
            <div className="grid grid-cols-3 gap-1">
              {['primary','outline','ghost'].map(s => (
                <button key={s} onClick={() => updateElement({ style: s })}
                  className={`px-2 py-1.5 rounded-lg text-[10px] font-bold capitalize ${selectedEl.data.style === s ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/70 text-xs font-bold">Cor do Fundo</Label>
            <div className="flex items-center gap-2">
              <label className="relative cursor-pointer">
                <div className="w-8 h-8 rounded-lg border-2 border-white/30" style={{ backgroundColor: selectedEl.data.bgColor || '#6366f1' }} />
                <input type="color" value={selectedEl.data.bgColor || '#6366f1'} onChange={(e) => updateElement({ bgColor: e.target.value })}
                  className="absolute inset-0 opacity-0 cursor-pointer" />
              </label>
              <Input value={selectedEl.data.bgColor || ''} onChange={(e) => updateElement({ bgColor: e.target.value })}
                placeholder="#6366f1" className="bg-white/10 border-white/20 text-white text-xs h-8 flex-1" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/70 text-xs font-bold">Curvatura: {selectedEl.data.borderRadius ?? 8}px</Label>
            <Slider value={[selectedEl.data.borderRadius ?? 8]} onValueChange={([v]) => updateElement({ borderRadius: v })}
              min={0} max={50} step={2} className="w-full" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-white/60 text-[10px]">Padding X: {selectedEl.data.paddingX ?? 24}px</Label>
              <Slider value={[selectedEl.data.paddingX ?? 24]} onValueChange={([v]) => updateElement({ paddingX: v })}
                min={8} max={80} step={4} className="w-full" />
            </div>
            <div className="space-y-1">
              <Label className="text-white/60 text-[10px]">Padding Y: {selectedEl.data.paddingY ?? 12}px</Label>
              <Slider value={[selectedEl.data.paddingY ?? 12]} onValueChange={([v]) => updateElement({ paddingY: v })}
                min={4} max={40} step={2} className="w-full" />
            </div>
          </div>
        </div>
      )}

      {selectedEl.type === 'spacer' && (
        <div className="space-y-1.5">
          <Label className="text-white/70 text-xs font-bold">Altura: {selectedEl.data.height ?? 40}px</Label>
          <Slider value={[selectedEl.data.height ?? 40]} onValueChange={([v]) => updateElement({ height: v })}
            min={8} max={300} step={4} className="w-full" />
        </div>
      )}

      {selectedEl.type === 'video' && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-white/70 text-xs font-bold">URL do Vídeo</Label>
            <Input value={selectedEl.data.url || ''} onChange={(e) => updateElement({ url: e.target.value })}
              placeholder="YouTube ou MP4" className="bg-white/10 border-white/20 text-white text-xs h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/70 text-xs font-bold">Largura Máxima: {selectedEl.data.maxWidth ?? 800}px</Label>
            <Slider value={[selectedEl.data.maxWidth ?? 800]} onValueChange={([v]) => updateElement({ maxWidth: v })}
              min={200} max={1400} step={20} className="w-full" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/70 text-xs font-bold">Curvatura: {selectedEl.data.borderRadius ?? 12}px</Label>
            <Slider value={[selectedEl.data.borderRadius ?? 12]} onValueChange={([v]) => updateElement({ borderRadius: v })}
              min={0} max={48} step={2} className="w-full" />
          </div>
        </div>
      )}

      {selectedEl.type === 'divider' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <label className="relative cursor-pointer">
              <div className="w-8 h-8 rounded border border-white/30" style={{ backgroundColor: selectedEl.data.color || '#ffffff30' }} />
              <input type="color" value={selectedEl.data.color || '#ffffff'} onChange={(e) => updateElement({ color: e.target.value })}
                className="absolute inset-0 opacity-0 cursor-pointer" />
            </label>
            <div className="flex-1 space-y-1">
              <Label className="text-white/60 text-[10px]">Espessura: {selectedEl.data.thickness ?? 1}px</Label>
              <Slider value={[selectedEl.data.thickness ?? 1]} onValueChange={([v]) => updateElement({ thickness: v })}
                min={1} max={8} step={1} className="w-full" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/70 text-xs font-bold">Largura: {selectedEl.data.width ?? 100}%</Label>
            <Slider value={[selectedEl.data.width ?? 100]} onValueChange={([v]) => updateElement({ width: v })}
              min={10} max={100} step={5} className="w-full" />
          </div>
        </div>
      )}

      {selectedEl.type === 'carousel' && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-white/70 text-xs font-bold">Espaçamento: {selectedEl.data.gap ?? 16}px</Label>
            <Slider value={[selectedEl.data.gap ?? 16]} onValueChange={([v]) => updateElement({ gap: v })}
              min={0} max={48} step={4} className="w-full" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/70 text-xs font-bold">Largura do Item: {selectedEl.data.itemWidth ?? 288}px</Label>
            <Slider value={[selectedEl.data.itemWidth ?? 288]} onValueChange={([v]) => updateElement({ itemWidth: v })}
              min={150} max={600} step={10} className="w-full" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/70 text-xs font-bold">Curvatura: {selectedEl.data.borderRadius ?? 12}px</Label>
            <Slider value={[selectedEl.data.borderRadius ?? 12]} onValueChange={([v]) => updateElement({ borderRadius: v })}
              min={0} max={48} step={2} className="w-full" />
          </div>
        </div>
      )}

      {selectedEl.type === 'columns' && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-white/70 text-xs font-bold">Direção</Label>
            <div className="grid grid-cols-2 gap-1">
              {[{ val: 'horizontal', label: 'Horizontal' }, { val: 'vertical', label: 'Vertical' }].map(d => (
                <button key={d.val} onClick={() => updateElement({ direction: d.val })}
                  className={`px-2 py-1.5 rounded-lg text-[10px] font-bold ${selectedEl.data.direction === d.val || (!selectedEl.data.direction && d.val === 'horizontal') ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/70 text-xs font-bold">Colunas: {selectedEl.data.count ?? 2}</Label>
            <Slider value={[selectedEl.data.count ?? 2]} onValueChange={([v]) => {
              const currentChildren = selectedEl.data.children || [];
              const newChildren = Array.from({ length: v }, (_, i) => currentChildren[i] || []);
              updateElement({ count: v, children: newChildren });
            }} min={1} max={6} step={1} className="w-full" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/70 text-xs font-bold">Espaçamento: {selectedEl.data.gap ?? 16}px</Label>
            <Slider value={[selectedEl.data.gap ?? 16]} onValueChange={([v]) => updateElement({ gap: v })}
              min={0} max={64} step={4} className="w-full" />
          </div>
        </div>
      )}

      {/* ─── Shared Typography Controls (heading + text) ─── */}
      {isTextType && (
        <div className="space-y-3 border-t border-white/10 pt-4">
          <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Tipografia</div>

          {/* Color */}
          <div className="space-y-1.5">
            <Label className="text-white/70 text-xs font-bold">Cor do Texto</Label>
            <div className="flex items-center gap-2">
              <label className="relative cursor-pointer">
                <div className="w-8 h-8 rounded-lg border-2 border-white/30" style={{ backgroundColor: selectedEl.data.color || '#ffffff' }} />
                <input type="color" value={selectedEl.data.color || '#ffffff'} onChange={(e) => updateElement({ color: e.target.value })}
                  className="absolute inset-0 opacity-0 cursor-pointer" />
              </label>
              <Input value={selectedEl.data.color || ''} onChange={(e) => updateElement({ color: e.target.value })}
                placeholder="#ffffff" className="bg-white/10 border-white/20 text-white text-xs h-8 flex-1" />
            </div>
          </div>

          {/* Font Size */}
          <div className="space-y-1.5">
            <Label className="text-white/70 text-xs font-bold">Tamanho: {selectedEl.data.fontSize || (selectedEl.type === 'heading' ? '36' : '18')}px</Label>
            <Slider
              value={[parseInt(selectedEl.data.fontSize || (selectedEl.type === 'heading' ? '36' : '18'))]}
              onValueChange={([v]) => updateElement({ fontSize: String(v) })}
              min={10} max={120} step={1} className="w-full"
            />
          </div>

          {/* Font Weight */}
          <div className="space-y-1.5">
            <Label className="text-white/70 text-xs font-bold">Peso</Label>
            <div className="grid grid-cols-3 gap-1">
              {WEIGHT_OPTIONS.map(w => (
                <button key={w.value} onClick={() => updateElement({ fontWeight: w.value })}
                  className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                    selectedEl.data.fontWeight === w.value ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}>
                  {w.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font Family */}
          <div className="space-y-1.5">
            <Label className="text-white/70 text-xs font-bold">Fonte</Label>
            <select value={selectedEl.data.fontFamily || ''} onChange={(e) => updateElement({ fontFamily: e.target.value })}
              className="w-full bg-white/10 text-white text-xs font-bold rounded-lg px-3 py-2 border border-white/20 outline-none cursor-pointer">
              <option value="">Padrão</option>
              {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>

          {/* Letter Spacing */}
          <div className="space-y-1.5">
            <Label className="text-white/70 text-xs font-bold">Espaçamento: {selectedEl.data.letterSpacing ?? 0}px</Label>
            <Slider value={[selectedEl.data.letterSpacing ?? 0]} onValueChange={([v]) => updateElement({ letterSpacing: v })}
              min={-2} max={15} step={0.5} className="w-full" />
          </div>

          {/* Line Height (text only) */}
          {selectedEl.type === 'text' && (
            <div className="space-y-1.5">
              <Label className="text-white/70 text-xs font-bold">Altura da Linha: {selectedEl.data.lineHeight ?? 1.7}</Label>
              <Slider value={[selectedEl.data.lineHeight ?? 1.7]} onValueChange={([v]) => updateElement({ lineHeight: v })}
                min={1} max={3} step={0.1} className="w-full" />
            </div>
          )}
        </div>
      )}

      {/* ─── Button text color ─── */}
      {selectedEl.type === 'button' && (
        <div className="space-y-1.5">
          <Label className="text-white/70 text-xs font-bold">Cor do Texto</Label>
          <div className="flex items-center gap-2">
            <label className="relative cursor-pointer">
              <div className="w-8 h-8 rounded-lg border-2 border-white/30" style={{ backgroundColor: selectedEl.data.color || '#ffffff' }} />
              <input type="color" value={selectedEl.data.color || '#ffffff'} onChange={(e) => updateElement({ color: e.target.value })}
                className="absolute inset-0 opacity-0 cursor-pointer" />
            </label>
            <Input value={selectedEl.data.color || ''} onChange={(e) => updateElement({ color: e.target.value })}
              placeholder="#ffffff" className="bg-white/10 border-white/20 text-white text-xs h-8 flex-1" />
          </div>
        </div>
      )}

      {/* ─── Shared Alignment ─── */}
      {hasAlign && (
        <div className="space-y-1.5 border-t border-white/10 pt-4">
          <Label className="text-white/70 text-xs font-bold">Alinhamento</Label>
          <div className="flex gap-1.5">
            {[
              { value: 'left', icon: AlignLeft },
              { value: 'center', icon: AlignCenter },
              { value: 'right', icon: AlignRight },
            ].map(({ value, icon: Icon }) => (
              <button key={value} onClick={() => updateElement({ align: value })}
                className={`flex-1 flex items-center justify-center py-2 rounded-lg transition-all ${
                  selectedEl.data.align === value ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}>
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── Shared Opacity ─── */}
      {(isTextType || selectedEl.type === 'image') && (
        <div className="space-y-1.5 border-t border-white/10 pt-4">
          <Label className="text-white/70 text-xs font-bold">Opacidade: {selectedEl.data.opacity ?? 100}%</Label>
          <Slider value={[selectedEl.data.opacity ?? 100]} onValueChange={([v]) => updateElement({ opacity: v })}
            min={10} max={100} step={5} className="w-full" />
        </div>
      )}

      {/* ─── Shared Animation ─── */}
      <div className="space-y-1.5 border-t border-white/10 pt-4">
        <Label className="text-white/70 text-xs font-bold">Animação</Label>
        <div className="grid grid-cols-2 gap-1">
          {ANIMATION_OPTIONS.map(a => (
            <button key={a.id} onClick={() => updateElement({ animation: a.id })}
              className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                (selectedEl.data.animation || 'none') === a.id ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}>
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const SectionControls = () => {
  const { selectedSection, selectedSectionType, getSectionStyle, updateSectionStyle } = useInlineEdit();

  if (!selectedSection) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-white/40 text-sm">
        Clique em uma seção para editar
      </div>
    );
  }

  const style = getSectionStyle(selectedSection);

  const update = (partial: Partial<SectionStyle>) => {
    updateSectionStyle(selectedSection, partial);
  };

  return (
    <div className="space-y-6">
      <div className="text-xs font-bold text-white/50 uppercase tracking-wider">
        Seção: {selectedSectionType || selectedSection}
      </div>

      {/* Background Type */}
      <div className="space-y-2">
        <Label className="text-white/70 text-xs font-bold">Tipo de Fundo</Label>
        <div className="grid grid-cols-3 gap-2">
          {(['solid', 'gradient', 'image'] as const).map(type => (
            <button
              key={type}
              onClick={() => update({ backgroundType: type })}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                style.backgroundType === type
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {type === 'solid' ? 'Cor' : type === 'gradient' ? 'Degradê' : 'Imagem'}
            </button>
          ))}
        </div>
      </div>

      {/* Solid Color */}
      {style.backgroundType === 'solid' && (
        <div className="space-y-2">
          <Label className="text-white/70 text-xs font-bold">Cor de Fundo</Label>
          <div className="flex items-center gap-3">
            <label className="relative cursor-pointer">
              <div className="w-10 h-10 rounded-lg border-2 border-white/30" style={{ backgroundColor: style.backgroundColor || '#000000' }} />
              <input
                type="color"
                value={style.backgroundColor || '#000000'}
                onChange={(e) => update({ backgroundColor: e.target.value })}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </label>
            <Input
              value={style.backgroundColor || ''}
              onChange={(e) => update({ backgroundColor: e.target.value })}
              placeholder="#000000"
              className="bg-white/10 border-white/20 text-white text-xs h-10"
            />
          </div>
        </div>
      )}

      {/* Gradient */}
      {style.backgroundType === 'gradient' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white/70 text-xs font-bold">Cor Inicial</Label>
            <div className="flex items-center gap-3">
              <label className="relative cursor-pointer">
                <div className="w-10 h-10 rounded-lg border-2 border-white/30" style={{ backgroundColor: style.gradientFrom || '#6366f1' }} />
                <input
                  type="color"
                  value={style.gradientFrom || '#6366f1'}
                  onChange={(e) => update({ gradientFrom: e.target.value })}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </label>
              <Input
                value={style.gradientFrom || ''}
                onChange={(e) => update({ gradientFrom: e.target.value })}
                placeholder="#6366f1"
                className="bg-white/10 border-white/20 text-white text-xs h-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white/70 text-xs font-bold">Cor Final</Label>
            <div className="flex items-center gap-3">
              <label className="relative cursor-pointer">
                <div className="w-10 h-10 rounded-lg border-2 border-white/30" style={{ backgroundColor: style.gradientTo || '#a855f7' }} />
                <input
                  type="color"
                  value={style.gradientTo || '#a855f7'}
                  onChange={(e) => update({ gradientTo: e.target.value })}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </label>
              <Input
                value={style.gradientTo || ''}
                onChange={(e) => update({ gradientTo: e.target.value })}
                placeholder="#a855f7"
                className="bg-white/10 border-white/20 text-white text-xs h-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white/70 text-xs font-bold">Ângulo: {style.gradientAngle || 135}°</Label>
            <Slider
              value={[style.gradientAngle || 135]}
              onValueChange={([v]) => update({ gradientAngle: v })}
              min={0}
              max={360}
              step={5}
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Image */}
      {style.backgroundType === 'image' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white/70 text-xs font-bold">URL da Imagem</Label>
            <Input
              value={style.backgroundImage || ''}
              onChange={(e) => update({ backgroundImage: e.target.value })}
              placeholder="https://..."
              className="bg-white/10 border-white/20 text-white text-xs h-10"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white/70 text-xs font-bold">Opacidade do Overlay: {style.backgroundOverlayOpacity ?? 50}%</Label>
            <Slider
              value={[style.backgroundOverlayOpacity ?? 50]}
              onValueChange={([v]) => update({ backgroundOverlayOpacity: v })}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Padding */}
      <div className="space-y-2">
        <Label className="text-white/70 text-xs font-bold">Padding Vertical</Label>
        <div className="grid grid-cols-4 gap-2">
          {['py-8', 'py-16', 'py-24', 'py-32', 'py-40', 'py-48'].map(py => (
            <button
              key={py}
              onClick={() => update({ paddingY: py })}
              className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                style.paddingY === py
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {py.replace('py-', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      {style.backgroundType !== 'solid' && (
        <div className="space-y-2">
          <Label className="text-white/70 text-xs font-bold">Preview</Label>
          <div
            className="w-full h-20 rounded-xl border border-white/20"
            style={{
              background: style.backgroundType === 'gradient'
                ? `linear-gradient(${style.gradientAngle || 135}deg, ${style.gradientFrom || '#6366f1'}, ${style.gradientTo || '#a855f7'})`
                : style.backgroundType === 'image' && style.backgroundImage
                ? `url(${style.backgroundImage})`
                : '#1a1a2e',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </div>
      )}

      {/* Gallery-specific controls */}
      {selectedSectionType === 'gallery' && (
        <GalleryControls sectionId={selectedSection} />
      )}

      {/* Blank section element controls */}
      {selectedSectionType === 'blank' && (
        <BlankElementControls sectionId={selectedSection} />
      )}

      {/* Variant selector for custom sections */}
      {selectedSection && VARIANT_OPTIONS[selectedSectionType || ''] && (
        <VariantSelector sectionId={selectedSection} sectionType={selectedSectionType || ''} />
      )}

      {/* Video Scroll controls for custom-banner */}
      {selectedSectionType === 'custom-banner' && (
        <VideoScrollControls sectionId={selectedSection} />
      )}
    </div>
  );
};

export default SectionControls;
