import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Save, Loader2, Code, ToggleLeft, ToggleRight, Info } from 'lucide-react';
import { toast } from 'sonner';

interface TrackingScript {
  id: string;
  name: string;
  slug: string;
  head_code: string;
  body_code: string;
  is_active: boolean;
}

const SLUG_INFO: Record<string, { description: string; headPlaceholder: string; bodyPlaceholder: string }> = {
  gtm: {
    description: 'Cole o código do Google Tag Manager. O snippet do <head> vai no campo "Head" e o <noscript> do body no campo "Body".',
    headPlaceholder: "<!-- Google Tag Manager -->\n<script>(function(w,d,s,l,i){...})(window,document,'script','dataLayer','GTM-XXXX');</script>",
    bodyPlaceholder: "<!-- Google Tag Manager (noscript) -->\n<noscript><iframe src=\"https://www.googletagmanager.com/ns.html?id=GTM-XXXX\"...></iframe></noscript>",
  },
  ga: {
    description: 'Cole o código do Google Analytics (GA4). Geralmente é um snippet com gtag.js que vai no <head>.',
    headPlaceholder: "<!-- Google tag (gtag.js) -->\n<script async src=\"https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX\"></script>\n<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-XXXXXXX');</script>",
    bodyPlaceholder: "",
  },
  'meta-pixel': {
    description: 'Cole o código do Meta Pixel (Facebook Pixel). O script principal vai no <head> e o <noscript> no body.',
    headPlaceholder: "<!-- Meta Pixel Code -->\n<script>!function(f,b,e,v,n,t,s){...}('PIXEL_ID','PageView');</script>",
    bodyPlaceholder: "<noscript><img height=\"1\" width=\"1\" style=\"display:none\" src=\"https://www.facebook.com/tr?id=PIXEL_ID&ev=PageView&noscript=1\"/></noscript>",
  },
  'meta-api': {
    description: 'Configure o token de acesso da API de Conversões do Meta. Cole o token no campo Head (será usado server-side).',
    headPlaceholder: "<!-- Meta Conversions API Token -->\n<!-- Token: EAAxxxxxxx... -->",
    bodyPlaceholder: "",
  },
  'meta-domain': {
    description: 'Cole a meta tag de verificação de domínio do Meta Business. Encontre-a em Business Settings > Brand Safety > Domains.',
    headPlaceholder: '<meta name="facebook-domain-verification" content="abcdef123456" />',
    bodyPlaceholder: "",
  },
  gsc: {
    description: 'Cole a meta tag de verificação do Google Search Console. Encontre-a em Search Console > Configurações > Verificação de propriedade.',
    headPlaceholder: '<meta name="google-site-verification" content="abcdef123456" />',
    bodyPlaceholder: "",
  },
};

const AdminTrackingPage = () => {
  const [scripts, setScripts] = useState<TrackingScript[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    loadScripts();
  }, []);

  const loadScripts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tracking_scripts')
      .select('*')
      .order('created_at');
    if (data) setScripts(data as unknown as TrackingScript[]);
    if (error) toast.error('Erro ao carregar scripts');
    setLoading(false);
  };

  const handleSave = async (script: TrackingScript) => {
    setSavingId(script.id);
    const { error } = await supabase
      .from('tracking_scripts')
      .update({
        head_code: script.head_code,
        body_code: script.body_code,
        is_active: script.is_active,
      })
      .eq('id', script.id);

    if (error) {
      toast.error('Erro ao salvar');
    } else {
      toast.success(`${script.name} salvo com sucesso`);
    }
    setSavingId(null);
  };

  const handleToggle = async (script: TrackingScript) => {
    const updated = { ...script, is_active: !script.is_active };
    setScripts(prev => prev.map(s => s.id === script.id ? updated : s));
    await handleSave(updated);
  };

  const updateScript = (id: string, field: keyof TrackingScript, value: string) => {
    setScripts(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-foreground tracking-tight">Rastreamento & Scripts</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie códigos de rastreamento, pixels e verificações de domínio. Os códigos ativos serão injetados automaticamente no site.
        </p>
      </div>

      <div className="space-y-6">
        {scripts.map((script) => {
          const info = SLUG_INFO[script.slug] || { description: '', headPlaceholder: '', bodyPlaceholder: '' };

          return (
            <div key={script.id} className="rounded-2xl border border-border bg-card overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
                <div className="flex items-center gap-3">
                  <Code className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{script.name}</h3>
                    <p className="text-xs text-muted-foreground">{script.slug}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggle(script)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      script.is_active
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {script.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    {script.is_active ? 'Ativo' : 'Inativo'}
                  </button>

                  <button
                    onClick={() => handleSave(script)}
                    disabled={savingId === script.id}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50"
                  >
                    {savingId === script.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Salvar
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="px-6 py-3 bg-muted/10 border-b border-border">
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span>{info.description}</span>
                </div>
              </div>

              {/* Code editors */}
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground/70 uppercase tracking-wider">
                    Código do Head {'<head>'}
                  </label>
                  <textarea
                    value={script.head_code}
                    onChange={(e) => updateScript(script.id, 'head_code', e.target.value)}
                    placeholder={info.headPlaceholder}
                    rows={4}
                    className="w-full bg-muted/50 border border-border rounded-xl p-4 text-xs font-mono text-foreground placeholder:text-muted-foreground/40 resize-y outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                  />
                </div>

                {(script.slug === 'gtm' || script.slug === 'meta-pixel') && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground/70 uppercase tracking-wider">
                      Código do Body {'<body>'}
                    </label>
                    <textarea
                      value={script.body_code}
                      onChange={(e) => updateScript(script.id, 'body_code', e.target.value)}
                      placeholder={info.bodyPlaceholder}
                      rows={3}
                      className="w-full bg-muted/50 border border-border rounded-xl p-4 text-xs font-mono text-foreground placeholder:text-muted-foreground/40 resize-y outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminTrackingPage;
