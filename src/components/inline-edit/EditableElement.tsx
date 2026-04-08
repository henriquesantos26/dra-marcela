/**
 * @system DO NOT EDIT - Core editor component
 * @description Wraps elements for inline editing with effect support
 * @module system
 */
import React from 'react';
import { useInlineEdit } from '@/contexts/InlineEditContext';
import MagneticWrapper from '@/components/effects/MagneticWrapper';
import GlassWrapper from '@/components/effects/GlassWrapper';

export type EditableElementType = 'image' | 'button' | 'container' | 'icon' | 'link' | 'generic';

interface EditableElementProps {
  elementId: string;
  elementType?: EditableElementType;
  label?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const getEffectClass = (effect?: string, trigger?: string): string => {
  if (!effect) return '';
  // Premium effects handled by wrapper components, not CSS
  if (['magnetic', 'stagger-reveal', 'word-reveal', 'glass-scroll', 'horizontal-snap'].includes(effect)) return '';
  if (effect === 'led-border') return 'effect-led-border';
  if (trigger === 'hover') return `hover-effect-${effect}`;
  return `animate-effect-${effect}`;
};

const EditableElement = ({
  elementId,
  elementType = 'generic',
  label,
  children,
  className = '',
  style = {},
}: EditableElementProps) => {
  const {
    editMode,
    activeField,
    setActiveField,
    setSelectedElement,
    setSidebarOpen,
    getFieldStyle,
  } = useInlineEdit();

  const customStyle = getFieldStyle(elementId);
  const isActive = activeField === elementId;

  const mergedStyle: React.CSSProperties = {
    ...style,
    ...(customStyle.color ? { color: customStyle.color } : {}),
    ...(customStyle.fontSize ? { fontSize: customStyle.fontSize } : {}),
    ...(customStyle.fontFamily ? { fontFamily: customStyle.fontFamily } : {}),
    ...(customStyle.fontWeight ? { fontWeight: customStyle.fontWeight } : {}),
    ...(customStyle.textAlign ? { textAlign: customStyle.textAlign as any } : {}),
    ...(customStyle.letterSpacing ? { letterSpacing: customStyle.letterSpacing } : {}),
  };

  const effectClass = getEffectClass(customStyle.motionEffect, customStyle.motionTrigger);

  // Wrap content with premium effect components
  const wrapWithEffect = (node: React.ReactNode): React.ReactNode => {
    const effect = customStyle.motionEffect;
    if (effect === 'magnetic') {
      return <MagneticWrapper strength={customStyle.motionStrength || 80}>{node}</MagneticWrapper>;
    }
    if (effect === 'glass-scroll') {
      return <GlassWrapper>{node}</GlassWrapper>;
    }
    return node;
  };

  // Non-edit mode
  if (!editMode) {
    const inner = (
      <div className={`${className} ${effectClass}`} style={mergedStyle}>
        {children}
      </div>
    );

    const content = wrapWithEffect(inner);

    if (customStyle.linkUrl) {
      return (
        <a
          href={customStyle.linkUrl}
          target={customStyle.linkTarget || '_self'}
          rel={customStyle.linkTarget === '_blank' ? 'noopener noreferrer' : undefined}
          className="no-underline"
        >
          {content}
        </a>
      );
    }

    return <>{content}</>;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveField(elementId);
    setSelectedElement('element' as any);
    setSidebarOpen(true);
  };

  const displayLabel = label || elementType;

  return (
    <div
      onClick={handleClick}
      className={`${className} ${effectClass} relative transition-all duration-200 cursor-pointer ${
        isActive
          ? 'ring-2 ring-blue-400/60 rounded-lg'
          : 'hover:ring-1 hover:ring-white/30 rounded-lg'
      }`}
      style={mergedStyle}
    >
      <div
        className={`absolute -top-5 left-1 z-50 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider pointer-events-none transition-opacity ${
          isActive
            ? 'bg-blue-500 text-white opacity-100'
            : 'bg-white/10 text-white/50 opacity-0 group-hover:opacity-100'
        }`}
        style={{ opacity: isActive ? 1 : undefined }}
      >
        {displayLabel}
      </div>

      {children}
    </div>
  );
};

export default EditableElement;
