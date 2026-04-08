import React, { useState } from 'react';
import { Sparkles, Loader2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  onGenerated: (data: any) => void;
}

const IMAGE_STYLES = [
  { id: 'realistic', label: '🌑 Realista Dark', description: 'Fotografia cinematográfica com tons escuros e sombras dramáticas' },
  { id: 'futuristic', label: '⚡ Futurista Dark Punk', description: 'Estilo cyberpunk com neons, hologramas e elementos futuristas' },
];

const AdminBlogAIGenerator = ({ onGenerated }: Props) => {
  const [topic, setTopic] = useState('');
  const [imageStyle, setImageStyle] = useState('realistic');
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setGenerating(true);
    setError('');
    setProgress('Gerando conteúdo otimizado para SEO...');

    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-blog', {
        body: { topic: topic.trim(), imageStyle },
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      setProgress('Post gerado com sucesso!');
      onGenerated(data);
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message || 'Erro ao gerar o post. Tente novamente.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Topic input */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <label className="block text-xs font-black text-foreground mb-3 uppercase tracking-wider">Tema do Post</label>
        <textarea
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder="Ex: Como usar inteligência artificial no marketing digital para pequenas empresas..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/40 resize-none text-sm"
          disabled={generating}
        />
      </div>

      {/* Image style selector */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <label className="block text-xs font-black text-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
          <ImageIcon className="w-4 h-4" /> Estilo da Imagem de Capa
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {IMAGE_STYLES.map(style => (
            <button
              key={style.id}
              onClick={() => setImageStyle(style.id)}
              disabled={generating}
              className={`text-left p-5 rounded-xl border-2 transition-all ${
                imageStyle === style.id
                  ? 'border-purple-500 bg-purple-500/10 shadow-lg'
                  : 'border-border bg-secondary hover:border-muted-foreground/30'
              }`}
            >
              <span className="text-lg font-black text-foreground block mb-1">{style.label}</span>
              <span className="text-xs text-muted-foreground">{style.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={generating || !topic.trim()}
        className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-white font-black text-lg shadow-xl hover:scale-[1.01] transition-all disabled:opacity-50 disabled:scale-100"
        style={{ background: 'linear-gradient(135deg, #8b5cf6, #d946ef)' }}
      >
        {generating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {progress}
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Gerar Post Completo com IA
          </>
        )}
      </button>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm font-bold">
          {error}
        </div>
      )}

      {/* Info box */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h4 className="text-sm font-black text-foreground mb-3">🤖 O que a IA vai gerar:</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold">✓</span> Título otimizado para SEO (máx 60 caracteres)</li>
          <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold">✓</span> Meta title e meta description</li>
          <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold">✓</span> Conteúdo completo com headings H2/H3 estruturados</li>
          <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold">✓</span> Imagem de capa gerada por IA no estilo escolhido</li>
          <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold">✓</span> Tags e categoria automáticas</li>
          <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold">✓</span> Slug otimizado para URL</li>
          <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold">✓</span> Checklist de SEO com recomendações de backlinks e indexação</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminBlogAIGenerator;
