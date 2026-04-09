import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X, Star, Users, FolderTree } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const AdminBlogMeta = () => {
  const [authors, setAuthors] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Author form
  const [editingAuthor, setEditingAuthor] = useState<any>(null);
  const [isNewAuthor, setIsNewAuthor] = useState(false);

  // Category form
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isNewCategory, setIsNewCategory] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [authorsRes, categoriesRes] = await Promise.all([
      supabase.from('blog_authors').select('*').order('created_at', { ascending: false }),
      supabase.from('blog_categories').select(`*, default_author:blog_authors(id, name)`).order('created_at', { ascending: false })
    ]);
    if (authorsRes.data) setAuthors(authorsRes.data);
    if (categoriesRes.data) setCategories(categoriesRes.data);
    setLoading(false);
  };

  const handleSaveAuthor = async () => {
    if (!editingAuthor.name) return;
    
    // If setting as primary, unset others first
    if (editingAuthor.is_primary) {
      await supabase.from('blog_authors').update({ is_primary: false }).neq('id', '00000000-0000-0000-0000-000000000000');
    }

    if (isNewAuthor) {
      await supabase.from('blog_authors').insert({
        name: editingAuthor.name,
        avatar_url: editingAuthor.avatar_url,
        bio: editingAuthor.bio,
        is_primary: editingAuthor.is_primary
      });
    } else {
      await supabase.from('blog_authors').update({
        name: editingAuthor.name,
        avatar_url: editingAuthor.avatar_url,
        bio: editingAuthor.bio,
        is_primary: editingAuthor.is_primary
      }).eq('id', editingAuthor.id);
    }
    setEditingAuthor(null);
    setIsNewAuthor(false);
    fetchData();
  };

  const handleDeleteAuthor = async (id: string) => {
    if (!confirm('Excluir este autor?')) return;
    await supabase.from('blog_authors').delete().eq('id', id);
    fetchData();
  };

  const handleSaveCategory = async () => {
    if (!editingCategory.name || !editingCategory.slug) return;
    if (isNewCategory) {
      await supabase.from('blog_categories').insert({
        name: editingCategory.name,
        slug: editingCategory.slug,
        default_author_id: editingCategory.default_author_id || null
      });
    } else {
      await supabase.from('blog_categories').update({
        name: editingCategory.name,
        slug: editingCategory.slug,
        default_author_id: editingCategory.default_author_id || null
      }).eq('id', editingCategory.id);
    }
    setEditingCategory(null);
    setIsNewCategory(false);
    fetchData();
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Excluir esta categoria?')) return;
    await supabase.from('blog_categories').delete().eq('id', id);
    fetchData();
  };

  const toSlug = (text: string) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Carregando...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
      
      {/* AUTHORS SECTION */}
      <div className="space-y-4 bg-card rounded-2xl border border-border p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5"><Users className="w-32 h-32" /></div>
        <div className="flex items-center justify-between relative z-10">
          <h3 className="text-xl font-black flex items-center gap-2"><Users className="w-5 h-5 text-blue-500"/> Autores</h3>
          <button onClick={() => { setIsNewAuthor(true); setEditingAuthor({ name: '', avatar_url: '', bio: '', is_primary: false }); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-500 font-bold hover:bg-blue-500/20 text-sm transition-colors">
            <Plus className="w-4 h-4"/> Novo Autor
          </button>
        </div>

        {editingAuthor && (
          <div className="bg-secondary p-4 rounded-xl space-y-4 border border-border relative z-10">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase">Nome do Autor</label>
              <input type="text" value={editingAuthor.name} onChange={e => setEditingAuthor({...editingAuthor, name: e.target.value})} className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase">URL do Avatar da Foto (Opcional)</label>
              <input type="text" value={editingAuthor.avatar_url || ''} onChange={e => setEditingAuthor({...editingAuthor, avatar_url: e.target.value})} className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase">Biografia Breve (Opcional)</label>
              <textarea value={editingAuthor.bio || ''} onChange={e => setEditingAuthor({...editingAuthor, bio: e.target.value})} rows={2} className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border text-sm resize-none" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="primary-author" checked={editingAuthor.is_primary} onChange={e => setEditingAuthor({...editingAuthor, is_primary: e.target.checked})} className="rounded text-blue-500" />
              <label htmlFor="primary-author" className="text-sm font-bold text-foreground">Autor Principal do Blog</label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditingAuthor(null)} className="px-3 py-1.5 rounded-lg font-bold text-sm text-muted-foreground hover:bg-secondary border border-transparent">Cancelar</button>
              <button onClick={handleSaveAuthor} className="px-3 py-1.5 rounded-lg font-bold text-sm bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-1"><Save className="w-4 h-4"/> Salvar</button>
            </div>
          </div>
        )}

        <div className="space-y-3 relative z-10">
          {authors.length === 0 && !editingAuthor && <p className="text-sm text-muted-foreground">Nenhum autor cadastrado.</p>}
          {authors.map(author => (
            <div key={author.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-border bg-background/50 gap-4">
              <div className="flex items-center gap-3">
                {author.avatar_url ? (
                  <img src={author.avatar_url} alt={author.name} className="w-10 h-10 rounded-full object-cover border border-border" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground font-bold">{author.name.charAt(0)}</div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{author.name}</span>
                    {author.is_primary && <span className="bg-yellow-500/10 text-yellow-600 text-[10px] uppercase font-black px-1.5 py-0.5 rounded flex items-center gap-0.5"><Star className="w-3 h-3 fill-yellow-500"/> Principal</span>}
                  </div>
                  {author.bio && <p className="text-xs text-muted-foreground line-clamp-1">{author.bio}</p>}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => { setEditingAuthor(author); setIsNewAuthor(false); }} className="p-1.5 text-muted-foreground hover:text-foreground bg-secondary rounded-lg"><Edit2 className="w-4 h-4"/></button>
                <button onClick={() => handleDeleteAuthor(author.id)} className="p-1.5 text-muted-foreground hover:text-destructive bg-destructive/10 rounded-lg"><Trash2 className="w-4 h-4"/></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CATEGORIES SECTION */}
      <div className="space-y-4 bg-card rounded-2xl border border-border p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5"><FolderTree className="w-32 h-32" /></div>
        <div className="flex items-center justify-between relative z-10">
          <h3 className="text-xl font-black flex items-center gap-2"><FolderTree className="w-5 h-5 text-emerald-500"/> Categorias</h3>
          <button onClick={() => { setIsNewCategory(true); setEditingCategory({ name: '', slug: '', default_author_id: '' }); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 font-bold hover:bg-emerald-500/20 text-sm transition-colors">
            <Plus className="w-4 h-4"/> Nova Categoria
          </button>
        </div>

        {editingCategory && (
          <div className="bg-secondary p-4 rounded-xl space-y-4 border border-border relative z-10">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase">Nome da Categoria</label>
              <input type="text" value={editingCategory.name} onChange={e => setEditingCategory({...editingCategory, name: e.target.value, slug: toSlug(e.target.value)})} className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase">Slug (URL amigável)</label>
              <input type="text" value={editingCategory.slug} onChange={e => setEditingCategory({...editingCategory, slug: toSlug(e.target.value)})} className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border text-sm font-mono" />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase">Autor Padrão para esta Categoria</label>
              <select value={editingCategory.default_author_id || ''} onChange={e => setEditingCategory({...editingCategory, default_author_id: e.target.value})} className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border text-sm">
                <option value="">(Nenhum / Escolha da IA)</option>
                {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditingCategory(null)} className="px-3 py-1.5 rounded-lg font-bold text-sm text-muted-foreground hover:bg-secondary border border-transparent">Cancelar</button>
              <button onClick={handleSaveCategory} className="px-3 py-1.5 rounded-lg font-bold text-sm bg-emerald-500 text-white hover:bg-emerald-600 flex items-center gap-1"><Save className="w-4 h-4"/> Salvar</button>
            </div>
          </div>
        )}

        <div className="space-y-3 relative z-10">
          {categories.length === 0 && !editingCategory && <p className="text-sm text-muted-foreground">Nenhuma categoria cadastrada.</p>}
          {categories.map(category => (
            <div key={category.id} className="flex items-center justify-between p-3 rounded-xl border border-border bg-background/50">
              <div>
                <span className="font-bold text-foreground block">{category.name}</span>
                <span className="text-xs text-muted-foreground font-mono bg-secondary px-1.5 py-0.5 rounded mt-1 inline-block">/blog/{category.slug}</span>
                {category.default_author && (
                  <span className="ml-2 text-xs text-muted-foreground bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded">
                    Autor: {category.default_author.name}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => { setEditingCategory(category); setIsNewCategory(false); }} className="p-1.5 text-muted-foreground hover:text-foreground bg-secondary rounded-lg"><Edit2 className="w-4 h-4"/></button>
                <button onClick={() => handleDeleteCategory(category.id)} className="p-1.5 text-muted-foreground hover:text-destructive bg-destructive/10 rounded-lg"><Trash2 className="w-4 h-4"/></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
