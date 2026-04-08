import React from 'react';
import { Save, Sun, Moon } from 'lucide-react';

interface AdminHeaderProps {
  sectionLabel: string;
  saving: boolean;
  saved: boolean;
  onSave: () => void;
  hideSave?: boolean;
  darkMode?: boolean;
  onToggleTheme?: () => void;
}

const AdminHeader = ({ sectionLabel, saving, saved, onSave, hideSave, darkMode, onToggleTheme }: AdminHeaderProps) => {
  const gradient = 'linear-gradient(135deg, #5766fe, #820dd1)';

  return (
    <header className="sticky top-0 z-40 h-16 flex items-center justify-between px-8 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div>
        <h2 className="text-lg font-black text-foreground tracking-tight">{sectionLabel}</h2>
        <p className="text-xs text-muted-foreground font-medium">Layout do Site</p>
      </div>

      <div className="flex items-center gap-3">
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title={darkMode ? 'Modo claro' : 'Modo escuro'}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        )}

      {!hideSave && (
        <button
          onClick={onSave}
          disabled={saving}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] ${
            saved ? 'bg-emerald-500' : saving ? 'opacity-60 cursor-wait' : ''
          }`}
          style={!saved ? { background: gradient } : undefined}
        >
          <Save className="w-4 h-4" />
          {saved ? 'Salvo!' : saving ? 'Salvando...' : 'Salvar alterações'}
        </button>
      )}
      </div>
    </header>
  );
};

export default AdminHeader;
