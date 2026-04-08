import React from 'react';
import { useInlineEdit, CustomStyle } from '@/contexts/InlineEditContext';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Layers, Type, MousePointer, Sparkles, Palette,
  ArrowUpDown, Vibrate, Zap, ArrowDown, RotateCw, Gem,
  Magnet, GlassWater, ArrowRightLeft,
} from 'lucide-react';
import SectionControls from './SectionControls';
import TextControls from './TextControls';
import ElementControls from './ElementControls';

// Effects categorized by where they apply
const SECTION_EFFECTS = [
  { id: 'stagger-reveal', label: 'Cascata', icon: Layers, description: 'Revela itens em sequência' },
  { id: 'parallax-grid', label: 'Parallax Grid', icon: Layers, description: 'Colunas em velocidades opostas' },
  { id: 'horizontal-snap', label: 'Scroll Lateral', icon: ArrowRightLeft, description: 'Carrossel snap nativo' },
  { id: 'fullscreen-menu', label: 'Menu Full', icon: Layers, description: 'Menu fullscreen com morphing' },
];

const TEXT_EFFECTS = [
  { id: 'word-reveal', label: 'Texto Blur', icon: Type, description: 'Palavras surgem do blur' },
  { id: 'float', label: 'Flutuante', icon: ArrowUpDown, description: 'Sobe e desce suavemente' },
  { id: 'pulse-glow', label: 'Pulsar', icon: Sparkles, description: 'Brilho pulsante' },
];

const ELEMENT_EFFECTS = [
  { id: 'magnetic', label: 'Magnético', icon: Magnet, description: 'Atraído pelo cursor' },
  { id: 'tilt-card', label: 'Card 3D', icon: Gem, description: 'Inclinação 3D pelo cursor' },
  { id: 'glow-border', label: 'Borda Glow', icon: Sparkles, description: 'Borda neon animada no hover' },
  { id: 'glass-scroll', label: 'Vidro Scroll', icon: GlassWater, description: 'Efeito glass no scroll' },
  { id: 'float', label: 'Flutuante', icon: ArrowUpDown, description: 'Sobe e desce suavemente' },
  { id: 'shake', label: 'Tremer', icon: Vibrate, description: 'Vibração contínua' },
  { id: 'glitch', label: 'Teleporte', icon: Zap, description: 'Efeito glitch/distorção' },
  { id: 'pulse-glow', label: 'Pulsar', icon: Sparkles, description: 'Brilho pulsante' },
  { id: 'bounce', label: 'Quicar', icon: ArrowDown, description: 'Efeito de pulo' },
  { id: 'spin-slow', label: 'Girar', icon: RotateCw, description: 'Rotação lenta contínua' },
  { id: 'jello', label: 'Gelatina', icon: Gem, description: 'Efeito elástico' },
  { id: 'led-border', label: 'Borda LED', icon: Sparkles, description: 'Borda degradê animada' },
];

const TRIGGER_OPTIONS = [
  { value: 'always', label: 'Sempre' },
  { value: 'hover', label: 'No hover' },
];

