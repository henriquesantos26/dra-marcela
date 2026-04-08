import React, { useState, useEffect } from 'react';
import {
  Settings, BookOpen, Save, Trash2, Plus, X, Loader2,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FewShotExample {
  question: string;
  answer: string;
}

interface AgentConfig {
  id: string;
  instructions: string;
  avoid_topics: string;
  fallback_message: string;
  greeting: string;
  active: boolean;
  temperature: number;
  few_shot_examples: FewShotExample[];
}

interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
}

const CATEGORIES = ['Serviços', 'FAQ', 'Sobre nós', 'Políticas', 'Geral'];

type Tab = 'agent' | 'knowledge';

const AdminAgentPage = () => {
  const [tab, setTab] = useState<Tab>('agent');

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-border pb-4">
        {([
          { id: 'agent' as Tab, label: 'Configuração do Agente', icon: Settings },
          { id: 'knowledge' as Tab, label: 'Base de Conhecimento', icon: BookOpen },
        ]).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
              tab === t.id ? 'text-white shadow-lg' : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
            style={tab === t.id ? { background: 'linear-gradient(135deg, #5766fe, #820dd1)' } : undefined}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'agent' && <AgentTab />}
      {tab === 'knowledge' && <KnowledgeTab />}
    </div>
  );
};

