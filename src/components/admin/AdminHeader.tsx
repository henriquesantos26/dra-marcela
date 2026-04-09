import React from 'react';
import { Save, Sun, Moon, Menu } from 'lucide-react';

interface AdminHeaderProps {
  sectionLabel: string;
  saving: boolean;
  saved: boolean;
  onSave: () => void;
  hideSave?: boolean;
  darkMode?: boolean;
  onToggleTheme?: () => void;
  onMenuClick?: () => void;
}

const AdminHeader = ({ sectionLabel, saving, saved, onSave, hideSave, darkMode, onToggleTheme, onMenuClick }: AdminHeaderProps) => {
  const gradient = 'linear-gradient(135deg, #5766fe, #820dd1)';

  return (
    <header className="sticky top-0 z-40 h-16 flex items-center justify-between px-4 md:px-8 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="md:hidden p-1.5 -ml-1 text-muted-foreground hover:text-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          <h2 className="text-lg font-black text-foreground tracking-tight">{sectionLabel}</h2>
          <p className="text-xs text-muted-foreground font-medium hidden sm:block">Layout do Site</p>
        </div>
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
