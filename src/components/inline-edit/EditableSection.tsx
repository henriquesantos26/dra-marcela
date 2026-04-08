/**
 * @system DO NOT EDIT - Core system file
 * @description Wraps sections with edit mode controls (select, move, delete, duplicate)
 * @module system
 */
import React, { useState } from 'react';
import { useInlineEdit } from '@/contexts/InlineEditContext';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { ChevronUp, ChevronDown, Copy, Trash2, Eye, EyeOff, Plus, GripVertical } from 'lucide-react';
import { getCustomTemplates, getAllTemplates } from '@/components/sections/sectionRegistry';
import { toast } from 'sonner';

interface EditableSectionProps {
  sectionId: string;
  sectionType?: string;
  dbSectionId?: string;
  children: React.ReactNode;
  className?: string;
}

const EditableSection = ({ sectionId, sectionType, dbSectionId, children, className = '' }: EditableSectionProps) => {
  const { editMode, selectedSection, setSelectedSection, setSelectedSectionType, setSelectedElement, setSidebarOpen, getSectionStyle } = useInlineEdit();
  const { moveSection, duplicateSection, removeSection, toggleSectionVisibility, sections, addSection } = useSiteContent();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showInsertPanel, setShowInsertPanel] = useState(false);

  const style = getSectionStyle(sectionId);
  const currentSection = dbSectionId ? sections.find(s => s.id === dbSectionId) : null;
  const displayLabel = sectionType || sectionId;

  const handleClick = (e: React.MouseEvent) => {
    if (!editMode) return;
    e.stopPropagation();
    setSelectedSection(sectionId);
    setSelectedSectionType(sectionType || null);
    setSelectedElement('section');
    setSidebarOpen(true);
  };

  const handleMove = async (e: React.MouseEvent, direction: 'up' | 'down') => {
    e.stopPropagation();
    if (dbSectionId) await moveSection(dbSectionId, direction);
  };

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (dbSectionId) await duplicateSection(dbSectionId);
  };

  const handleToggleVisibility = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (dbSectionId) await toggleSectionVisibility(dbSectionId);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    if (dbSectionId) await removeSection(dbSectionId);
  };

  const handleInsertAbove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowInsertPanel(prev => !prev);
  };

  const handleAddSectionAbove = async (template: { id: string; defaultData: Record<string, any>; label: string }) => {
    try {
      const currentPos = currentSection?.position ?? 0;
      await addSection(template.id, { ...template.defaultData }, currentPos);
      toast.success(`Seção "${template.label}" adicionada!`);
      setShowInsertPanel(false);
    } catch {
      toast.error('Erro ao adicionar seção');
    }
  };

  // Build background style
  const bgStyle: React.CSSProperties = {};
  if (style.backgroundType === 'solid' && style.backgroundColor) {
    bgStyle.backgroundColor = style.backgroundColor;
  } else if (style.backgroundType === 'gradient' && style.gradientFrom && style.gradientTo) {
    bgStyle.background = `linear-gradient(${style.gradientAngle || 135}deg, ${style.gradientFrom}, ${style.gradientTo})`;
  } else if (style.backgroundType === 'image') {
    // handled below with overlay
  } else {
    bgStyle.backgroundColor = 'hsl(var(--background))';
  }

  const isSelected = editMode && selectedSection === sectionId;
  const isHidden = currentSection && !currentSection.is_visible;

  const customTemplates = getCustomTemplates();
  const builtInTemplates = getAllTemplates().filter(t => t.builtIn);

  return (
    <div
      onClick={handleClick}
      className={`relative group/section ${className} ${
        editMode
          ? `cursor-pointer transition-all duration-200 ${
              isSelected
                ? 'ring-2 ring-emerald-400/60 ring-offset-2 ring-offset-transparent'
                : 'hover:ring-1 hover:ring-white/20'
            } ${isHidden ? 'opacity-40' : ''}`
          : ''
      }`}
      style={bgStyle}
    >
      {/* Background image overlay */}
      {style.backgroundType === 'image' && style.backgroundImage && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center z-0"
            style={{ backgroundImage: `url(${style.backgroundImage})` }}
          />
          <div
            className="absolute inset-0 z-0"
            style={{ backgroundColor: `rgba(0,0,0,${(style.backgroundOverlayOpacity ?? 50) / 100})` }}
          />
        </>
      )}

      {/* Insert section above - "+" button at the top center */}
      {editMode && dbSectionId && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-[60]">
          <button
            onClick={handleInsertAbove}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all shadow-lg ${
              showInsertPanel
                ? 'bg-emerald-500 text-white rotate-45 scale-110'
                : 'bg-gray-800/80 backdrop-blur-md text-white/60 hover:bg-emerald-500 hover:text-white opacity-0 group-hover/section:opacity-100'
            }`}
            title="Inserir seção acima"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Insert panel - appears above the section */}
      {editMode && showInsertPanel && (
        <div className="absolute top-0 left-0 right-0 z-[55] -translate-y-full" onClick={e => e.stopPropagation()}>
          <div className="mx-auto max-w-3xl p-4 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl mb-2">
            <p className="text-xs text-white/50 font-bold mb-3 uppercase tracking-wider text-center">
              Adicionar seção aqui
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-3">
              {customTemplates.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleAddSectionAbove(t)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-400/50 hover:bg-emerald-400/10 transition-all group/btn"
                >
                  <t.icon className="w-5 h-5 text-white/50 group-hover/btn:text-emerald-400 transition-colors" />
                  <span className="text-[9px] font-bold text-white/70 group-hover/btn:text-white text-center leading-tight">{t.label}</span>
                </button>
              ))}
            </div>
            <details className="group/details">
              <summary className="text-[10px] text-white/30 cursor-pointer hover:text-white/50 text-center">
                Seções do sistema ▾
              </summary>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-2">
                {builtInTemplates.map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleAddSectionAbove(t)}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/25 hover:bg-white/10 transition-all group/btn"
                  >
                    <t.icon className="w-4 h-4 text-white/40 group-hover/btn:text-white/70 transition-colors" />
                    <span className="text-[8px] font-bold text-white/50 group-hover/btn:text-white/70 text-center leading-tight">{t.label}</span>
                  </button>
                ))}
              </div>
            </details>
          </div>
        </div>
      )}

      {/* Section controls in edit mode - CENTERED */}
      {editMode && (
        <>
          {/* Section label - top left */}
          <div className={`absolute top-2 left-2 z-50 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-opacity ${
            isSelected ? 'bg-emerald-500 text-white opacity-100' : 'bg-black/40 backdrop-blur-sm text-white/50 opacity-0 group-hover/section:opacity-100'
          }`}>
            {displayLabel}
          </div>

          {/* Action bar - bottom center to avoid overlapping blank section elements */}
          {dbSectionId && (
            <div className={`absolute left-1/2 -translate-x-1/2 bottom-2 z-50 transition-opacity ${
              isSelected ? 'opacity-100' : 'opacity-0 group-hover/section:opacity-100'
            }`}>
              <div className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-black/60 backdrop-blur-xl border border-white/15 shadow-2xl">
                <button
                  onClick={(e) => handleMove(e, 'up')}
                  className="w-8 h-8 rounded-lg hover:bg-white/15 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                  title="Mover para cima"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => handleMove(e, 'down')}
                  className="w-8 h-8 rounded-lg hover:bg-white/15 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                  title="Mover para baixo"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>

                <div className="w-px h-5 bg-white/15 mx-1" />

                <button
                  onClick={handleToggleVisibility}
                  className="w-8 h-8 rounded-lg hover:bg-white/15 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                  title={isHidden ? 'Mostrar seção' : 'Ocultar seção'}
                >
                  {isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleDuplicate}
                  className="w-8 h-8 rounded-lg hover:bg-white/15 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                  title="Duplicar seção"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDelete}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    confirmDelete
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'hover:bg-red-500/20 text-white/70 hover:text-red-400'
                  }`}
                  title={confirmDelete ? 'Clique novamente para confirmar' : 'Excluir seção'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default EditableSection;
