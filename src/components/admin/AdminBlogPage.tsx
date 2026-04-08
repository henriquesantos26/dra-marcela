import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Plus, Trash2, Edit2, Eye, EyeOff, Save, X, Upload, Loader2, Sparkles, Calendar, Image as ImageIcon, Star, CheckSquare, Square, ListChecks, Clock, Wand2, RotateCcw, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { BlogPost } from '@/hooks/useBlogPosts';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const slugify = (text: string) =>
  text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const IMAGE_STYLES = [
  { id: 'realistic', label: '🌑 Realista Dark', description: 'Fotografia cinematográfica com tons escuros' },
  { id: 'futuristic', label: '⚡ Futurista Dark Punk', description: 'Cyberpunk com neons e hologramas' },
  { id: 'realistic-natural', label: '📷 Realista', description: 'Fotografia natural com iluminação suave' },
  { id: 'surreal', label: '🎨 Surrealista', description: 'Composições oníricas e elementos impossíveis' },
  { id: 'photo-realistic', label: '🔍 Realista Fotográfico', description: 'Hiper-realismo, indistinguível de foto' },
  { id: 'pixar', label: '🎬 Animação Pixar', description: '3D cartoon, cores vibrantes, personagens estilizados' },
];

type TopicSuggestion = { title: string; description: string };
type QueueItem = { topic: TopicSuggestion; status: 'pending' | 'generating' | 'done' | 'error'; postId?: string; error?: string };

