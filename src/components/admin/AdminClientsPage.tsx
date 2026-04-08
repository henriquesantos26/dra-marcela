import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, RefreshCw, Loader2, User, Phone, Mail,
  Trophy, XCircle, Clock, Archive, MessageCircle,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ClientDetailPage from './ClientDetailPage';

interface Client {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  status: string;
  source: string;
  conversation_id: string | null;
  kanban_entered_at: string | null;
  created_at: string;
  updated_at: string;
}

type StatusFilter = 'all' | 'won' | 'lost' | 'follow_up' | 'archived';

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  won: { label: 'Ganho', icon: Trophy, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  lost: { label: 'Perdido', icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
  follow_up: { label: 'Follow Up', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  archived: { label: 'Arquivado', icon: Archive, color: 'text-muted-foreground', bg: 'bg-secondary' },
};

const FILTERS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'won', label: 'Ganhos' },
  { id: 'lost', label: 'Perdidos' },
  { id: 'follow_up', label: 'Follow Up' },
  { id: 'archived', label: 'Arquivados' },
];

const AdminClientsPage = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
    setClients((data || []) as Client[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const filtered = clients.filter(c => {
    if (filter !== 'all' && c.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return c.name.toLowerCase().includes(q) || (c.phone || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q);
    }
    return true;
  });

  // Detail view
  if (selectedId) {
    return <ClientDetailPage clientId={selectedId} onBack={() => { setSelectedId(null); fetchClients(); }} />;
  }

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-foreground">Clientes</h3>
          <p className="text-sm text-muted-foreground">{clients.length} clientes no total</p>
        </div>
        <button onClick={fetchClients} className="p-2.5 rounded-xl bg-secondary text-muted-foreground hover:text-foreground transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome, telefone ou email..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
        </div>
        <div className="flex gap-1.5">
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${filter === f.id ? 'text-white shadow-lg' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
              style={filter === f.id ? { background: 'linear-gradient(135deg, #5766fe, #820dd1)' } : undefined}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Client list */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-border">
          <User className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-lg font-black text-foreground mb-1">Nenhum cliente encontrado</p>
          <p className="text-sm text-muted-foreground">
            {filter !== 'all' ? 'Tente mudar o filtro.' : 'Clientes aparecerão aqui quando saírem do Kanban.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(client => {
            const cfg = STATUS_CONFIG[client.status] || STATUS_CONFIG.archived;
            const Icon = cfg.icon;
            return (
              <div
                key={client.id}
                onClick={() => setSelectedId(client.id)}
                className="bg-card rounded-2xl border border-border p-4 flex items-center gap-4 group hover:border-foreground/20 transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground truncate">{client.name}</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.bg} ${cfg.color}`}>
                      <Icon className="w-3 h-3" /> {cfg.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1">
                    {client.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {client.phone}</span>}
                    {client.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {client.email}</span>}
                    <span>{new Date(client.created_at).toLocaleDateString('pt-BR')}</span>
                    {client.conversation_id && <span className="flex items-center gap-1 text-purple-500 font-bold"><MessageCircle className="w-3 h-3" /> Chat</span>}
                  </div>
                  {client.notes && <p className="text-[11px] text-muted-foreground/60 mt-1 truncate italic">{client.notes}</p>}
                </div>
                <div className="text-muted-foreground/30 group-hover:text-muted-foreground transition-colors">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const ArrowRight = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

export default AdminClientsPage;
