/**
 * @system DO NOT EDIT - Core system file
 * @description Panel to add new sections to the page
 * @module system
 */
import React from 'react';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { getCustomTemplates, getAllTemplates } from '@/components/sections/sectionRegistry';
import { toast } from 'sonner';

const AddSectionPanel = () => {
  const { addSection } = useSiteContent();
  const customTemplates = getCustomTemplates();
  const allTemplates = getAllTemplates();

  const handleAddSection = async (template: ReturnType<typeof getCustomTemplates>[0]) => {
    try {
      await addSection(template.id, { ...template.defaultData });
      toast.success(`Seção "${template.label}" adicionada!`);
    } catch {
      toast.error('Erro ao adicionar seção');
    }
  };

  return (
    <div className="space-y-6">
      {/* Custom templates - fully functional */}
      <div>
        <p className="text-xs text-white/50 font-bold mb-3 uppercase tracking-wider">
          Adicionar nova seção
        </p>
        <div className="grid grid-cols-2 gap-3">
          {customTemplates.map(t => (
            <button
              key={t.id}
              onClick={() => handleAddSection(t)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-400/50 hover:bg-emerald-400/10 transition-all cursor-pointer group"
            >
              <t.icon className="w-6 h-6 text-white/60 group-hover:text-emerald-400 transition-colors" />
              <span className="text-xs font-bold text-white/80 group-hover:text-white transition-colors">{t.label}</span>
              <span className="text-[10px] text-white/40 text-center leading-tight">{t.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Built-in templates - can re-add if removed */}
      <div>
        <p className="text-xs text-white/50 font-bold mb-3 uppercase tracking-wider">
          Seções do sistema
        </p>
        <p className="text-[10px] text-white/30 mb-3">
          Estas seções usam os dados do conteúdo do site. Adicione novamente se foram removidas.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {allTemplates.filter(t => t.builtIn).map(t => (
            <button
              key={t.id}
              onClick={() => handleAddSection(t)}
              className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/25 hover:bg-white/10 transition-all cursor-pointer text-left"
            >
              <t.icon className="w-4 h-4 text-white/40 flex-shrink-0" />
              <div>
                <span className="text-[11px] font-bold text-white/70 block">{t.label}</span>
                <span className="text-[9px] text-white/30">{t.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddSectionPanel;
