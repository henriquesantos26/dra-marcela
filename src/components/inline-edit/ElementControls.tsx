import React from 'react';
import { useInlineEdit, CustomStyle } from '@/contexts/InlineEditContext';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FONT_OPTIONS } from './FontLoader';
import { AlignLeft, AlignCenter, AlignRight, X, MousePointer } from 'lucide-react';

const WEIGHT_OPTIONS = [
  { label: 'Light', value: '300' },
  { label: 'Regular', value: '400' },
  { label: 'Medium', value: '500' },
  { label: 'Semi', value: '600' },
  { label: 'Bold', value: '700' },
  { label: 'Black', value: '900' },
];

const ElementControls = () => {
  const { activeField, getFieldStyle, updateField, setActiveField } = useInlineEdit();

  if (!activeField) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-white/40 text-sm text-center gap-3">
        <MousePointer className="w-6 h-6 text-white/20" />
        <span>Clique em qualquer elemento<br/>para editar seu estilo</span>
      </div>
    );
  }

  const style = getFieldStyle(activeField);

  const update = (partial: Partial<CustomStyle>) => {
    updateField(activeField, { style: partial });
  };

  const fontSizeNum = style.fontSize ? parseInt(style.fontSize) : 16;
  const letterSpacingNum = style.letterSpacing ? parseFloat(style.letterSpacing) : 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold text-white/50 uppercase tracking-wider truncate max-w-[220px]">
          {activeField}
        </div>
        <button
          onClick={() => setActiveField(null)}
          className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Color */}
      <div className="space-y-2">
        <Label className="text-white/70 text-xs font-bold">Cor</Label>
        <div className="flex items-center gap-3">
          <label className="relative cursor-pointer">
            <div className="w-10 h-10 rounded-lg border-2 border-white/30" style={{ backgroundColor: style.color || '#ffffff' }} />
            <input
              type="color"
              value={style.color || '#ffffff'}
              onChange={(e) => update({ color: e.target.value })}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </label>
          <Input
            value={style.color || ''}
            onChange={(e) => update({ color: e.target.value })}
            placeholder="#ffffff"
            className="bg-white/10 border-white/20 text-white text-xs h-10"
          />
        </div>
      </div>

      {/* Font Family */}
      <div className="space-y-2">
        <Label className="text-white/70 text-xs font-bold">Fonte</Label>
        <select
          value={style.fontFamily || ''}
          onChange={(e) => update({ fontFamily: e.target.value })}
          className="w-full bg-white/10 text-white text-xs font-bold rounded-lg px-3 py-2.5 border border-white/20 outline-none cursor-pointer"
        >
          <option value="">Padrão</option>
          {FONT_OPTIONS.map(f => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>

      {/* Font Size */}
      <div className="space-y-2">
        <Label className="text-white/70 text-xs font-bold">Tamanho: {fontSizeNum}px</Label>
        <Slider
          value={[fontSizeNum]}
          onValueChange={([v]) => update({ fontSize: `${v}px` })}
          min={10}
          max={120}
          step={1}
          className="w-full"
        />
      </div>

      {/* Font Weight */}
      <div className="space-y-2">
        <Label className="text-white/70 text-xs font-bold">Peso</Label>
        <div className="grid grid-cols-3 gap-1.5">
          {WEIGHT_OPTIONS.map(w => (
            <button
              key={w.value}
              onClick={() => update({ fontWeight: w.value })}
              className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                style.fontWeight === w.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alignment */}
      <div className="space-y-2">
        <Label className="text-white/70 text-xs font-bold">Alinhamento</Label>
        <div className="flex gap-2">
          {[
            { value: 'left', icon: AlignLeft },
            { value: 'center', icon: AlignCenter },
            { value: 'right', icon: AlignRight },
          ].map(({ value, icon: Icon }) => (
            <button
              key={value}
              onClick={() => update({ textAlign: value })}
              className={`flex-1 flex items-center justify-center py-2.5 rounded-lg transition-all ${
                style.textAlign === value
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Letter Spacing */}
      <div className="space-y-2">
        <Label className="text-white/70 text-xs font-bold">Espaçamento: {letterSpacingNum}px</Label>
        <Slider
          value={[letterSpacingNum]}
          onValueChange={([v]) => update({ letterSpacing: `${v}px` })}
          min={-2}
          max={10}
          step={0.5}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default ElementControls;
