import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSiteContent } from '@/contexts/SiteContentContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminMetricsPage from '@/components/admin/AdminMetricsPage';
import AdminBlogPage from '@/components/admin/AdminBlogPage';
import AdminChatPage from '@/components/admin/AdminChatPage';
import AdminAgentPage from '@/components/admin/AdminAgentPage';
import AdminKanbanPage from '@/components/admin/AdminKanbanPage';
import AdminClientsPage from '@/components/admin/AdminClientsPage';
import AdminDashboardPage from '@/components/admin/AdminDashboardPage';
import AdminSettingsPage from '@/components/admin/AdminSettingsPage';
import AdminTrackingPage from '@/components/admin/AdminTrackingPage';
import AdminUsersPage from '@/components/admin/AdminUsersPage';

const PAGE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  blog: 'Blog',
  chat: 'Chat',
  agent: 'Agente IA',
  kanban: 'Kanban',
  clients: 'Clientes',
  tracking: 'Rastreamento',
  settings: 'Configurações',
  metrics: 'Métricas',
  users: 'Usuários e Permissões'
};

const AdminPage = () => {
  const { saving } = useSiteContent();
  const { userRole, allowedPages } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activePage = searchParams.get('tab') || 'dashboard';
  
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('admin-theme') !== 'light');

  // Redireciona editor caso tente acessar via URL /tab uma aba bloqueada
  useEffect(() => {
    if (userRole === 'editor') {
      const allowed = ['dashboard', ...allowedPages];
      if (!allowed.includes(activePage)) {
         setSearchParams({ tab: allowed[1] || 'dashboard' }, { replace: true });
      }
    }
  }, [activePage, userRole, allowedPages, setSearchParams]);

  useEffect(() => {
    localStorage.setItem('admin-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const handlePageChange = (page: string) => {
    setSearchParams({ tab: page });
    setMobileOpen(false); // Close mobile menu when navigating
  };

  return (
    <div className={`min-h-screen bg-background flex ${darkMode ? 'dark' : ''}`}>
      <AdminSidebar
        activePage={activePage}
        onPageChange={handlePageChange}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className={`flex-1 transition-all duration-300 w-full ${collapsed ? 'md:ml-[72px]' : 'md:ml-[260px]'}`}>
        <AdminHeader
          sectionLabel={PAGE_LABELS[activePage] || activePage}
          saving={saving}
          saved={false}
          onSave={() => {}}
          hideSave
          darkMode={darkMode}
          onToggleTheme={() => setDarkMode(prev => !prev)}
          onMenuClick={() => setMobileOpen(true)}
        />

        <main className="p-4 md:p-8 max-w-6xl overflow-x-hidden">
          {activePage === 'dashboard' ? (
            <AdminDashboardPage />
          ) : activePage === 'metrics' ? (
            <AdminMetricsPage />
          ) : activePage === 'blog' ? (
            <AdminBlogPage />
          ) : activePage === 'chat' ? (
            <AdminChatPage />
          ) : activePage === 'agent' ? (
            <AdminAgentPage />
          ) : activePage === 'kanban' ? (
            <AdminKanbanPage />
          ) : activePage === 'clients' ? (
            <AdminClientsPage />
          ) : activePage === 'tracking' ? (
            <AdminTrackingPage />
          ) : activePage === 'settings' ? (
            <AdminSettingsPage />
          ) : activePage === 'users' ? (
            <AdminUsersPage />
          ) : null}
        </main>
      </div>
      
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminPage;
