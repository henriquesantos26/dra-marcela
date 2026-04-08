import React, { useState, useEffect } from 'react';
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
};

const AdminPage = () => {
  const { saving } = useSiteContent();
  const [activePage, setActivePage] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('admin-theme') !== 'light');

  useEffect(() => {
    localStorage.setItem('admin-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <div className={`min-h-screen bg-background flex ${darkMode ? 'dark' : ''}`}>
      <AdminSidebar
        activePage={activePage}
        onPageChange={setActivePage}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />

      <div className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-[72px]' : 'ml-[260px]'}`}>
        <AdminHeader
          sectionLabel={PAGE_LABELS[activePage] || activePage}
          saving={saving}
          saved={false}
          onSave={() => {}}
          hideSave
          darkMode={darkMode}
          onToggleTheme={() => setDarkMode(prev => !prev)}
        />

        <main className="p-8 max-w-6xl">
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
          ) : null}
        </main>
      </div>
    </div>
  );
};

export default AdminPage;
