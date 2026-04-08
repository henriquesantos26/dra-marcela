import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus, Trash2, Edit2, Save, X, GripVertical, Phone, Mail,
  MessageCircle, Loader2, User, MoreHorizontal, ChevronRight,
  Trophy, XCircle, Clock, Archive,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface KanbanColumn {
  id: string;
  name: string;
  position: number;
  is_fixed: boolean;
  color: string;
}

interface KanbanLead {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  column_id: string;
  position: number;
  conversation_id: string | null;
  source: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
  updated_at: string;
}

const DESTINATION_OPTIONS = [
  { status: 'won', label: 'Ganho', icon: Trophy, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { status: 'lost', label: 'Perdido', icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
  { status: 'follow_up', label: 'Follow Up', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { status: 'archived', label: 'Arquivado', icon: Archive, color: 'text-muted-foreground', bg: 'bg-secondary' },
];

const COLORS = ['#5766fe', '#820dd1', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#8b5cf6'];

const AdminKanbanPage = () => {
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [leads, setLeads] = useState<KanbanLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [editingColumnName, setEditingColumnName] = useState('');
  const [editingLead, setEditingLead] = useState<KanbanLead | null>(null);
  const [isNewLead, setIsNewLead] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [newColumnName, setNewColumnName] = useState('');
  const [showNewColumn, setShowNewColumn] = useState(false);
  const [destinationMenu, setDestinationMenu] = useState<string | null>(null);
  const fetchData = useCallback(async () => {
    setLoading(true);
    const [{ data: cols }, { data: lds }] = await Promise.all([
      supabase.from('kanban_columns').select('*').order('position'),
      supabase.from('kanban_leads').select('*').order('position'),
    ]);
    setColumns((cols || []) as KanbanColumn[]);
    setLeads((lds || []) as KanbanLead[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Column CRUD
  const addColumn = async () => {
    if (!newColumnName.trim()) return;
    const maxPos = columns.reduce((max, c) => Math.max(max, c.position), 0);
    await supabase.from('kanban_columns').insert({
      name: newColumnName.trim(),
      position: maxPos + 1,
      color: COLORS[columns.length % COLORS.length],
    });
    setNewColumnName('');
    setShowNewColumn(false);
    fetchData();
  };

  const updateColumn = async (id: string) => {
    if (!editingColumnName.trim()) return;
    await supabase.from('kanban_columns').update({ name: editingColumnName.trim() }).eq('id', id);
    setEditingColumn(null);
    fetchData();
  };

  const deleteColumn = async (id: string) => {
    if (!confirm('Excluir esta coluna e todos os leads nela?')) return;
    await supabase.from('kanban_columns').delete().eq('id', id);
    fetchData();
  };

  const updateColumnColor = async (id: string, color: string) => {
    await supabase.from('kanban_columns').update({ color }).eq('id', id);
    setColumns(prev => prev.map(c => c.id === id ? { ...c, color } : c));
  };

  // Lead CRUD
  const openNewLead = (columnId: string) => {
    setIsNewLead(true);
    setEditingLead({
      id: '', name: '', phone: '', email: '', notes: '',
      column_id: columnId, position: 0, conversation_id: null,
      source: 'manual', utm_source: null, utm_medium: null, utm_campaign: null,
      created_at: '', updated_at: '',
    });
  };

  const saveLead = async () => {
    if (!editingLead || !editingLead.name.trim()) return;
    const payload = {
      name: editingLead.name, phone: editingLead.phone || null,
      email: editingLead.email || null, notes: editingLead.notes || null,
      column_id: editingLead.column_id, source: editingLead.source,
    };
    if (isNewLead) {
      await supabase.from('kanban_leads').insert(payload);
    } else {
      await supabase.from('kanban_leads').update(payload).eq('id', editingLead.id);
    }
    setEditingLead(null);
    setIsNewLead(false);
    fetchData();
  };

  const deleteLead = async (id: string) => {
    if (!confirm('Excluir este lead?')) return;
    await supabase.from('kanban_leads').delete().eq('id', id);
    fetchData();
  };

  // Move lead to clients table with a final status
  const moveToClients = async (lead: KanbanLead, status: string) => {
    // Optimistic removal
    setLeads(prev => prev.filter(l => l.id !== lead.id));
    setDestinationMenu(null);

    await supabase.from('clients').insert({
      name: lead.name,
      phone: lead.phone || null,
      email: lead.email || null,
      notes: lead.notes || null,
      status,
      source: lead.source,
      conversation_id: lead.conversation_id || null,
      kanban_entered_at: lead.created_at,
      utm_source: lead.utm_source || null,
      utm_medium: lead.utm_medium || null,
      utm_campaign: lead.utm_campaign || null,
    });

    await supabase.from('kanban_leads').delete().eq('id', lead.id);
  };

  // Drag & Drop
  const handleDragStart = (leadId: string) => {
    setDragging(leadId);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverCol(columnId);
  };

  const handleDrop = async (columnId: string) => {
    if (!dragging) return;
    // Optimistic update — no full reload
    setLeads(prev => prev.map(l => l.id === dragging ? { ...l, column_id: columnId } : l));
    setDragging(null);
    setDragOverCol(null);
    await supabase.from('kanban_leads').update({ column_id: columnId }).eq('id', dragging);
  };

  const handleDragEnd = () => {
    setDragging(null);
    setDragOverCol(null);
  };

  const getLeadsForColumn = (columnId: string) =>
    leads.filter(l => l.column_id === columnId).sort((a, b) => a.position - b.position);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-foreground">Kanban de Leads</h3>
          <p className="text-sm text-muted-foreground">{leads.length} leads no total</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => openNewLead(columns[0]?.id || '')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary text-foreground font-bold text-sm hover:bg-secondary/80 transition-all border border-border"
          >
            <Plus className="w-4 h-4" /> Novo Lead
          </button>
          <button
            onClick={() => setShowNewColumn(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg hover:scale-[1.02] transition-transform"
            style={{ background: 'linear-gradient(135deg, #5766fe, #820dd1)' }}
          >
            <Plus className="w-4 h-4" /> Nova Coluna
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-6 hide-scrollbar" style={{ minHeight: 'calc(100vh - 240px)' }}>
        {columns.map((col) => {
          const colLeads = getLeadsForColumn(col.id);
          const isOver = dragOverCol === col.id;

          return (
            <div
              key={col.id}
              className={`flex-shrink-0 w-[300px] rounded-2xl border flex flex-col transition-all ${
                isOver ? 'border-primary/50 bg-primary/5' : 'border-border bg-card'
              }`}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDrop={() => handleDrop(col.id)}
              onDragLeave={() => setDragOverCol(null)}
            >
              {/* Column Header */}
              <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: col.color }} />

                {editingColumn === col.id ? (
                  <div className="flex items-center gap-1 flex-1">
                    <input
                      value={editingColumnName}
                      onChange={(e) => setEditingColumnName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && updateColumn(col.id)}
                      className="flex-1 px-2 py-1 rounded-lg bg-secondary border border-border text-foreground text-sm font-bold focus:outline-none"
                      autoFocus
                    />
                    <button onClick={() => updateColumn(col.id)} className="p-1 text-emerald-500"><Save className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setEditingColumn(null)} className="p-1 text-muted-foreground"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ) : (
                  <>
                    <span className="text-sm font-black text-foreground flex-1 truncate">{col.name}</span>
                    <span className="text-[10px] font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{colLeads.length}</span>
                    {!col.is_fixed && (
                      <div className="flex gap-0.5">
                        <button
                          onClick={() => { setEditingColumn(col.id); setEditingColumnName(col.name); }}
                          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteColumn(col.id)}
                          className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Color picker for non-fixed columns */}
              {editingColumn === col.id && !col.is_fixed && (
                <div className="px-4 py-2 border-b border-border flex gap-1.5 flex-wrap">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => updateColumnColor(col.id, c)}
                      className={`w-5 h-5 rounded-full border-2 transition-all ${col.color === c ? 'border-foreground scale-125' : 'border-transparent'}`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              )}

              {/* Cards */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2 hide-scrollbar">
                {colLeads.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={() => handleDragStart(lead.id)}
                    onDragEnd={handleDragEnd}
                    className={`rounded-xl border border-border bg-background p-3 cursor-grab active:cursor-grabbing transition-all hover:border-foreground/20 hover:shadow-md group ${
                      dragging === lead.id ? 'opacity-40 scale-95' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground leading-tight">{lead.name}</p>
                          <p className="text-[10px] text-muted-foreground capitalize">{lead.source === 'chat' ? '💬 Via Chat' : '✏️ Manual'}</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity relative">
                        <button onClick={() => { setEditingLead(lead); setIsNewLead(false); }} className="p-1 text-muted-foreground hover:text-foreground">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDestinationMenu(destinationMenu === lead.id ? null : lead.id)} className="p-1 text-muted-foreground hover:text-foreground">
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deleteLead(lead.id)} className="p-1 text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Destination dropdown */}
                        {destinationMenu === lead.id && (
                          <div className="absolute right-0 top-7 z-50 w-44 bg-card border border-border rounded-xl shadow-2xl py-1.5 animate-in fade-in slide-in-from-top-1">
                            <p className="px-3 py-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-wider">Destino Final</p>
                            {DESTINATION_OPTIONS.map(opt => {
                              const Icon = opt.icon;
                              return (
                                <button
                                  key={opt.status}
                                  onClick={() => moveToClients(lead, opt.status)}
                                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-bold hover:bg-secondary transition-colors ${opt.color}`}
                                >
                                  <Icon className="w-3.5 h-3.5" /> {opt.label}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {lead.phone && (
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1">
                        <Phone className="w-3 h-3" /> {lead.phone}
                      </div>
                    )}
                    {lead.email && (
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1">
                        <Mail className="w-3 h-3" /> {lead.email}
                      </div>
                    )}
                    {lead.notes && (
                      <p className="text-[11px] text-muted-foreground/70 mt-2 line-clamp-2 italic">{lead.notes}</p>
                    )}
                    {lead.conversation_id && (
                      <div className="flex items-center gap-1 text-[10px] text-purple-500 font-bold mt-2">
                        <MessageCircle className="w-3 h-3" /> Conversa vinculada
                      </div>
                    )}
                  </div>
                ))}
              </div>

            </div>
          );
        })}

        {/* New Column inline */}
        {showNewColumn && (
          <div className="flex-shrink-0 w-[300px] rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-4 flex flex-col gap-3">
            <input
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addColumn()}
              placeholder="Nome da coluna..."
              className="px-4 py-3 rounded-xl bg-background border border-border text-foreground text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40"
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={addColumn} className="flex-1 py-2.5 rounded-xl text-white font-bold text-sm" style={{ background: 'linear-gradient(135deg, #5766fe, #820dd1)' }}>
                Criar
              </button>
              <button onClick={() => { setShowNewColumn(false); setNewColumnName(''); }} className="px-4 py-2.5 rounded-xl bg-secondary text-muted-foreground font-bold text-sm">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lead Edit Modal */}
      {editingLead && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { setEditingLead(null); setIsNewLead(false); }}>
          <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-black text-foreground">{isNewLead ? 'Novo Lead' : 'Editar Lead'}</h4>
              <button onClick={() => { setEditingLead(null); setIsNewLead(false); }} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">Nome *</label>
                <input
                  value={editingLead.name}
                  onChange={(e) => setEditingLead({ ...editingLead, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">Telefone</label>
                <input
                  value={editingLead.phone || ''}
                  onChange={(e) => setEditingLead({ ...editingLead, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">Email</label>
                <input
                  value={editingLead.email || ''}
                  onChange={(e) => setEditingLead({ ...editingLead, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">Observações</label>
                <textarea
                  value={editingLead.notes || ''}
                  onChange={(e) => setEditingLead({ ...editingLead, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">Coluna</label>
                <select
                  value={editingLead.column_id}
                  onChange={(e) => setEditingLead({ ...editingLead, column_id: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {columns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => { setEditingLead(null); setIsNewLead(false); }} className="flex-1 py-3 rounded-xl bg-secondary text-muted-foreground font-bold text-sm">
                Cancelar
              </button>
              <button onClick={saveLead} disabled={!editingLead.name.trim()} className="flex-1 py-3 rounded-xl text-white font-bold text-sm disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #5766fe, #820dd1)' }}>
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminKanbanPage;
