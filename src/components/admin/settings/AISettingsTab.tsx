import React, { useState, useEffect } from 'react';
import { Save, Loader2, Eye, EyeOff, Shield, Star, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AIProvider {
  id: string;
  provider_name: string;
  display_name: string;
  api_key_encrypted: string | null;
  is_active: boolean;
  priority: string;
  model_name: string | null;
  created_at: string;
  updated_at: string;
}

const PROVIDER_ICONS: Record<string, string> = {
  gemini: '🔷',
  chatgpt: '🟢',
  lovable: '💜',
};

const PROVIDER_DESCRIPTIONS: Record<string, string> = {
  gemini: 'Google Gemini — modelos avançados de IA generativa',
  chatgpt: 'OpenAI ChatGPT — processamento de linguagem natural',
  lovable: 'Lovable AI Gateway — já configurado automaticamente',
};

const PROVIDER_MODELS: Record<string, { id: string; label: string; desc: string }[]> = {
  gemini: [
    { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', desc: 'Máximo poder — raciocínio complexo + multimodal' },
    { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', desc: 'Equilíbrio custo/velocidade — boa qualidade' },
    { id: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite', desc: 'Mais rápido e barato — tarefas simples' },
    { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', desc: 'Versão anterior rápida' },
    { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', desc: 'Contexto longo — até 1M tokens' },
    { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', desc: 'Rápido e econômico' },
  ],
  chatgpt: [
    { id: 'gpt-4o', label: 'GPT-4o', desc: 'Multimodal rápido — texto, imagem, áudio' },
    { id: 'gpt-4o-mini', label: 'GPT-4o Mini', desc: 'Versão econômica do 4o — ótimo custo-benefício' },
    { id: 'gpt-4-turbo', label: 'GPT-4 Turbo', desc: 'Alta qualidade com contexto grande' },
    { id: 'gpt-4', label: 'GPT-4', desc: 'Modelo clássico de alta qualidade' },
    { id: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', desc: 'Rápido e barato — tarefas simples' },
    { id: 'o3-mini', label: 'o3 Mini', desc: 'Raciocínio avançado — mais eficiente' },
    { id: 'o1', label: 'o1', desc: 'Raciocínio profundo — problemas complexos' },
    { id: 'o1-mini', label: 'o1 Mini', desc: 'Raciocínio bom — custo menor' },
  ],
};

const AISettingsTab = () => {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [savedMsg, setSavedMsg] = useState('');

  const fetchProviders = async () => {
    setLoading(true);
    const { data } = await supabase.from('ai_providers').select('*').order('created_at');
    setProviders((data || []) as AIProvider[]);
    setLoading(false);
  };

  useEffect(() => { fetchProviders(); }, []);

  const handleSaveKey = async (provider: AIProvider) => {
    const key = apiKeys[provider.provider_name];
    if (!key?.trim()) return;
    setSaving(provider.id);
    try {
      const { error } = await supabase.functions.invoke('manage-ai-keys', {
        body: { action: 'save_key', provider_name: provider.provider_name, api_key: key.trim() },
      });
      if (error) throw error;
      setSavedMsg(`Chave do ${provider.display_name} salva com sucesso!`);
      setApiKeys((prev) => ({ ...prev, [provider.provider_name]: '' }));
      fetchProviders();
      setTimeout(() => setSavedMsg(''), 3000);
    } catch (err) {
      console.error('Error saving key:', err);
      setSavedMsg('Erro ao salvar a chave.');
    } finally {
      setSaving(null);
    }
  };

  const handleToggleActive = async (provider: AIProvider) => {
    // Don't allow activating without a key (except lovable)
    if (!provider.is_active && !provider.api_key_encrypted && provider.provider_name !== 'lovable') {
      setSavedMsg('Adicione a chave de API antes de ativar.');
      setTimeout(() => setSavedMsg(''), 3000);
      return;
    }
    await supabase.from('ai_providers').update({ is_active: !provider.is_active }).eq('id', provider.id);
    fetchProviders();
  };

  const handleSetPriority = async (provider: AIProvider, priority: string) => {
    // If setting as primary, demote current primary
    if (priority === 'primary') {
      await supabase.from('ai_providers').update({ priority: 'none' }).eq('priority', 'primary');
    }
    if (priority === 'backup') {
      await supabase.from('ai_providers').update({ priority: 'none' }).eq('priority', 'backup');
    }
    await supabase.from('ai_providers').update({ priority }).eq('id', provider.id);
    fetchProviders();
  };

  const handleRemoveKey = async (provider: AIProvider) => {
    if (!confirm(`Remover a chave de API do ${provider.display_name}?`)) return;
    await supabase.from('ai_providers')
      .update({ api_key_encrypted: null, is_active: false, priority: 'none' })
      .eq('id', provider.id);
    fetchProviders();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-black text-foreground">Provedores de IA</h3>
        <p className="text-sm text-muted-foreground mt-1">Configure as chaves de API e defina qual IA será usada como principal ou backup.</p>
      </div>

      {savedMsg && (
        <div className={`p-3 rounded-xl text-sm font-bold ${savedMsg.includes('Erro') ? 'bg-destructive/10 border border-destructive/30 text-destructive' : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600'}`}>
          {savedMsg}
        </div>
      )}

      <div className="space-y-4">
        {providers.map((provider) => (
          <div key={provider.id} className="bg-card rounded-2xl border border-border p-6 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{PROVIDER_ICONS[provider.provider_name] || '🤖'}</span>
                <div>
                  <h4 className="font-black text-foreground flex items-center gap-2">
                    {provider.display_name}
                    {provider.priority === 'primary' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        <Star className="w-3 h-3" /> Principal
                      </span>
                    )}
                    {provider.priority === 'backup' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-500 border border-blue-500/20">
                        <Zap className="w-3 h-3" /> Backup
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-muted-foreground">{PROVIDER_DESCRIPTIONS[provider.provider_name]}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Status */}
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${provider.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                  {provider.is_active ? 'Ativo' : 'Inativo'}
                </span>
                {/* Toggle */}
                <button
                  onClick={() => handleToggleActive(provider)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${provider.is_active ? 'bg-emerald-500' : 'bg-border'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-transform ${provider.is_active ? 'left-6' : 'left-0.5'}`} />
                </button>
              </div>
            </div>

            {/* Model name */}
            {provider.model_name && (
              <p className="text-xs font-mono text-muted-foreground bg-secondary px-3 py-1.5 rounded-lg inline-block">
                Modelo: {provider.model_name}
              </p>
            )}

            {/* Model selector */}
            {PROVIDER_MODELS[provider.provider_name] && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Modelo de IA</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PROVIDER_MODELS[provider.provider_name].map((m) => {
                    const isSelected = (provider.model_name || PROVIDER_MODELS[provider.provider_name][0].id) === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={async () => {
                          await supabase.from('ai_providers').update({ model_name: m.id }).eq('id', provider.id);
                          fetchProviders();
                        }}
                        className={`text-left p-3 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-border bg-secondary hover:border-muted-foreground/30'
                        }`}
                      >
                        <span className="text-sm font-bold text-foreground block">{m.label}</span>
                        <span className="text-[11px] text-muted-foreground leading-tight">{m.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* API Key input (not for lovable) */}
            {provider.provider_name !== 'lovable' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Chave de API</label>
                  {provider.api_key_encrypted && (
                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      🔒 Criptografada
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showKeys[provider.provider_name] ? 'text' : 'password'}
                      value={apiKeys[provider.provider_name] || ''}
                      onChange={(e) => setApiKeys((prev) => ({ ...prev, [provider.provider_name]: e.target.value }))}
                      placeholder={provider.api_key_encrypted ? '••••••••••••••••••••••••' : 'Cole sua chave de API aqui...'}
                      className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-[#5766fe]/40 text-sm font-mono pr-10"
                    />
                    <button
                      onClick={() => setShowKeys((prev) => ({ ...prev, [provider.provider_name]: !prev[provider.provider_name] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showKeys[provider.provider_name] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    onClick={() => handleSaveKey(provider)}
                    disabled={saving === provider.id || !apiKeys[provider.provider_name]?.trim()}
                    className="px-5 py-3 rounded-xl text-white font-bold text-sm disabled:opacity-50 flex items-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #5766fe, #820dd1)' }}
                  >
                    {saving === provider.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Salvar
                  </button>
                </div>

                {provider.api_key_encrypted && (
                  <button
                    onClick={() => handleRemoveKey(provider)}
                    className="text-xs font-bold text-destructive hover:underline"
                  >
                    Remover chave
                  </button>
                )}
              </div>
            )}

            {/* Priority selection */}
            {provider.is_active && (
              <div className="flex gap-2 pt-2 border-t border-border">
                <button
                  onClick={() => handleSetPriority(provider, 'primary')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    provider.priority === 'primary' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Star className="w-3 h-3 inline mr-1" /> Principal
                </button>
                <button
                  onClick={() => handleSetPriority(provider, 'backup')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    provider.priority === 'backup' ? 'bg-blue-500/20 text-blue-500 border border-blue-500/30' : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Zap className="w-3 h-3 inline mr-1" /> Backup
                </button>
                <button
                  onClick={() => handleSetPriority(provider, 'none')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    provider.priority === 'none' ? 'bg-muted text-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Nenhum
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AISettingsTab;