const InlineEffectsPanel = ({ effects, fieldId }: { effects: typeof ELEMENT_EFFECTS; fieldId: string }) => {
  const { getFieldStyle, updateField } = useInlineEdit();
  const style = getFieldStyle(fieldId);
  const currentEffect = style.motionEffect || '';
  const currentTrigger = style.motionTrigger || 'always';
  const currentStrength = style.motionStrength || 80;

  const update = (partial: Partial<CustomStyle>) => {
    updateField(fieldId, { style: partial });
  };

  const toggleEffect = (effectId: string) => {
    if (currentEffect === effectId) {
      update({ motionEffect: '', motionTrigger: '' });
    } else {
      update({ motionEffect: effectId, motionTrigger: currentTrigger || 'always' });
    }
  };

  const isPremiumEffect = ['magnetic', 'stagger-reveal', 'word-reveal', 'glass-scroll', 'horizontal-snap', 'parallax-grid', 'fullscreen-menu', 'tilt-card', 'glow-border'].includes(currentEffect);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
        <Label className="text-white/70 text-xs font-bold">Efeitos Disponíveis</Label>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {effects.map(({ id, label, icon: Icon, description }) => (
          <button
            key={id}
            onClick={() => toggleEffect(id)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-center ${
              currentEffect === id
                ? 'bg-purple-500/20 border-purple-500/50 text-white'
                : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/70'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-[10px] font-bold">{label}</span>
            <span className="text-[8px] text-white/30 leading-tight">{description}</span>
          </button>
        ))}
      </div>

      {/* Trigger for basic CSS effects */}
      {currentEffect && !isPremiumEffect && (
        <div className="space-y-2 pt-2 border-t border-white/10">
          <Label className="text-white/70 text-xs font-bold">Ativação</Label>
          <div className="flex gap-2">
            {TRIGGER_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => update({ motionTrigger: opt.value })}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  currentTrigger === opt.value
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/10 text-white/50 hover:bg-white/20'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Strength slider for magnetic/tilt */}
      {(currentEffect === 'magnetic' || currentEffect === 'tilt-card') && (
        <div className="space-y-2 pt-2 border-t border-white/10">
          <Label className="text-white/70 text-xs font-bold">
            {currentEffect === 'magnetic' ? 'Força Magnética' : 'Intensidade 3D'}
          </Label>
          <Slider
            value={[currentStrength]}
            onValueChange={([v]) => update({ motionStrength: v })}
            min={5}
            max={currentEffect === 'magnetic' ? 200 : 30}
            step={currentEffect === 'magnetic' ? 10 : 1}
            className="py-2"
          />
          <span className="text-[10px] text-white/30">{currentStrength}</span>
        </div>
      )}

      {/* Link URL */}
      <div className="space-y-2 pt-2 border-t border-white/10">
        <Label className="text-white/70 text-xs font-bold">Link / URL</Label>
        <input
          type="text"
          value={style.linkUrl || ''}
          onChange={(e) => update({ linkUrl: e.target.value })}
          placeholder="https://exemplo.com"
          className="w-full bg-white/10 text-white text-xs rounded-lg px-3 py-2.5 border border-white/20 outline-none placeholder:text-white/30 focus:border-purple-500/50"
        />
        {style.linkUrl && (
          <label className="flex items-center gap-2 text-white/50 text-[10px] cursor-pointer">
            <Switch
              checked={style.linkTarget === '_blank'}
              onCheckedChange={(v) => update({ linkTarget: v ? '_blank' : '_self' })}
              className="scale-75"
            />
            Abrir em nova aba
          </label>
        )}
      </div>
    </div>
  );
};

const SectionEffectsPanel = () => {
  const { selectedSection, updateSectionStyle, getSectionStyle } = useInlineEdit();
  if (!selectedSection) return null;

  const style = getSectionStyle(selectedSection);
  const currentEffect = style.motionEffect || '';

  const toggleEffect = (effectId: string) => {
    updateSectionStyle(selectedSection, {
      motionEffect: currentEffect === effectId ? '' : effectId,
    });
  };

  return (
    <div className="border-t border-white/10 pt-4">
      <div className="text-[10px] text-white/30 mb-3 uppercase tracking-wider font-bold">Efeitos de Seção</div>
      <div className="grid grid-cols-2 gap-2">
        {SECTION_EFFECTS.map(({ id, label, icon: Icon, description }) => (
          <button
            key={id}
            onClick={() => toggleEffect(id)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-center ${
              currentEffect === id
                ? 'bg-emerald-500/20 border-emerald-500/50 text-white'
                : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/70'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-[10px] font-bold">{label}</span>
            <span className="text-[8px] text-white/30 leading-tight">{description}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const UnifiedPropertiesPanel = () => {
  const { selectedSection, selectedSectionType, activeField, selectedElement } = useInlineEdit();

  // Determine what's selected
  const isElementSelected = selectedElement === 'element' && activeField;
  const isTextSelected = !isElementSelected && !!activeField;
  const isSectionSelected = !activeField && !!selectedSection;

  // Nothing selected
  if (!isSectionSelected && !isTextSelected && !isElementSelected) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-white/40 text-sm text-center gap-3">
        <MousePointer className="w-6 h-6 text-white/20" />
        <span>Clique em qualquer elemento<br />para ver suas propriedades</span>
      </div>
    );
  }

  // Header showing what's selected
  const getContextHeader = () => {
    if (isElementSelected) {
      return (
        <div className="flex items-center gap-2 pb-4 border-b border-white/10">
          <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <MousePointer className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Elemento</div>
            <div className="text-[10px] text-white/40 truncate max-w-[240px]">{activeField}</div>
          </div>
        </div>
      );
    }
    if (isTextSelected) {
      return (
        <div className="flex items-center gap-2 pb-4 border-b border-white/10">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <Type className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Texto</div>
            <div className="text-[10px] text-white/40 truncate max-w-[240px]">{activeField}</div>
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 pb-4 border-b border-white/10">
        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
          <Palette className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div>
          <div className="text-xs font-bold text-white">Seção</div>
          <div className="text-[10px] text-white/40 truncate max-w-[240px]">{selectedSectionType || selectedSection}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {getContextHeader()}

      {/* Contextual controls */}
      {isSectionSelected && (
        <>
          <SectionControls />
          <SectionEffectsPanel />
        </>
      )}

      {isTextSelected && activeField && (
        <>
          <TextControls />
          <div className="border-t border-white/10 pt-4">
            <InlineEffectsPanel effects={TEXT_EFFECTS} fieldId={activeField} />
          </div>
        </>
      )}

      {isElementSelected && activeField && (
        <>
          <ElementControls />
          <div className="border-t border-white/10 pt-4">
            <InlineEffectsPanel effects={ELEMENT_EFFECTS} fieldId={activeField} />
          </div>
        </>
      )}
    </div>
  );
};

export default UnifiedPropertiesPanel;
