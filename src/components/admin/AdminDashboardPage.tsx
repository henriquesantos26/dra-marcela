import React, { useState, useEffect, useCallback } from 'react';
import {
  Loader2, Trophy, XCircle, Clock, Archive, Users,
  TrendingUp, BarChart3, Globe,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Client {
  id: string;
  status: string;
  source: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  won: { label: 'Ganhos', icon: Trophy, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  lost: { label: 'Perdidos', icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
  follow_up: { label: 'Follow Up', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  archived: { label: 'Arquivados', icon: Archive, color: 'text-muted-foreground', bg: 'bg-secondary' },
};

const AdminDashboardPage = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [leads, setLeads] = useState<{ utm_source: string | null; utm_medium: string | null; utm_campaign: string | null }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [{ data: c }, { data: l }] = await Promise.all([
      supabase.from('clients').select('id, status, source, utm_source, utm_medium, utm_campaign, created_at'),
      supabase.from('kanban_leads').select('utm_source, utm_medium, utm_campaign'),
    ]);
    setClients((c || []) as Client[]);
    setLeads((l || []) as any[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const statusCounts = clients.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalClients = clients.length;
  const totalLeads = leads.length;
  const conversionRate = totalClients + totalLeads > 0
    ? Math.round((statusCounts.won || 0) / (totalClients + totalLeads) * 100)
    : 0;

  // UTM source analysis — combine leads + clients
  const allUtmSources = [
    ...clients.map(c => c.utm_source),
    ...leads.map(l => l.utm_source),
  ].filter(Boolean) as string[];

  const utmSourceCounts = allUtmSources.reduce((acc, s) => {
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedSources = Object.entries(utmSourceCounts).sort((a, b) => b[1] - a[1]);
  const maxSourceCount = sortedSources.length > 0 ? sortedSources[0][1] : 1;

  // UTM medium analysis
  const allUtmMediums = [
    ...clients.map(c => c.utm_medium),
    ...leads.map(l => l.utm_medium),
  ].filter(Boolean) as string[];

  const utmMediumCounts = allUtmMediums.reduce((acc, s) => {
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedMediums = Object.entries(utmMediumCounts).sort((a, b) => b[1] - a[1]);
  const maxMediumCount = sortedMediums.length > 0 ? sortedMediums[0][1] : 1;

  // UTM campaign analysis
  const allUtmCampaigns = [
    ...clients.map(c => c.utm_campaign),
    ...leads.map(l => l.utm_campaign),
  ].filter(Boolean) as string[];

  const utmCampaignCounts = allUtmCampaigns.reduce((acc, s) => {
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedCampaigns = Object.entries(utmCampaignCounts).sort((a, b) => b[1] - a[1]);
  const maxCampaignCount = sortedCampaigns.length > 0 ? sortedCampaigns[0][1] : 1;

  // Clients by source (manual vs chat)
  const sourceCounts = clients.reduce((acc, c) => {
    const s = c.source === 'chat' ? 'Chat' : 'Manual';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-black text-foreground">Dashboard</h3>
        <p className="text-sm text-muted-foreground">Visão geral de leads e clientes</p>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <BarChart3 className="w-4.5 h-4.5 text-blue-500" />
            </div>
          </div>
          <p className="text-3xl font-black text-foreground">{totalLeads}</p>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">Leads Ativos</p>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Users className="w-4.5 h-4.5 text-purple-500" />
            </div>
          </div>
          <p className="text-3xl font-black text-foreground">{totalClients}</p>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">Clientes Total</p>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Trophy className="w-4.5 h-4.5 text-emerald-500" />
            </div>
          </div>
          <p className="text-3xl font-black text-foreground">{statusCounts.won || 0}</p>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">Ganhos</p>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <TrendingUp className="w-4.5 h-4.5 text-amber-500" />
            </div>
          </div>
          <p className="text-3xl font-black text-foreground">{conversionRate}%</p>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">Taxa Conversão</p>
        </div>
      </div>

      {/* Status breakdown + Source */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status breakdown */}
        <div className="p-6 rounded-2xl border border-border bg-card">
          <h4 className="text-sm font-black text-foreground uppercase tracking-wider mb-5">Status dos Clientes</h4>
          <div className="space-y-4">
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
              const count = statusCounts[key] || 0;
              const pct = totalClients > 0 ? Math.round(count / totalClients * 100) : 0;
              const Icon = cfg.icon;
              return (
                <div key={key} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-foreground">{cfg.label}</span>
                      <span className="text-sm font-black text-foreground">{count} <span className="text-muted-foreground font-bold text-xs">({pct}%)</span></span>
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: key === 'won' ? '#10b981' : key === 'lost' ? '#ef4444' : key === 'follow_up' ? '#f59e0b' : '#64748b' }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Origem (manual vs chat) */}
        <div className="p-6 rounded-2xl border border-border bg-card">
          <h4 className="text-sm font-black text-foreground uppercase tracking-wider mb-5">Origem dos Clientes</h4>
          {Object.keys(sourceCounts).length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Sem dados ainda</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(sourceCounts).sort((a, b) => b[1] - a[1]).map(([source, count]) => {
                const pct = totalClients > 0 ? Math.round(count / totalClients * 100) : 0;
                return (
                  <div key={source} className="flex items-center gap-3">
                    <span className="text-lg">{source === 'Chat' ? '💬' : '✏️'}</span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-bold text-foreground">{source}</span>
                        <span className="text-sm font-black text-foreground">{count} <span className="text-muted-foreground font-bold text-xs">({pct}%)</span></span>
                      </div>
                      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: source === 'Chat' ? '#8b5cf6' : '#5766fe' }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* UTM Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* UTM Source */}
        <div className="p-6 rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-5">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <h4 className="text-sm font-black text-foreground uppercase tracking-wider">UTM Source</h4>
          </div>
          {sortedSources.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Sem dados UTM</p>
          ) : (
            <div className="space-y-3">
              {sortedSources.slice(0, 8).map(([source, count]) => (
                <div key={source}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-bold text-foreground truncate">{source}</span>
                    <span className="text-xs font-black text-foreground flex-shrink-0">{count}</span>
                  </div>
                  <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(count / maxSourceCount) * 100}%`, background: 'linear-gradient(135deg, #5766fe, #820dd1)' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* UTM Medium */}
        <div className="p-6 rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <h4 className="text-sm font-black text-foreground uppercase tracking-wider">UTM Medium</h4>
          </div>
          {sortedMediums.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Sem dados UTM</p>
          ) : (
            <div className="space-y-3">
              {sortedMediums.slice(0, 8).map(([medium, count]) => (
                <div key={medium}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-bold text-foreground truncate">{medium}</span>
                    <span className="text-xs font-black text-foreground flex-shrink-0">{count}</span>
                  </div>
                  <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(count / maxMediumCount) * 100}%`, background: 'linear-gradient(135deg, #10b981, #06b6d4)' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* UTM Campaign */}
        <div className="p-6 rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <h4 className="text-sm font-black text-foreground uppercase tracking-wider">UTM Campaign</h4>
          </div>
          {sortedCampaigns.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Sem dados UTM</p>
          ) : (
            <div className="space-y-3">
              {sortedCampaigns.slice(0, 8).map(([campaign, count]) => (
                <div key={campaign}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-bold text-foreground truncate">{campaign}</span>
                    <span className="text-xs font-black text-foreground flex-shrink-0">{count}</span>
                  </div>
                  <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(count / maxCampaignCount) * 100}%`, background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