const AdminBlogPage = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [isNew, setIsNew] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // AI states
  const [aiTopic, setAiTopic] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiProgress, setAiProgress] = useState('');
  const [aiError, setAiError] = useState('');
  const [imageStyle, setImageStyle] = useState('realistic');
  const [generatingImage, setGeneratingImage] = useState(false);
  const [customImagePrompt, setCustomImagePrompt] = useState('');
  const [useCustomPrompt, setUseCustomPrompt] = useState(false);

  // Topic generator states
  const [niche, setNiche] = useState('');
  const [topicCount, setTopicCount] = useState(4);
  const [generatingTopics, setGeneratingTopics] = useState(false);
  const [topicSuggestions, setTopicSuggestions] = useState<TopicSuggestion[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<Set<number>>(new Set());
  const [topicError, setTopicError] = useState('');

  // Queue states
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [queueRunning, setQueueRunning] = useState(false);

  // Scheduling states
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduleFrequency, setScheduleFrequency] = useState('1x');
  const [scheduleStartDate, setScheduleStartDate] = useState('');

  // Post filter
  const [postFilter, setPostFilter] = useState<'all' | 'drafts' | 'scheduled' | 'published' | 'trash'>('all');

  const fetchPosts = async () => {
    setLoading(true);
    const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
    setPosts((data || []) as BlogPost[]);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const filteredPosts = useMemo(() => {
    return posts.filter(p => {
      const isDeleted = !!(p as any).deleted_at;
      switch (postFilter) {
        case 'drafts': return !isDeleted && !p.published && !p.scheduled_at;
        case 'scheduled': return !isDeleted && !p.published && !!p.scheduled_at;
        case 'published': return !isDeleted && p.published;
        case 'trash': return isDeleted;
        default: return !isDeleted; // 'all' excludes trash
      }
    });
  }, [posts, postFilter]);

  const postCounts = useMemo(() => ({
    all: posts.filter(p => !(p as any).deleted_at).length,
    drafts: posts.filter(p => !(p as any).deleted_at && !p.published && !p.scheduled_at).length,
    scheduled: posts.filter(p => !(p as any).deleted_at && !p.published && !!p.scheduled_at).length,
    published: posts.filter(p => !(p as any).deleted_at && p.published).length,
    trash: posts.filter(p => !!(p as any).deleted_at).length,
  }), [posts]);

  const handleNew = () => {
    setIsNew(true);
    setAiTopic('');
    setAiError('');
    setCustomImagePrompt('');
    setUseCustomPrompt(false);
    setEditing({
      id: '', title: '', slug: '', excerpt: '', content: '', cover_image: '',
      category: '', tags: [], author_name: '', author_avatar: '', author_bio: '', published: false,
      views_count: 0, meta_title: '', meta_description: '', scheduled_at: null,
      show_in_banner: false, character_image: null,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    } as BlogPost);
  };

  const handleSave = async () => {
    if (!editing) return;
    const payload: any = {
      title: editing.title, slug: editing.slug || slugify(editing.title),
      excerpt: editing.excerpt, content: editing.content, cover_image: editing.cover_image,
      category: editing.category, tags: editing.tags, author_name: editing.author_name,
      author_avatar: editing.author_avatar, author_bio: editing.author_bio, published: editing.published,
      meta_title: editing.meta_title, meta_description: editing.meta_description,
      scheduled_at: editing.scheduled_at || null,
      show_in_banner: editing.show_in_banner,
    };
    if (isNew) {
      await supabase.from('blog_posts').insert(payload);
    } else {
      await supabase.from('blog_posts').update(payload).eq('id', editing.id);
    }
    setEditing(null);
    setIsNew(false);
    fetchPosts();
  };

  const handleMoveToTrash = async (id: string) => {
    if (!confirm('Mover este post para a lixeira?')) return;
    await supabase.from('blog_posts').update({ deleted_at: new Date().toISOString() } as any).eq('id', id);
    fetchPosts();
  };

  const handleRestore = async (id: string) => {
    await supabase.from('blog_posts').update({ deleted_at: null } as any).eq('id', id);
    fetchPosts();
  };

  const handlePermanentDelete = async (id: string) => {
    if (!confirm('Excluir permanentemente? Esta ação não pode ser desfeita.')) return;
    await supabase.from('blog_posts').delete().eq('id', id);
    fetchPosts();
  };

  const handleTogglePublish = async (post: BlogPost) => {
    await supabase.from('blog_posts').update({ published: !post.published }).eq('id', post.id);
    fetchPosts();
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `blog/cover-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('site-assets').upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('site-assets').getPublicUrl(path);
      setEditing({ ...editing, cover_image: publicUrl });
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const updateEditing = (field: string, value: any) => {
    if (!editing) return;
    setEditing(prev => prev ? { ...prev, [field]: value } : prev);
  };

  const updateEditingMultiple = (updates: Record<string, any>) => {
    if (!editing) return;
    setEditing(prev => prev ? { ...prev, ...updates } : prev);
  };

  // Generate full post with AI
  const handleAIGenerate = async () => {
    if (!aiTopic.trim() || !editing) return;
    setAiGenerating(true);
    setAiError('');
    setAiProgress('Gerando conteúdo otimizado para SEO...');
    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-blog', {
        body: {
          topic: aiTopic.trim(),
          imageStyle,
          customImagePrompt: useCustomPrompt ? customImagePrompt : undefined,
        },
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      setAiProgress('Post gerado com sucesso!');
      setEditing({
        ...editing,
        title: data.title || editing.title,
        slug: data.slug || slugify(data.title || editing.title),
        excerpt: data.excerpt || editing.excerpt,
        content: data.content || editing.content,
        cover_image: data.cover_image || editing.cover_image,
        category: data.category || editing.category,
        tags: data.tags || editing.tags,
        author_name: editing.author_name || '7 Zion AI',
        meta_title: data.meta_title || editing.meta_title,
        meta_description: data.meta_description || editing.meta_description,
      });
      setTimeout(() => setAiProgress(''), 3000);
    } catch (err: any) {
      console.error('Generation error:', err);
      setAiError(err.message || 'Erro ao gerar o post. Tente novamente.');
    } finally {
      setAiGenerating(false);
    }
  };

  // Generate cover image only
  const handleGenerateImage = async () => {
    if (!editing?.title?.trim()) return;
    setGeneratingImage(true);
    setAiError('');
    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-blog', {
        body: {
          topic: editing.title,
          imageStyle,
          imageOnly: true,
          customImagePrompt: useCustomPrompt ? customImagePrompt : undefined,
        },
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      if (data?.cover_image) {
        setEditing({ ...editing, cover_image: data.cover_image });
      }
    } catch (err: any) {
      console.error('Image generation error:', err);
      setAiError(err.message || 'Erro ao gerar imagem.');
    } finally {
      setGeneratingImage(false);
    }
  };

  // ── Topic Generator ──
  const handleGenerateTopics = async () => {
    if (!niche.trim()) return;
    setGeneratingTopics(true);
    setTopicError('');
    setTopicSuggestions([]);
    setSelectedTopics(new Set());
    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-blog', {
        body: { generateTopics: true, niche: niche.trim(), topicCount },
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      setTopicSuggestions(data.topics || []);
    } catch (err: any) {
      setTopicError(err.message || 'Erro ao gerar temas.');
    } finally {
      setGeneratingTopics(false);
    }
  };

  const toggleTopicSelection = (idx: number) => {
    setSelectedTopics(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const toggleAllTopics = () => {
    if (selectedTopics.size === topicSuggestions.length) {
      setSelectedTopics(new Set());
    } else {
      setSelectedTopics(new Set(topicSuggestions.map((_, i) => i)));
    }
  };

  // ── Queue Generation ──
  const handleStartQueue = async () => {
    const selected = Array.from(selectedTopics).map(i => topicSuggestions[i]);
    if (selected.length === 0) return;

    const items: QueueItem[] = selected.map(t => ({ topic: t, status: 'pending' as const }));
    setQueue(items);
    setQueueRunning(true);

    for (let i = 0; i < items.length; i++) {
      setQueue(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'generating' } : item));

      try {
        const { data, error: fnError } = await supabase.functions.invoke('generate-blog', {
          body: {
            topic: items[i].topic.title,
            imageStyle,
            customImagePrompt: useCustomPrompt ? customImagePrompt : undefined,
          },
        });
        if (fnError) throw fnError;
        if (data?.error) throw new Error(data.error);

        // Save as draft
        const payload = {
          title: data.title || items[i].topic.title,
          slug: data.slug || slugify(data.title || items[i].topic.title),
          excerpt: data.excerpt || '',
          content: data.content || '',
          cover_image: data.cover_image || null,
          category: data.category || '',
          tags: data.tags || [],
          author_name: '7 Zion AI',
          meta_title: data.meta_title || '',
          meta_description: data.meta_description || '',
          published: false,
        };

        const { data: inserted, error: insertErr } = await supabase.from('blog_posts').insert(payload).select('id').single();
        if (insertErr) throw insertErr;

        setQueue(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'done', postId: inserted?.id } : item));
      } catch (err: any) {
        setQueue(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'error', error: err.message } : item));
      }

      // Delay between requests to avoid rate limits
      if (i < items.length - 1) {
        await new Promise(r => setTimeout(r, 3000));
      }
    }

    setQueueRunning(false);
    fetchPosts();
  };

  // ── Cyclic Scheduling ──
  const getFrequencyDays = (freq: string): number => {
    switch (freq) {
      case '1x': return 7;
      case '2x': return 3.5;
      case '3x': return 7 / 3;
      case 'daily': return 1;
      default: return 7;
    }
  };

  const handleApplySchedule = async () => {
    if (!scheduleStartDate) return;
    const drafts = posts.filter(p => !p.published && !p.scheduled_at);
    if (drafts.length === 0) return;

    const intervalDays = getFrequencyDays(scheduleFrequency);
    const start = new Date(scheduleStartDate);

    for (let i = 0; i < drafts.length; i++) {
      const scheduledDate = new Date(start.getTime() + i * intervalDays * 86400000);
      await supabase.from('blog_posts').update({ scheduled_at: scheduledDate.toISOString() }).eq('id', drafts[i].id);
    }

    setShowScheduler(false);
    fetchPosts();
  };

  // ── Editor View ──
  if (editing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-foreground">{isNew ? 'Novo Post' : 'Editar Post'}</h3>
          <div className="flex gap-2">
            <button onClick={() => { setEditing(null); setIsNew(false); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-muted-foreground font-bold text-sm hover:bg-secondary/80">
              <X className="w-4 h-4" /> Cancelar
            </button>
            <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg hover:scale-[1.02] transition-transform" style={{ background: 'linear-gradient(135deg, #5766fe, #820dd1)' }}>
              <Save className="w-4 h-4" /> Salvar
            </button>
          </div>
        </div>

        {/* AI Generation Panel */}
        <div className="bg-card rounded-2xl border-2 border-purple-500/20 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h4 className="text-sm font-black text-foreground uppercase tracking-wider">Gerar com IA</h4>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Tema do Post</label>
                <textarea
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="Ex: Como usar inteligência artificial no marketing digital..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/40 resize-none text-sm"
                  disabled={aiGenerating}
                />
              </div>
              <button
                onClick={handleAIGenerate}
                disabled={aiGenerating || !aiTopic.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm shadow-lg disabled:opacity-50 transition-all"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #d946ef)' }}
              >
                {aiGenerating ? <><Loader2 className="w-4 h-4 animate-spin" />{aiProgress}</> : <><Sparkles className="w-4 h-4" />Gerar Post Completo</>}
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5" /> Estilo da Imagem de Capa
              </label>
              <div className="grid grid-cols-2 gap-2">
                {IMAGE_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => { setImageStyle(style.id); setUseCustomPrompt(false); }}
                    disabled={aiGenerating || generatingImage}
                    className={`text-left p-3 rounded-xl border-2 transition-all ${
                      imageStyle === style.id && !useCustomPrompt ? 'border-purple-500 bg-purple-500/10' : 'border-border bg-secondary hover:border-muted-foreground/30'
                    }`}
                  >
                    <span className="text-xs font-black text-foreground block">{style.label}</span>
                    <span className="text-[10px] text-muted-foreground leading-tight">{style.description}</span>
                  </button>
                ))}
                {/* Custom prompt option */}
                <button
                  onClick={() => setUseCustomPrompt(true)}
                  disabled={aiGenerating || generatingImage}
                  className={`text-left p-3 rounded-xl border-2 transition-all col-span-2 ${
                    useCustomPrompt ? 'border-purple-500 bg-purple-500/10' : 'border-border bg-secondary hover:border-muted-foreground/30'
                  }`}
                >
                  <span className="text-xs font-black text-foreground block">✏️ Prompt Customizado</span>
                  <span className="text-[10px] text-muted-foreground">Escreva seu próprio prompt para a imagem</span>
                </button>
              </div>

              {useCustomPrompt && (
                <textarea
                  value={customImagePrompt}
                  onChange={(e) => setCustomImagePrompt(e.target.value)}
                  placeholder="Descreva a imagem que você deseja..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/40 resize-none text-sm"
                  disabled={aiGenerating || generatingImage}
                />
              )}

              <button
                onClick={handleGenerateImage}
                disabled={generatingImage || !editing.title?.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm shadow-lg disabled:opacity-50 transition-all bg-gradient-to-r from-purple-600 to-pink-600"
              >
                {generatingImage ? <><Loader2 className="w-4 h-4 animate-spin" />Gerando imagem...</> : <><ImageIcon className="w-4 h-4" />Gerar Apenas Capa</>}
              </button>
            </div>
          </div>

          {aiError && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm font-bold">{aiError}</div>
          )}
          {aiProgress && !aiGenerating && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-sm font-bold">{aiProgress}</div>
          )}
        </div>

        {/* Post editor fields */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Título</label>
              <input type="text" value={editing.title} onChange={(e) => {
                const val = e.target.value;
                if (isNew) {
                  updateEditingMultiple({ title: val, slug: slugify(val) });
                } else {
                  updateEditing('title', val);
                }
              }}
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-[#5766fe]/40 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Slug</label>
              <input type="text" value={editing.slug} onChange={(e) => updateEditing('slug', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-[#5766fe]/40 text-sm font-mono" />
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
              <p className="text-xs font-black text-emerald-600 mb-3 uppercase tracking-wider">🔍 SEO</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">Meta Title <span className="text-muted-foreground/50">({(editing.meta_title || '').length}/60)</span></label>
                  <input type="text" value={editing.meta_title || ''} onChange={(e) => updateEditing('meta_title', e.target.value)} maxLength={60}
                    className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">Meta Description <span className="text-muted-foreground/50">({(editing.meta_description || '').length}/155)</span></label>
                  <textarea value={editing.meta_description || ''} onChange={(e) => updateEditing('meta_description', e.target.value)} maxLength={155} rows={2}
                    className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-none text-sm" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Resumo</label>
              <textarea value={editing.excerpt || ''} onChange={(e) => updateEditing('excerpt', e.target.value)} rows={3}
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-[#5766fe]/40 resize-none text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Categoria</label>
              <input type="text" value={editing.category || ''} onChange={(e) => updateEditing('category', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-[#5766fe]/40 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Tags (separadas por vírgula)</label>
              <input type="text" value={(editing.tags || []).join(', ')} onChange={(e) => updateEditing('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-[#5766fe]/40 text-sm" />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Imagem de Capa</label>
              <div className="flex flex-col gap-3">
                {editing.cover_image && <img src={editing.cover_image} alt="Cover" className="w-full h-48 object-cover rounded-xl border border-border" />}
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-secondary border border-border text-foreground hover:bg-secondary/80 transition-all text-sm font-bold">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? 'Enviando...' : 'Upload da capa'}
                </button>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                <input type="text" value={editing.cover_image || ''} onChange={(e) => updateEditing('cover_image', e.target.value)} placeholder="ou cole uma URL..."
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-[#5766fe]/40 text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Nome do Autor</label>
              <input type="text" value={editing.author_name || ''} onChange={(e) => updateEditing('author_name', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-[#5766fe]/40 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Avatar do Autor (URL)</label>
              <input type="text" value={editing.author_avatar || ''} onChange={(e) => updateEditing('author_avatar', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-[#5766fe]/40 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Bio do Autor (EEAT)</label>
              <textarea value={editing.author_bio || ''} onChange={(e) => updateEditing('author_bio', e.target.value)} rows={3}
                placeholder="Ex: Especialista em marketing digital com 10+ anos de experiência..."
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-[#5766fe]/40 resize-none text-sm" />
            </div>

            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
              <p className="text-xs font-black text-blue-500 mb-3 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Agendamento
              </p>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">Agendar publicação</label>
                <input type="datetime-local"
                  value={editing.scheduled_at ? new Date(editing.scheduled_at).toISOString().slice(0, 16) : ''}
                  onChange={(e) => updateEditing('scheduled_at', e.target.value ? new Date(e.target.value).toISOString() : null)}
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-sm" />
                <p className="text-xs text-muted-foreground mt-1.5">Deixe vazio para publicar imediatamente.</p>
              </div>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Publicado</label>
                <button onClick={() => updateEditing('published', !editing.published)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${editing.published ? 'bg-emerald-500' : 'bg-border'}`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-transform ${editing.published ? 'left-6' : 'left-0.5'}`} />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Star className="w-3 h-3" /> Banner
                </label>
                <button onClick={() => updateEditing('show_in_banner', !editing.show_in_banner)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${editing.show_in_banner ? 'bg-purple-500' : 'bg-border'}`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-transform ${editing.show_in_banner ? 'left-6' : 'left-0.5'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Conteúdo (HTML)</label>
          <textarea value={editing.content || ''} onChange={(e) => updateEditing('content', e.target.value)} rows={20}
            className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-[#5766fe]/40 resize-y text-sm font-mono" />
        </div>
      </div>
    );
  }

  // ── Main List View with Tabs ──
  return (
    <div className="space-y-6">
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="bg-secondary border border-border rounded-xl p-1 w-full justify-start">
          <TabsTrigger value="posts" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm font-bold text-sm">
            📝 Posts
          </TabsTrigger>
          <TabsTrigger value="generator" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm font-bold text-sm">
            <Wand2 className="w-3.5 h-3.5 mr-1.5" /> Gerador de Temas
          </TabsTrigger>
          <TabsTrigger value="schedule" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm font-bold text-sm">
            <Clock className="w-3.5 h-3.5 mr-1.5" /> Agendamento
          </TabsTrigger>
        </TabsList>

        {/* ── Tab: Posts ── */}
        <TabsContent value="posts">
          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-foreground">Posts do Blog</h3>
                <p className="text-sm text-muted-foreground">{postCounts.all} posts no total</p>
              </div>
              <button onClick={handleNew} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg hover:scale-[1.02] transition-transform" style={{ background: 'linear-gradient(135deg, #5766fe, #820dd1)' }}>
                <Plus className="w-4 h-4" /> Novo Post
              </button>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-2 flex-wrap">
              {([
                { key: 'all' as const, label: 'Todos', count: postCounts.all },
                { key: 'drafts' as const, label: 'Rascunhos', count: postCounts.drafts },
                { key: 'scheduled' as const, label: 'Programados', count: postCounts.scheduled },
                { key: 'published' as const, label: 'Postados', count: postCounts.published },
                { key: 'trash' as const, label: '🗑️ Lixeira', count: postCounts.trash },
              ]).map(f => (
                <button
                  key={f.key}
                  onClick={() => setPostFilter(f.key)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    postFilter === f.key
                      ? f.key === 'trash'
                        ? 'bg-destructive/10 text-destructive border border-destructive/30'
                        : 'bg-primary/10 text-primary border border-primary/30'
                      : 'bg-secondary text-muted-foreground border border-border hover:text-foreground'
                  }`}
                >
                  {f.label} <span className="ml-1 opacity-60">({f.count})</span>
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-2xl border border-border">
                <p className="text-lg font-black text-foreground mb-2">
                  {postFilter === 'trash' ? 'Lixeira vazia' : 'Nenhum post encontrado'}
                </p>
                <p className="text-muted-foreground text-sm">
                  {postFilter === 'trash' ? 'Posts excluídos aparecerão aqui.' : 'Nenhum post nesta categoria.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPosts.map(post => (
                  <div key={post.id} className={`bg-card rounded-2xl border p-5 flex items-center gap-4 ${postFilter === 'trash' ? 'border-destructive/20 opacity-75' : 'border-border'}`}>
                    {post.cover_image && <img src={post.cover_image} alt="" className="w-20 h-14 object-cover rounded-xl flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-foreground truncate flex items-center gap-2">
                        {post.title}
                        {post.show_in_banner && <Star className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        {post.category && <span className="font-bold" style={{ color: '#5766fe' }}>{post.category}</span>}
                        <span>{new Date(post.created_at).toLocaleDateString('pt-BR')}</span>
                        <span>{post.views_count || 0} views</span>
                        {post.scheduled_at && !post.published && (
                          <span className="flex items-center gap-1 text-blue-500 font-bold">
                            <Calendar className="w-3 h-3" /> {new Date(post.scheduled_at).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                        {(post as any).deleted_at && (
                          <span className="flex items-center gap-1 text-destructive font-bold">
                            <AlertTriangle className="w-3 h-3" /> Excluído em {new Date((post as any).deleted_at).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        (post as any).deleted_at ? 'bg-destructive/10 text-destructive' :
                        post.published ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'
                      }`}>
                        {(post as any).deleted_at ? 'Na Lixeira' : post.published ? 'Publicado' : post.scheduled_at ? 'Agendado' : 'Rascunho'}
                      </span>

                      {postFilter === 'trash' ? (
                        <>
                          <button onClick={() => handleRestore(post.id)} className="p-2 rounded-lg hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-500 transition-colors" title="Restaurar">
                            <RotateCcw className="w-4 h-4" />
                          </button>
                          <button onClick={() => handlePermanentDelete(post.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" title="Excluir permanentemente">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleTogglePublish(post)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" title={post.published ? 'Despublicar' : 'Publicar'}>
                            {post.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button onClick={() => { setEditing(post); setIsNew(false); }} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleMoveToTrash(post.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" title="Mover para lixeira">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Tab: Topic Generator ── */}
        <TabsContent value="generator">
          <div className="space-y-6 mt-4">
            <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
              <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-purple-500" /> Gerador de Temas com IA
              </h3>
              <p className="text-sm text-muted-foreground">Descreva o nicho ou assunto e a IA irá sugerir temas otimizados para SEO.</p>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Nicho / Assunto</label>
                <textarea
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="Ex: Marketing digital para pequenas empresas, e-commerce de moda sustentável..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/40 resize-none text-sm"
                  disabled={generatingTopics}
                />
              </div>

              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Quantidade</label>
                  <div className="flex gap-2">
                    {[2, 4, 6, 10].map(n => (
                      <button
                        key={n}
                        onClick={() => setTopicCount(n)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${topicCount === n ? 'bg-purple-500 text-white' : 'bg-secondary border border-border text-muted-foreground hover:text-foreground'}`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1" />

                <button
                  onClick={handleGenerateTopics}
                  disabled={generatingTopics || !niche.trim()}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm shadow-lg disabled:opacity-50 transition-all self-end"
                  style={{ background: 'linear-gradient(135deg, #8b5cf6, #d946ef)' }}
                >
                  {generatingTopics ? <><Loader2 className="w-4 h-4 animate-spin" />Gerando...</> : <><Sparkles className="w-4 h-4" />Gerar Temas</>}
                </button>
              </div>

              {topicError && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm font-bold">{topicError}</div>
              )}
            </div>

            {/* Topic results */}
            {topicSuggestions.length > 0 && (
              <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                    <ListChecks className="w-4 h-4" /> Temas Sugeridos ({topicSuggestions.length})
                  </h4>
                  <button onClick={toggleAllTopics} className="text-xs font-bold text-purple-500 hover:text-purple-400 transition-colors">
                    {selectedTopics.size === topicSuggestions.length ? 'Desmarcar todos' : 'Selecionar todos'}
                  </button>
                </div>

                <div className="space-y-2">
                  {topicSuggestions.map((topic, idx) => (
                    <button
                      key={idx}
                      onClick={() => toggleTopicSelection(idx)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 ${
                        selectedTopics.has(idx) ? 'border-purple-500 bg-purple-500/10' : 'border-border bg-secondary hover:border-muted-foreground/30'
                      }`}
                    >
                      {selectedTopics.has(idx) ? <CheckSquare className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" /> : <Square className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />}
                      <div>
                        <span className="text-sm font-bold text-foreground block">{topic.title}</span>
                        <span className="text-xs text-muted-foreground">{topic.description}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Image style for batch */}
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Estilo de Imagem para os Posts</label>
                  <div className="grid grid-cols-3 gap-2">
                    {IMAGE_STYLES.map(style => (
                      <button
                        key={style.id}
                        onClick={() => { setImageStyle(style.id); setUseCustomPrompt(false); }}
                        disabled={queueRunning}
                        className={`text-left p-2.5 rounded-lg border-2 transition-all ${
                          imageStyle === style.id && !useCustomPrompt ? 'border-purple-500 bg-purple-500/10' : 'border-border bg-secondary'
                        }`}
                      >
                        <span className="text-[11px] font-bold text-foreground block">{style.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleStartQueue}
                  disabled={selectedTopics.size === 0 || queueRunning}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-white font-black text-sm shadow-xl disabled:opacity-50 transition-all"
                  style={{ background: 'linear-gradient(135deg, #5766fe, #820dd1)' }}
                >
                  {queueRunning ? <><Loader2 className="w-4 h-4 animate-spin" />Gerando posts...</> : <><Sparkles className="w-4 h-4" />Gerar {selectedTopics.size} Post{selectedTopics.size > 1 ? 's' : ''} Selecionado{selectedTopics.size > 1 ? 's' : ''}</>}
                </button>
              </div>
            )}

            {/* Queue progress */}
            {queue.length > 0 && (
              <div className="bg-card rounded-2xl border border-border p-6 space-y-3">
                <h4 className="text-sm font-black text-foreground uppercase tracking-wider">Fila de Geração</h4>
                {queue.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-secondary border border-border">
                    {item.status === 'pending' && <div className="w-5 h-5 rounded-full bg-muted-foreground/20 flex-shrink-0" />}
                    {item.status === 'generating' && <Loader2 className="w-5 h-5 text-purple-500 animate-spin flex-shrink-0" />}
                    {item.status === 'done' && <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0"><span className="text-white text-xs">✓</span></div>}
                    {item.status === 'error' && <div className="w-5 h-5 rounded-full bg-destructive flex items-center justify-center flex-shrink-0"><span className="text-white text-xs">✗</span></div>}
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-bold text-foreground truncate block">{item.topic.title}</span>
                      {item.error && <span className="text-xs text-destructive">{item.error}</span>}
                    </div>
                    <span className={`text-xs font-bold ${
                      item.status === 'done' ? 'text-emerald-500' :
                      item.status === 'generating' ? 'text-purple-500' :
                      item.status === 'error' ? 'text-destructive' : 'text-muted-foreground'
                    }`}>
                      {item.status === 'pending' ? 'Pendente' : item.status === 'generating' ? 'Gerando...' : item.status === 'done' ? 'Concluído' : 'Erro'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Tab: Scheduling ── */}
        <TabsContent value="schedule">
          <div className="space-y-6 mt-4">
            <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
              <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" /> Agendamento Cíclico
              </h3>
              <p className="text-sm text-muted-foreground">
                Agende automaticamente os rascunhos não agendados em ciclo. Atualmente há <strong>{posts.filter(p => !p.published && !p.scheduled_at).length}</strong> rascunhos sem data.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Frequência</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: '1x', label: '1x / semana' },
                      { id: '2x', label: '2x / semana' },
                      { id: '3x', label: '3x / semana' },
                      { id: 'daily', label: 'Diário' },
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => setScheduleFrequency(f.id)}
                        className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${
                          scheduleFrequency === f.id ? 'border-blue-500 bg-blue-500/10 text-blue-600' : 'border-border bg-secondary text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Data de Início</label>
                  <input
                    type="date"
                    value={scheduleStartDate}
                    onChange={(e) => setScheduleStartDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-sm"
                  />
                </div>
              </div>

              {/* Preview of schedule */}
              {scheduleStartDate && (() => {
                const drafts = posts.filter(p => !p.published && !p.scheduled_at);
                if (drafts.length === 0) return null;
                const intervalDays = getFrequencyDays(scheduleFrequency);
                const start = new Date(scheduleStartDate);
                return (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pré-visualização</p>
                    {drafts.slice(0, 10).map((draft, i) => {
                      const d = new Date(start.getTime() + i * intervalDays * 86400000);
                      return (
                        <div key={draft.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary border border-border text-sm">
                          <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          <span className="font-bold text-blue-500 w-24 flex-shrink-0">{d.toLocaleDateString('pt-BR')}</span>
                          <span className="text-foreground truncate">{draft.title}</span>
                        </div>
                      );
                    })}
                    {drafts.length > 10 && <p className="text-xs text-muted-foreground">...e mais {drafts.length - 10} posts</p>}
                  </div>
                );
              })()}

              <button
                onClick={handleApplySchedule}
                disabled={!scheduleStartDate || posts.filter(p => !p.published && !p.scheduled_at).length === 0}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-white font-black text-sm shadow-xl disabled:opacity-50 transition-all"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
              >
                <Calendar className="w-4 h-4" /> Aplicar Agendamento
              </button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminBlogPage;
