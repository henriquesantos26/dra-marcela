import React, { useState, useEffect } from 'react';
import {
  MessageCircle, Send, Trash2,
  Loader2, RefreshCw, XCircle, User, Bot, UserCheck, Columns3,
  Settings2, X, Phone, Mail, FileText, Save,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Conversation {
  id: string;
  session_id: string;
  visitor_name: string | null;
  visitor_email: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  created_at: string;
}

const AdminChatPage = () => {
  return <ConversationsTab />;
};

const ConversationsTab = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [clientPanelOpen, setClientPanelOpen] = useState(false);
  const [clientData, setClientData] = useState({ name: '', email: '', phone: '', notes: '' });
  const [savingClient, setSavingClient] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const bottomRef = React.useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('chat_conversations')
      .select('*')
      .order('updated_at', { ascending: false });
    setConversations((data || []) as Conversation[]);
    setLoading(false);
  };

  useEffect(() => { fetchConversations(); }, []);

  const openConversation = async (conv: Conversation) => {
    setSelected(conv);
    setClientData({
      name: conv.visitor_name || '',
      email: conv.visitor_email || '',
      phone: '',
      notes: '',
    });
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conv.id)
      .order('created_at', { ascending: true });
    setMessages((data || []) as Message[]);

    // Load client data if exists
    const { data: clientRow } = await supabase
      .from('clients')
      .select('*')
      .eq('conversation_id', conv.id)
      .limit(1)
      .single();
    if (clientRow) {
      setClientData({
        name: clientRow.name || '',
        email: clientRow.email || '',
        phone: clientRow.phone || '',
        notes: clientRow.notes || '',
      });
    }
  };

  useEffect(() => {
    if (!selected) return;
    const channel = supabase
      .channel(`admin-chat-${selected.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `conversation_id=eq.${selected.id}` },
        (payload) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === (payload.new as Message).id)) return prev;
            return [...prev, payload.new as Message];
          });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selected?.id]);

  useEffect(() => {
    const channel = supabase
      .channel('admin-conv-list')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_conversations' },
        () => { fetchConversations(); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleReply = async () => {
    if (!reply.trim() || !selected || sending) return;
    setSending(true);
    await supabase.from('chat_messages').insert({
      conversation_id: selected.id,
      role: 'admin',
      content: reply.trim(),
    });
    setReply('');
    setSending(false);
  };

  const handleToggleManual = async (conv: Conversation) => {
    const newStatus = conv.status === 'human_handling' ? 'ai_handling' : 'human_handling';
    await supabase.from('chat_conversations').update({ status: newStatus }).eq('id', conv.id);
    if (selected?.id === conv.id) {
      setSelected({ ...conv, status: newStatus });
    }
    fetchConversations();
  };

  const handleCloseConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await supabase.from('chat_conversations').update({ status: 'closed' }).eq('id', id);
    fetchConversations();
    if (selected?.id === id) setSelected(null);
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    // Optimistic update
    setConversations(prev => prev.filter(c => c.id !== id));
    setDeletingId(null);
    if (selected?.id === id) setSelected(null);
    
    const { error } = await supabase.from('chat_conversations').delete().eq('id', id);
    if (error) {
      alert('Erro ao excluir conversa.');
      fetchConversations();
    }
  };

  const handleSaveClient = async () => {
    if (!selected) return;
    setSavingClient(true);

    // Update conversation name/email
    await supabase.from('chat_conversations').update({
      visitor_name: clientData.name || null,
      visitor_email: clientData.email || null,
    }).eq('id', selected.id);

    // Upsert client record
    const { data: existing } = await supabase
      .from('clients')
      .select('id')
      .eq('conversation_id', selected.id)
      .limit(1)
      .single();

    if (existing) {
      await supabase.from('clients').update({
        name: clientData.name,
        email: clientData.email || null,
        phone: clientData.phone || null,
        notes: clientData.notes || null,
      }).eq('id', existing.id);
    } else {
      await supabase.from('clients').insert({
        name: clientData.name || `Visitante ${selected.session_id.slice(0, 6)}`,
        email: clientData.email || null,
        phone: clientData.phone || null,
        notes: clientData.notes || null,
        conversation_id: selected.id,
        source: 'chat',
      });
    }

    setSelected({ ...selected, visitor_name: clientData.name, visitor_email: clientData.email });
    setSavingClient(false);
    fetchConversations();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'human_handling':
        return <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500"><UserCheck className="w-3 h-3" /> Manual</span>;
      case 'closed':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground">Fechada</span>;
      default:
        return <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-500"><Bot className="w-3 h-3" /> IA</span>;
    }
  };

  return (
    <div className="flex rounded-2xl border border-border overflow-hidden bg-card" style={{ height: 'calc(100vh - 260px)', minHeight: '500px' }}>
      {/* LEFT PANEL - Conversation List */}
      <div className="w-80 flex-shrink-0 border-r border-border flex flex-col bg-secondary/30">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Conversas</h3>
          <button onClick={fetchConversations} className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-16 px-4">
              <MessageCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-bold text-muted-foreground">Nenhuma conversa</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => openConversation(conv)}
                className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors border-b border-border/50 ${
                  selected?.id === conv.id ? 'bg-primary/10 border-l-2 border-l-primary' : 'hover:bg-secondary/80'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-foreground truncate">
                      {conv.visitor_name || `Visitante ${conv.session_id.slice(0, 6)}`}
                    </p>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">
                      {new Date(conv.updated_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    {getStatusBadge(conv.status)}
                    <div className="flex gap-0.5">
                      <button onClick={(e) => handleCloseConversation(conv.id, e)} className="p-1 rounded hover:bg-secondary text-muted-foreground/50 hover:text-muted-foreground" title="Fechar">
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setDeletingId(conv.id); }} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground/50 hover:text-destructive" title="Excluir">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CENTER PANEL - Chat View */}
      <div className="flex-1 flex flex-col min-w-0">
        {!selected ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
              <MessageCircle className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-black text-foreground mb-2">Selecione uma conversa</h3>
            <p className="text-sm text-muted-foreground max-w-xs">Clique em uma conversa ao lado para visualizar e responder as mensagens.</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="px-5 py-3.5 border-b border-border flex items-center justify-between bg-secondary/30">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {selected.visitor_name || `Visitante ${selected.session_id.slice(0, 6)}`}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {selected.visitor_email || selected.session_id.slice(0, 16)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {getStatusBadge(selected.status)}
                <button
                  onClick={async () => {
                    const visitorName = selected.visitor_name || `Visitante ${selected.session_id.slice(0, 6)}`;
                    const { data: cols } = await supabase.from('kanban_columns').select('id').eq('is_fixed', true).limit(1).single();
                    if (!cols) { alert('Coluna "Lead" não encontrada'); return; }
                    const { data: existing } = await supabase.from('kanban_leads').select('id').eq('conversation_id', selected.id).limit(1).single();
                    if (existing) { alert('Lead já cadastrado para esta conversa!'); return; }
                    await supabase.from('kanban_leads').insert({
                      name: visitorName,
                      email: selected.visitor_email || null,
                      column_id: cols.id,
                      conversation_id: selected.id,
                      source: 'chat',
                    });
                    alert('Lead adicionado ao Kanban!');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20"
                  title="Adicionar ao Kanban"
                >
                  <Columns3 className="w-3.5 h-3.5" /> Kanban
                </button>
                <button
                  onClick={() => handleToggleManual(selected)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    selected.status === 'human_handling'
                      ? 'bg-purple-500/10 border-purple-500/30 text-purple-500 hover:bg-purple-500/20'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20'
                  }`}
                  title={selected.status === 'human_handling' ? 'Voltar para IA' : 'Assumir manualmente'}
                >
                  {selected.status === 'human_handling' ? (
                    <><Bot className="w-3.5 h-3.5" /> Voltar p/ IA</>
                  ) : (
                    <><UserCheck className="w-3.5 h-3.5" /> Manual</>
                  )}
                </button>
                {/* Gear icon for client panel */}
                <button
                  onClick={() => setClientPanelOpen(!clientPanelOpen)}
                  className={`p-2 rounded-lg transition-all border ${
                    clientPanelOpen
                      ? 'bg-primary/10 border-primary/30 text-primary'
                      : 'bg-secondary border-border text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                  }`}
                  title="Dados do cliente"
                >
                  <Settings2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, hsl(var(--secondary)) 0%, hsl(var(--background)) 100%)' }}>
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'visitor' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm font-medium whitespace-pre-wrap shadow-sm ${
                    msg.role === 'visitor'
                      ? 'bg-card text-foreground rounded-bl-sm border border-border'
                      : msg.role === 'admin'
                      ? 'bg-emerald-500/20 text-foreground rounded-br-sm'
                      : 'bg-purple-500/20 text-foreground rounded-br-sm'
                  }`}>
                    <span className="text-[9px] font-black uppercase tracking-wider block mb-1 opacity-40">
                      {msg.role === 'visitor' ? 'Visitante' : msg.role === 'admin' ? '👤 Admin' : '🤖 IA'}
                    </span>
                    {msg.content}
                    <span className="text-[9px] text-muted-foreground block text-right mt-1 opacity-50">
                      {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Reply Input */}
            {selected.status !== 'closed' && (
              <div className="border-t border-border p-3 flex gap-2 bg-secondary/30">
                <input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleReply()}
                  placeholder={selected.status === 'human_handling' ? 'Responder como admin...' : 'Responder (modo IA ativo)...'}
                  className="flex-1 px-4 py-3 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  disabled={sending}
                />
                <button
                  onClick={handleReply}
                  disabled={sending || !reply.trim()}
                  className="px-4 py-3 rounded-xl text-white font-bold text-sm disabled:opacity-50 transition-all"
                  style={{ background: 'linear-gradient(135deg, #5766fe, #820dd1)' }}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* RIGHT PANEL - Client Info (WhatsApp Business style) */}
      {selected && clientPanelOpen && (
        <div className="w-80 flex-shrink-0 border-l border-border flex flex-col bg-secondary/30 animate-slide-in-right">
          {/* Panel Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Dados do Cliente</h3>
            <button onClick={() => setClientPanelOpen(false)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Client Avatar & Name */}
          <div className="flex flex-col items-center py-6 border-b border-border">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <User className="w-10 h-10 text-primary" />
            </div>
            <p className="text-lg font-bold text-foreground">
              {clientData.name || `Visitante ${selected.session_id.slice(0, 6)}`}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{clientData.email || 'Sem e-mail'}</p>
          </div>

          {/* Client Form */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1.5">
                <User className="w-3 h-3" /> Nome
              </label>
              <input
                type="text"
                value={clientData.name}
                onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
                placeholder="Nome do cliente"
                className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1.5">
                <Mail className="w-3 h-3" /> E-mail
              </label>
              <input
                type="email"
                value={clientData.email}
                onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
                placeholder="email@exemplo.com"
                className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1.5">
                <Phone className="w-3 h-3" /> Telefone
              </label>
              <input
                type="tel"
                value={clientData.phone}
                onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
                placeholder="(11) 99999-9999"
                className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1.5">
                <FileText className="w-3 h-3" /> Observações
              </label>
              <textarea
                value={clientData.notes}
                onChange={(e) => setClientData({ ...clientData, notes: e.target.value })}
                rows={4}
                placeholder="Anotações sobre o cliente..."
                className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              />
            </div>

            {/* Info Section */}
            <div className="bg-card rounded-xl border border-border p-3 space-y-2">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Informações</p>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Sessão</span>
                <span className="text-foreground font-mono text-[10px]">{selected.session_id.slice(0, 12)}...</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Início</span>
                <span className="text-foreground">{new Date(selected.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Status</span>
                {getStatusBadge(selected.status)}
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Mensagens</span>
                <span className="text-foreground font-bold">{messages.length}</span>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="p-4 border-t border-border">
            <button
              onClick={handleSaveClient}
              disabled={savingClient}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #5766fe, #820dd1)' }}
            >
              <Save className="w-4 h-4" />
              {savingClient ? 'Salvando...' : 'Salvar dados'}
            </button>
          </div>
        </div>
      )}
      {/* Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-card w-full max-w-sm rounded-[32px] border border-border shadow-2xl p-8 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
              <Trash2 className="w-8 h-8 text-destructive" />
            </div>
            <div className="text-center space-y-2">
              <h4 className="text-xl font-black text-foreground">Excluir Conversa</h4>
              <p className="text-sm text-muted-foreground">
                Deseja realmente excluir esta conversa? Todas as mensagens e dados vinculados serão removidos permanentemente.
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeletingId(null)}
                className="flex-1 py-3 rounded-xl bg-secondary text-muted-foreground font-bold text-sm hover:bg-secondary/80 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => handleDelete(deletingId)}
                className="flex-1 py-3 rounded-xl bg-destructive text-white font-bold text-sm hover:bg-destructive/90 transition-colors shadow-lg shadow-destructive/20"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminChatPage;
