import React from 'react';
import { Save, Undo2, X, Loader2, PanelRightOpen, PanelRightClose } from 'lucide-react';
import { useInlineEdit } from '@/contexts/InlineEditContext';

const EditModeBar = () => {
  const { editMode, saveAll, discardAll, exitEditMode, saving, pendingChanges, sidebarOpen, setSidebarOpen } = useInlineEdit();

  if (!editMode) return null;

  const hasChanges = Object.keys(pendingChanges).length > 0;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9998] flex items-center justify-between px-6 py-3 bg-zinc-900/95 backdrop-blur-xl border-b border-white/10 shadow-2xl">
      <div className="flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-sm font-bold text-white">Modo Edição Ativo</span>
        {hasChanges && (
          <span className="text-xs font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
            {Object.keys(pendingChanges).length} alterações
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white/60 hover:text-white hover:bg-white/10 transition-all"
          title={sidebarOpen ? 'Fechar painel' : 'Abrir painel'}
        >
          {sidebarOpen ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
          Painel
        </button>

        <button
          onClick={discardAll}
          disabled={!hasChanges || saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white/60 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30"
        >
          <Undo2 className="w-3.5 h-3.5" />
          Descartar
        </button>

        <button
          onClick={saveAll}
          disabled={!hasChanges || saving}
          className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-all disabled:opacity-50 shadow-lg"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Salvar Tudo
        </button>

        <button
          onClick={exitEditMode}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <X className="w-3.5 h-3.5" />
          Sair
        </button>
      </div>
    </div>
  );
};

export default EditModeBar;
