import React from 'react';
import {
  LayoutDashboard, Activity, FileText,
  LogOut, ChevronLeft, ChevronRight, MessageCircle, Settings, Columns3, Users, PenTool, Code, Bot,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSiteContent } from '@/contexts/SiteContentContext';

interface AdminSidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  
  { id: 'blog', label: 'Blog', icon: FileText },
  { id: 'chat', label: 'Chat', icon: MessageCircle },
  { id: 'agent', label: 'Agente IA', icon: Bot },
  { id: 'kanban', label: 'Kanban', icon: Columns3 },
  { id: 'clients', label: 'Clientes', icon: Users },
  { id: 'tracking', label: 'Rastreamento', icon: Code },
  { id: 'settings', label: 'Configurações', icon: Settings },
  { id: 'metrics', label: 'Métricas', icon: Activity },
];

const AdminSidebar = ({ activePage, onPageChange, collapsed, onToggleCollapse }: AdminSidebarProps) => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { content } = useSiteContent();
  const gradient = 'linear-gradient(135deg, #5766fe, #820dd1)';

  return (
    <aside
      className={`fixed left-0 top-0 h-screen z-50 flex flex-col transition-all duration-300 border-r border-foreground/5 ${
        collapsed ? 'w-[72px]' : 'w-[260px]'
      }`}
      style={{ background: 'linear-gradient(180deg, hsl(240 20% 6%), hsl(240 15% 4%))' }}
    >
      {/* Logo */}
      <div className="flex items-center justify-center px-5 py-6 border-b border-foreground/5">
        {collapsed ? (
          <img src={content.branding.faviconUrl || content.branding.logoUrl} alt="Logo" className="w-8 h-8 object-contain flex-shrink-0" />
        ) : (
          <img src={content.branding.logoUrl} alt="Logo" className="h-10 w-auto max-w-[180px] object-contain flex-shrink-0" />
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 hide-scrollbar">
        {!collapsed && (
          <p className="text-[10px] font-black text-white/25 uppercase tracking-[0.2em] px-2 mb-3">Menu</p>
        )}
        {MENU_ITEMS.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                collapsed ? 'justify-center px-0 py-3' : 'px-4 py-3'
              } ${
                isActive
                  ? 'text-white shadow-lg'
                  : 'text-white/40 hover:text-white/80 hover:bg-white/5'
              }`}
              style={isActive ? { background: gradient } : undefined}
            >
              <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-white' : ''}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-foreground/5 p-3 space-y-1">
        {/* Editar Site Visualmente */}
        <button
          onClick={() => navigate('/?edit=true')}
          title={collapsed ? 'Editar Site' : undefined}
          className={`w-full flex items-center gap-3 rounded-xl text-sm font-semibold transition-all ${
            collapsed ? 'justify-center px-0 py-3' : 'px-4 py-3'
          } text-emerald-400 hover:bg-emerald-500/10`}
        >
          <PenTool className="w-[18px] h-[18px] flex-shrink-0" />
          {!collapsed && <span>Editar Site</span>}
        </button>

        <button
          onClick={() => navigate('/')}
          title={collapsed ? 'Voltar ao site' : undefined}
          className={`w-full flex items-center gap-3 rounded-xl text-sm font-semibold text-white/40 hover:text-white/80 hover:bg-white/5 transition-all ${
            collapsed ? 'justify-center px-0 py-3' : 'px-4 py-3'
          }`}
        >
          <LayoutDashboard className="w-[18px] h-[18px] flex-shrink-0" />
          {!collapsed && <span>Voltar ao site</span>}
        </button>

        <button
          onClick={async () => { await signOut(); navigate('/'); }}
          title={collapsed ? 'Sair' : undefined}
          className={`w-full flex items-center gap-3 rounded-xl text-sm font-semibold text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all ${
            collapsed ? 'justify-center px-0 py-3' : 'px-4 py-3'
          }`}
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>

        {!collapsed && user && (
          <div className="px-4 py-3 mt-2 rounded-xl bg-white/5">
            <p className="text-xs font-bold text-white/60 truncate">{user.email}</p>
            <p className="text-[10px] text-white/30 font-semibold mt-0.5">Administrador</p>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white/10 border border-foreground/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/20 transition-all"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
};

export default AdminSidebar;