/* ==================== AGENT CONFIG ==================== */
const AgentTab = () => {
  const [config, setConfig] = useState<AgentConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase
      .from('chat_agent_config')
      .select('*')
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) {
          setConfig({
            ...data,
            few_shot_examples: (data.few_shot_examples || []) as unknown as FewShotExample[],
          } as AgentConfig);
        }
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    await supabase.from('chat_agent_config').update({
      instructions: config.instructions,
      avoid_topics: config.avoid_topics,
      fallback_message: config.fallback_message,
      greeting: config.greeting,
      active: config.active,
      temperature: config.temperature,
      few_shot_examples: JSON.parse(JSON.stringify(config.few_shot_examples || [])),
    }).eq('id', config.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  if (!config) return <p className="text-muted-foreground">Configuração não encontrada.</p>;

  const update = (field: keyof AgentConfig, value: any) => setConfig({ ...config, [field]: value });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-foreground">Configuração do Agente</h3>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-lg transition-all ${saved ? 'bg-emerald-500' : ''}`}
          style={!saved ? { background: 'linear-gradient(135deg, #5766fe, #820dd1)' } : undefined}
        >
          <Save className="w-4 h-4" />
          {saved ? 'Salvo!' : saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-card rounded-2xl border border-border p-6">
            <label className="block text-xs font-black text-foreground mb-2 uppercase tracking-wider">Instruções do Agente</label>
            <textarea value={config.instructions} onChange={(e) => update('instructions', e.target.value)} rows={6}
              className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none text-sm" />
          </div>

          <div className="bg-card rounded-2xl border border-border p-6">
            <label className="block text-xs font-black text-foreground mb-2 uppercase tracking-wider">Tópicos Proibidos</label>
            <textarea value={config.avoid_topics} onChange={(e) => update('avoid_topics', e.target.value)} rows={4}
              className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none text-sm" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card rounded-2xl border border-border p-6">
            <label className="block text-xs font-black text-foreground mb-2 uppercase tracking-wider">Mensagem de Boas-Vindas</label>
            <textarea value={config.greeting} onChange={(e) => update('greeting', e.target.value)} rows={3}
              className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none text-sm" />
          </div>

          <div className="bg-card rounded-2xl border border-border p-6">
            <label className="block text-xs font-black text-foreground mb-2 uppercase tracking-wider">Mensagem de Fallback</label>
            <textarea value={config.fallback_message} onChange={(e) => update('fallback_message', e.target.value)} rows={3}
              className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none text-sm" />
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 flex items-center justify-between">
            <div>
              <label className="block text-xs font-black text-foreground uppercase tracking-wider">Agente Ativo</label>
              <p className="text-xs text-muted-foreground mt-1">Quando desativado, usa a mensagem de fallback.</p>
            </div>
            <button onClick={() => update('active', !config.active)}
              className={`w-12 h-6 rounded-full transition-colors relative ${config.active ? 'bg-emerald-500' : 'bg-border'}`}>
              <div className={`w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-transform ${config.active ? 'left-6' : 'left-0.5'}`} />
            </button>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6">
            <label className="block text-xs font-black text-foreground mb-2 uppercase tracking-wider">
              Temperatura: {config.temperature}
            </label>
            <input type="range" min="0" max="1" step="0.1" value={config.temperature}
              onChange={(e) => update('temperature', parseFloat(e.target.value))}
              className="w-full accent-primary" />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>Preciso (0)</span>
              <span>Criativo (1)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Few-Shot Examples */}
      <div className="bg-card rounded-2xl border-2 border-purple-500/20 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-xs font-black text-foreground uppercase tracking-wider">Exemplos de Perguntas e Respostas (Few-Shot)</label>
            <p className="text-xs text-muted-foreground mt-1">Ensine ao agente como responder com exemplos concretos.</p>
          </div>
          <button
            onClick={() => {
              const examples = [...(config.few_shot_examples || []), { question: '', answer: '' }];
              update('few_shot_examples', examples);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white font-bold text-xs"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #d946ef)' }}
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar exemplo
          </button>
        </div>

        {(config.few_shot_examples || []).length === 0 && (
          <p className="text-sm text-muted-foreground italic py-4 text-center">Nenhum exemplo cadastrado.</p>
        )}

        {(config.few_shot_examples || []).map((ex, idx) => (
          <div key={idx} className="relative bg-secondary rounded-xl p-4 space-y-3 border border-border">
            <button
              onClick={() => {
                const examples = (config.few_shot_examples || []).filter((_, i) => i !== idx);
                update('few_shot_examples', examples);
              }}
              className="absolute top-3 right-3 p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <div>
              <label className="block text-[10px] font-black text-muted-foreground mb-1 uppercase tracking-wider">Pergunta do visitante</label>
              <input
                type="text"
                value={ex.question}
                onChange={(e) => {
                  const examples = [...(config.few_shot_examples || [])];
                  examples[idx] = { ...examples[idx], question: e.target.value };
                  update('few_shot_examples', examples);
                }}
                placeholder="Ex: Quanto custa o serviço de criação de site?"
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-muted-foreground mb-1 uppercase tracking-wider">Resposta ideal do agente</label>
              <textarea
                value={ex.answer}
                onChange={(e) => {
                  const examples = [...(config.few_shot_examples || [])];
                  examples[idx] = { ...examples[idx], answer: e.target.value };
                  update('few_shot_examples', examples);
                }}
                rows={3}
                placeholder="Ex: Nossos planos começam a partir de R$ 2.500."
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 resize-none"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ==================== KNOWLEDGE BASE ==================== */
const KnowledgeTab = () => {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<KnowledgeItem | null>(null);
  const [isNew, setIsNew] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase.from('chat_knowledge').select('*').order('created_at', { ascending: false });
    setItems((data || []) as KnowledgeItem[]);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleNew = () => {
    setIsNew(true);
    setEditing({ id: '', title: '', content: '', category: 'Geral', created_at: '' });
  };

  const handleSave = async () => {
    if (!editing) return;
    if (isNew) {
      await supabase.from('chat_knowledge').insert({
        title: editing.title,
        content: editing.content,
        category: editing.category,
      });
    } else {
      await supabase.from('chat_knowledge').update({
        title: editing.title,
        content: editing.content,
        category: editing.category,
      }).eq('id', editing.id);
    }
    setEditing(null);
    setIsNew(false);
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este conhecimento?')) return;
    await supabase.from('chat_knowledge').delete().eq('id', id);
    fetchItems();
  };

  if (editing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-foreground">{isNew ? 'Novo Conhecimento' : 'Editar'}</h3>
          <div className="flex gap-2">
            <button onClick={() => { setEditing(null); setIsNew(false); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-muted-foreground font-bold text-sm">
              <X className="w-4 h-4" /> Cancelar
            </button>
            <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg"
              style={{ background: 'linear-gradient(135deg, #5766fe, #820dd1)' }}>
              <Save className="w-4 h-4" /> Salvar
            </button>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Título</label>
            <input type="text" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Categoria</label>
            <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Conteúdo</label>
            <textarea value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} rows={10}
              className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y text-sm" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{items.length} documentos</p>
        <button onClick={handleNew} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg"
          style={{ background: 'linear-gradient(135deg, #5766fe, #820dd1)' }}>
          <Plus className="w-4 h-4" /> Adicionar
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-border">
          <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-lg font-black text-foreground">Base vazia</p>
          <p className="text-sm text-muted-foreground">Adicione documentos para o agente de IA usar como referência.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-foreground truncate">{item.title}</h4>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span className="font-bold text-primary">{item.category}</span>
                  <span>{item.content.length} caracteres</span>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => { setEditing(item); setIsNew(false); }} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminAgentPage;
