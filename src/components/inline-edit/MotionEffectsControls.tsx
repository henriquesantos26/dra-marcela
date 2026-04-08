/**
 * @system DO NOT EDIT - Core editor component
 * @description Motion effects selection panel for the visual editor
 * @module system
 */
import React from 'react';
import { useInlineEdit, CustomStyle } from '@/contexts/InlineEditContext';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  ArrowUpDown,
  Vibrate,
  Zap,
  Sparkles,
  ArrowDown,
  RotateCw,
  Gem,
  MousePointer,
  Magnet,
  Layers,
  Type,
  GlassWater,
  ArrowRightLeft,
} from 'lucide-react';

const BASIC_EFFECTS = [
  { id: 'float', label: 'Flutuante', icon: ArrowUpDown, description: 'Sobe e desce suavemente' },
  { id: 'shake', label: 'Tremer', icon: Vibrate, description: 'Vibração contínua' },
  { id: 'glitch', label: 'Teleporte', icon: Zap, description: 'Efeito glitch/distorção' },
  { id: 'pulse-glow', label: 'Pulsar', icon: Sparkles, description: 'Brilho pulsante' },
  { id: 'bounce', label: 'Quicar', icon: ArrowDown, description: 'Efeito de pulo' },
  { id: 'spin-slow', label: 'Girar', icon: RotateCw, description: 'Rotação lenta contínua' },
  { id: 'jello', label: 'Gelatina', icon: Gem, description: 'Efeito elástico' },
  { id: 'led-border', label: 'Borda LED', icon: Sparkles, description: 'Borda degradê animada' },
] as const;

const PREMIUM_EFFECTS = [
  { id: 'magnetic', label: 'Magnético', icon: Magnet, description: 'Atraído pelo cursor', category: 'element' },
  { id: 'stagger-reveal', label: 'Cascata', icon: Layers, description: 'Revela itens em sequência', category: 'section' },
  { id: 'word-reveal', label: 'Texto Blur', icon: Type, description: 'Palavras surgem do blur', category: 'text' },
  { id: 'glass-scroll', label: 'Vidro Scroll', icon: GlassWater, description: 'Efeito glass no scroll', category: 'element' },
  { id: 'horizontal-snap', label: 'Scroll Lateral', icon: ArrowRightLeft, description: 'Carrossel snap nativo', category: 'section' },
  { id: 'parallax-grid', label: 'Parallax Grid', icon: Layers, description: 'Colunas em velocidades opostas', category: 'section' },
  { id: 'fullscreen-menu', label: 'Menu Full', icon: Layers, description: 'Menu fullscreen com morphing', category: 'section' },
  { id: 'tilt-card', label: 'Card 3D', icon: Gem, description: 'Inclinação 3D pelo cursor', category: 'element' },
  { id: 'glow-border', label: 'Borda Glow', icon: Sparkles, description: 'Borda neon animada no hover', category: 'element' },
] as const;

const TRIGGER_OPTIONS = [
  { value: 'always', label: 'Sempre' },
  { value: 'hover', label: 'No hover' },
];

const MotionEffectsControls = () => {
  const { activeField, getFieldStyle, updateField, selectedElement } = useInlineEdit();

  if (!activeField) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-white/40 text-sm text-center gap-3">
        <MousePointer className="w-6 h-6 text-white/20" />
        <span>Selecione um elemento<br />para adicionar efeitos</span>
      </div>
    );
  }

  const style = getFieldStyle(activeField);
  const currentEffect = style.motionEffect || '';
  const currentTrigger = style.motionTrigger || 'always';
  const currentStrength = style.motionStrength || 80;

  const update = (partial: Partial<CustomStyle>) => {
    updateField(activeField, { style: partial });
  };

  const toggleEffect = (effectId: string) => {
    if (currentEffect === effectId) {
      update({ motionEffect: '', motionTrigger: '' });
    } else {
      update({ motionEffect: effectId, motionTrigger: currentTrigger || 'always' });
    }
  };

  // Premium effects that don't use CSS triggers
  const isPremiumEffect = ['magnetic', 'stagger-reveal', 'word-reveal', 'glass-scroll', 'horizontal-snap', 'parallax-grid', 'fullscreen-menu', 'tilt-card', 'glow-border'].includes(currentEffect);

  const renderEffectGrid = (effects: readonly { id: string; label: string; icon: any; description: string }[], title: string, badgeColor: string) => (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Label className="text-white/70 text-xs font-bold">{title}</Label>
        <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold ${badgeColor}`}>
          {effects.length}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {effects.map(({ id, label, icon: Icon, description }) => (
          <button
            key={id}
            onClick={() => toggleEffect(id)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-center ${
              currentEffect === id
                ? 'bg-blue-500/20 border-blue-500/50 text-white'
                : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/70'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-bold">{label}</span>
            <span className="text-[8px] text-white/30 leading-tight">{description}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {renderEffectGrid(BASIC_EFFECTS, 'Efeitos Simples', 'bg-white/10 text-white/50')}

      <div className="border-t border-white/10" />

      {renderEffectGrid(PREMIUM_EFFECTS, 'Efeitos Premium', 'bg-purple-500/20 text-purple-300')}

      {/* Trigger (only for basic CSS effects) */}
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
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-white/50 hover:bg-white/20'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Magnetic / Tilt strength slider */}
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
          className="w-full bg-white/10 text-white text-xs rounded-lg px-3 py-2.5 border border-white/20 outline-none placeholder:text-white/30 focus:border-blue-500/50"
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

export default MotionEffectsControls;
