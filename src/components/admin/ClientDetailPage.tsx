import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft, Save, User, Phone, Mail, StickyNote, Trophy, XCircle, Clock, Archive,
  RotateCcw, Loader2, Globe, Tag, MessageCircle, Calendar, History, MapPin, Building,
  Briefcase, FileText,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
  updated_at: string;
}

interface HistoryEntry {
  id: string;
  field_changed: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  won: { label: 'Ganho', icon: Trophy, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  lost: { label: 'Perdido', icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
  follow_up: { label: 'Follow Up', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  archived: { label: 'Arquivado', icon: Archive, color: 'text-muted-foreground', bg: 'bg-secondary' },
};

const FIELD_LABELS: Record<string, string> = {
  name: 'Nome', phone: 'Telefone', email: 'Email', notes: 'Observações',
  status: 'Status', company: 'Empresa', role: 'Cargo', address: 'Endereço',
};

interface Props {
  clientId: string;
  onBack: () => void;
}

const ClientDetailPage = ({ clientId, onBack }: Props) => {
  const [client, setClient] = useState<Client | null>(null);
  const [draft, setDraft] = useState<Client | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const fetchClient = useCallback(async () => {
    setLoading(true);
    const [{ data: clientData }, { data: historyData }] = await Promise.all([
      supabase.from('clients').select('*').eq('id', clientId).single(),
      supabase.from('client_history').select('*').eq('client_id', clientId).order('created_at', { ascending: false }),
    ]);
    if (clientData) {
      setClient(clientData as Client);
      setDraft(clientData as Client);
    }
    setHistory((historyData || []) as HistoryEntry[]);
    setLoading(false);
  }, [clientId]);

  useEffect(() => { fetchClient(); }, [fetchClient]);

  const handleSave = async () => {
    if (!draft || !client) return;
    setSaving(true);

    // Track changes for history
    const changes: { field: string; old_val: string | null; new_val: string | null }[] = [];
    const trackFields = ['name', 'phone', 'email', 'notes', 'status'] as const;
    for (const f of trackFields) {
      if ((draft[f] || '') !== (client[f] || '')) {
        changes.push({ field: f, old_val: client[f] || null, new_val: draft[f] || null });
      }
    }

    await supabase.from('clients').update({
      name: draft.name,
      phone: draft.phone || null,
      email: draft.email || null,
      notes: draft.notes || null,
      status: draft.status,
    }).eq('id', client.id);

    // Insert history entries
    if (changes.length > 0) {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('client_history').insert(
        changes.map(c => ({
          client_id: client.id,
          field_changed: c.field,
          old_value: c.old_val,
          new_value: c.new_val,
          changed_by: user?.id || null,
        }))
      );
    }

    setSaving(false);
    fetchClient();
  };

  const handleRestore = async () => {
    if (!client) return;
    setRestoring(true);
    const { data: leadCol } = await supabase
      .from('kanban_columns').select('id').eq('is_fixed', true).limit(1).single();
    if (!leadCol) { alert('Coluna "Lead" não encontrada!'); setRestoring(false); return; }

    await supabase.from('kanban_leads').insert({
      name: client.name, phone: client.phone, email: client.email,
      notes: client.notes, column_id: leadCol.id,
      conversation_id: client.conversation_id, source: client.source,
      utm_source: client.utm_source, utm_medium: client.utm_medium, utm_campaign: client.utm_campaign,
    });
    await supabase.from('clients').delete().eq('id', client.id);
    setRestoring(false);
    onBack();
  };

  if (loading || !draft) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;
  }

  const cfg = STATUS_CONFIG[draft.status] || STATUS_CONFIG.archived;
  const StatusIcon = cfg.icon;
  const hasChanges = JSON.stringify(draft) !== JSON.stringify(client);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h3 className="text-xl font-black text-foreground">{draft.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.bg} ${cfg.color}`}>
                <StatusIcon className="w-3 h-3" /> {cfg.label}
              </span>
              <span className="text-[10px] text-muted-foreground">
                Criado em {new Date(draft.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleRestore}
            disabled={restoring}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border bg-blue-500/10 border-blue-500/30 text-blue-500 hover:bg-blue-500/20 disabled:opacity-50"
          >
            {restoring ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
            Restaurar ao Kanban
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg disabled:opacity-50 transition-all hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #5766fe, #820dd1)' }}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact info */}
          <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <h4 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4" /> Informações de Contato
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Nome</label>
                <input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Telefone</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input value={draft.phone || ''} onChange={e => setDraft({ ...draft, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input value={draft.email || ''} onChange={e => setDraft({ ...draft, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Status</label>
                <select value={draft.status} onChange={e => setDraft({ ...draft, status: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                  <option value="won">Ganho</option>
                  <option value="lost">Perdido</option>
                  <option value="follow_up">Follow Up</option>
                  <option value="archived">Arquivado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <h4 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4" /> Observações
            </h4>
            <textarea value={draft.notes || ''} onChange={e => setDraft({ ...draft, notes: e.target.value })} rows={5}
              placeholder="Adicione observações sobre este cliente..."
              className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none" />
          </div>

          {/* History */}
          <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <h4 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4" /> Histórico de Alterações
            </h4>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Nenhuma alteração registrada.</p>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {history.map((h) => (
                  <div key={h.id} className="flex gap-3 items-start">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">
                        <span className="font-bold">{FIELD_LABELS[h.field_changed] || h.field_changed}</span>
                        {' alterado de '}
                        <span className="text-muted-foreground line-through">{h.old_value || '(vazio)'}</span>
                        {' para '}
                        <span className="font-bold text-primary">{h.new_value || '(vazio)'}</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {new Date(h.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* UTM / Metrics */}
          <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <h4 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4" /> Dados de Entrada
            </h4>
            <div className="space-y-3">
              <InfoRow icon={Tag} label="Origem (Source)" value={client?.utm_source} />
              <InfoRow icon={Globe} label="Meio (Medium)" value={client?.utm_medium} />
              <InfoRow icon={Briefcase} label="Campanha" value={client?.utm_campaign} />
              <InfoRow icon={MessageCircle} label="Fonte" value={client?.source === 'chat' ? 'Chat' : 'Manual'} />
              {client?.conversation_id && (
                <InfoRow icon={MessageCircle} label="Conversa" value={client.conversation_id.slice(0, 8) + '...'} highlight />
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <h4 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Datas
            </h4>
            <div className="space-y-3">
              <InfoRow icon={Calendar} label="Entrou no Kanban" value={client?.kanban_entered_at ? new Date(client.kanban_entered_at).toLocaleDateString('pt-BR') : null} />
              <InfoRow icon={Calendar} label="Virou Cliente" value={new Date(client!.created_at).toLocaleDateString('pt-BR')} />
              <InfoRow icon={Calendar} label="Última Atualização" value={new Date(client!.updated_at).toLocaleString('pt-BR')} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ icon: Icon, label, value, highlight }: { icon: React.ElementType; label: string; value?: string | null; highlight?: boolean }) => (
  <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
    <span className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
      <Icon className="w-3.5 h-3.5" /> {label}
    </span>
    <span className={`text-xs font-bold ${highlight ? 'text-purple-500' : value ? 'text-foreground' : 'text-muted-foreground/40'}`}>
      {value || '—'}
    </span>
  </div>
);

export default ClientDetailPage;
