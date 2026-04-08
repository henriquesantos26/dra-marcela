/**
 * @system DO NOT EDIT - Core editor component
 * @description Editable text component with effect support
 * @module system
 */
import React, { useRef, useState, useEffect } from 'react';
import { useInlineEdit, CustomStyle } from '@/contexts/InlineEditContext';
import TextReveal from '@/components/effects/TextReveal';
import MagneticWrapper from '@/components/effects/MagneticWrapper';

interface EditableTextProps {
  fieldPath: string;
  children: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  className?: string;
  style?: React.CSSProperties;
}

const EditableText = ({ fieldPath, children, as: Tag = 'span', className = '', style = {} }: EditableTextProps) => {
  const { editMode, activeField, setActiveField, updateField, getFieldText, getFieldStyle, setSelectedElement, setSidebarOpen } = useInlineEdit();
  const elRef = useRef<HTMLDivElement>(null);
  const [localText, setLocalText] = useState('');

  const isActive = activeField === fieldPath;
  const displayText = getFieldText(fieldPath, children);
  const customStyle = getFieldStyle(fieldPath);

  useEffect(() => {
    if (isActive) {
      setLocalText(displayText);
    }
  }, [isActive, displayText]);

  const mergedStyle: React.CSSProperties = {
    ...style,
    ...(customStyle.color ? { color: customStyle.color } : {}),
    ...(customStyle.fontSize ? { fontSize: customStyle.fontSize } : {}),
    ...(customStyle.fontFamily ? { fontFamily: customStyle.fontFamily } : {}),
    ...(customStyle.fontWeight ? { fontWeight: customStyle.fontWeight } : {}),
    ...(customStyle.textAlign ? { textAlign: customStyle.textAlign as any } : {}),
    ...(customStyle.letterSpacing ? { letterSpacing: customStyle.letterSpacing } : {}),
  };

  const getEffectClass = () => {
    const effect = customStyle.motionEffect;
    if (!effect) return '';
    if (['magnetic', 'stagger-reveal', 'word-reveal', 'glass-scroll', 'horizontal-snap'].includes(effect)) return '';
    if (effect === 'led-border') return 'effect-led-border';
    if (customStyle.motionTrigger === 'hover') return `hover-effect-${effect}`;
    return `animate-effect-${effect}`;
  };

  const effectClass = getEffectClass();

  if (!editMode) {
    // Word reveal effect
    if (customStyle.motionEffect === 'word-reveal') {
      const revealTag = ['h1', 'h2', 'h3', 'h4'].includes(Tag) ? Tag as 'h1' | 'h2' | 'h3' | 'h4' : 'div';
      const el = <TextReveal text={displayText} as={revealTag} className={className} style={mergedStyle} />;
      if (customStyle.linkUrl) {
        return (
          <a href={customStyle.linkUrl} target={customStyle.linkTarget || '_self'} rel={customStyle.linkTarget === '_blank' ? 'noopener noreferrer' : undefined} className="no-underline">
            {el}
          </a>
        );
      }
      return el;
    }

    // Magnetic effect on text
    if (customStyle.motionEffect === 'magnetic') {
      const inner = React.createElement(Tag, { className: `${className} ${effectClass}`, style: mergedStyle }, displayText);
      const wrapped = <MagneticWrapper strength={customStyle.motionStrength || 80}>{inner}</MagneticWrapper>;
      if (customStyle.linkUrl) {
        return (
          <a href={customStyle.linkUrl} target={customStyle.linkTarget || '_self'} rel={customStyle.linkTarget === '_blank' ? 'noopener noreferrer' : undefined} className="no-underline">
            {wrapped}
          </a>
        );
      }
      return wrapped;
    }

    // Default rendering with CSS effects
    const el = React.createElement(Tag, { className: `${className} ${effectClass}`, style: mergedStyle }, displayText);
    if (customStyle.linkUrl) {
      return (
        <a href={customStyle.linkUrl} target={customStyle.linkTarget || '_self'} rel={customStyle.linkTarget === '_blank' ? 'noopener noreferrer' : undefined} className="no-underline">
          {el}
        </a>
      );
    }
    return el;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isActive) {
      setActiveField(fieldPath);
      setSelectedElement('text');
      setSidebarOpen(true);
    }
  };

  const handleConfirm = () => {
    updateField(fieldPath, { text: localText });
    setActiveField(null);
  };

  const handleCancel = () => {
    setLocalText(displayText);
    setActiveField(null);
  };

  return (
    <div
      ref={elRef}
      className={`${className} outline-none transition-all duration-200 inline ${
        isActive
          ? 'ring-2 ring-emerald-400/60 rounded-lg'
          : 'border border-dashed border-transparent hover:border-white/40 cursor-pointer rounded-lg'
      }`}
      style={mergedStyle}
      contentEditable={isActive}
      suppressContentEditableWarning
      onClick={handleClick}
      onInput={(e) => setLocalText(e.currentTarget.textContent || '')}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleConfirm();
        }
        if (e.key === 'Escape') {
          handleCancel();
        }
      }}
    >
      {isActive ? localText : displayText}
    </div>
  );
};

export default EditableText;
