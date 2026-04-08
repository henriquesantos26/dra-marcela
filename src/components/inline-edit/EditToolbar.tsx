import React, { useEffect, useState, useRef } from 'react';
import { Check, X } from 'lucide-react';
import { useInlineEdit } from '@/contexts/InlineEditContext';

interface EditToolbarProps {
  fieldPath: string;
  anchorRef: React.RefObject<HTMLElement>;
  currentColor?: string;
  currentFontSize?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const FONT_SIZES = [
  { label: 'XS', value: '0.75rem' },
  { label: 'SM', value: '0.875rem' },
  { label: 'MD', value: '1rem' },
  { label: 'LG', value: '1.25rem' },
  { label: 'XL', value: '1.5rem' },
  { label: '2XL', value: '2rem' },
  { label: '3XL', value: '2.5rem' },
  { label: '4XL', value: '3rem' },
  { label: '5XL', value: '3.5rem' },
  { label: '6XL', value: '4rem' },
  { label: '7XL', value: '5rem' },
  { label: '8XL', value: '6rem' },
];

const EditToolbar = ({ fieldPath, anchorRef, currentColor, currentFontSize, onConfirm, onCancel }: EditToolbarProps) => {
  const { updateField } = useInlineEdit();
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [color, setColor] = useState(currentColor || '#ffffff');
  const [fontSize, setFontSize] = useState(currentFontSize || '');

  useEffect(() => {
    const updatePos = () => {
      if (!anchorRef.current) return;
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({
        top: rect.top - 56,
        left: Math.max(8, rect.left),
      });
    };
    updatePos();
    window.addEventListener('scroll', updatePos, true);
    window.addEventListener('resize', updatePos);
    return () => {
      window.removeEventListener('scroll', updatePos, true);
      window.removeEventListener('resize', updatePos);
    };
  }, [anchorRef]);

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    updateField(fieldPath, { style: { color: newColor } });
  };

  const handleFontSizeChange = (newSize: string) => {
    setFontSize(newSize);
    updateField(fieldPath, { style: { fontSize: newSize } });
  };

  return (
    <div
      ref={toolbarRef}
      className="fixed z-[9999] flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900/95 backdrop-blur-xl border border-white/20 shadow-2xl"
      style={{ top: Math.max(8, pos.top), left: pos.left }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Color picker */}
      <label className="relative cursor-pointer" title="Cor do texto">
        <div className="w-7 h-7 rounded-lg border-2 border-white/30" style={{ backgroundColor: color }} />
        <input
          type="color"
          value={color}
          onChange={(e) => handleColorChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
      </label>

      {/* Font size select */}
      <select
        value={fontSize}
        onChange={(e) => handleFontSizeChange(e.target.value)}
        className="bg-white/10 text-white text-xs font-bold rounded-lg px-2 py-1.5 border border-white/20 outline-none cursor-pointer"
      >
        <option value="">Tamanho</option>
        {FONT_SIZES.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      {/* Confirm */}
      <button
        onClick={onConfirm}
        className="w-7 h-7 rounded-lg bg-emerald-500/80 hover:bg-emerald-500 flex items-center justify-center text-white transition-colors"
        title="Confirmar"
      >
        <Check className="w-4 h-4" />
      </button>

      {/* Cancel */}
      <button
        onClick={onCancel}
        className="w-7 h-7 rounded-lg bg-red-500/80 hover:bg-red-500 flex items-center justify-center text-white transition-colors"
        title="Cancelar"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default EditToolbar;
