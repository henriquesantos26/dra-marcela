import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSiteContent } from '@/contexts/SiteContentContext';
import type { BlogPost } from '@/hooks/useBlogPosts';
import { Navbar, Footer } from '@/components/LandingSections';
import SEOHead from '@/components/SEOHead';

type SortMode = 'recent' | 'popular';

const BlogPage = () => {
  const { content } = useSiteContent();
  const gradient = `linear-gradient(to right, ${content.branding.gradientFrom}, ${content.branding.gradientTo})`;

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('recent');

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      let query = supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true);

      if (sortMode === 'popular') {
        query = query.order('views_count', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data } = await query;
      const allPosts = (data || []) as BlogPost[];
      const cats = [...new Set(allPosts.map(p => p.category).filter(Boolean))] as string[];
      setCategories(cats);

      if (activeCategory) {
        setPosts(allPosts.filter(p => p.category === activeCategory));
      } else {
        setPosts(allPosts);
      }
      setLoading(false);
    };
    fetchPosts();
  }, [sortMode, activeCategory]);

  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: '7 Zion Blog',
    description: 'Insights, tendências e estratégias de marketing digital para acelerar o seu negócio.',
    url: `${window.location.origin}/blog`,
    publisher: {
      '@type': 'Organization',
      name: '7 Zion',
      logo: { '@type': 'ImageObject', url: `${window.location.origin}/images/logo.png` },
    },
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <SEOHead
        title="Blog | 7 Zion - Marketing Digital & Tecnologia"
        description="Insights, tendências e estratégias de marketing digital para acelerar o seu negócio. Artigos sobre SEO, Google Ads, branding e mais."
        canonicalUrl={`${window.location.origin}/blog`}
        jsonLd={blogJsonLd}
      />
      <Navbar />

      {/* Header */}
      <header className="pt-32 pb-16 px-6 bg-rocket-dark text-primary-foreground">
        <div className="max-w-7xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary-foreground transition-colors mb-8 text-sm font-bold">
            <ArrowLeft className="w-4 h-4" /> Voltar ao site
          </Link>
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter mb-4">Blog</h1>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl">Insights, tendências e estratégias de marketing digital para acelerar o seu negócio.</p>
        </div>
      </header>

      {/* Filters */}
      <nav className="bg-secondary border-b border-border sticky top-0 z-40" aria-label="Filtros do blog">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 mr-4">
            <button onClick={() => setSortMode('recent')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${sortMode === 'recent' ? 'text-primary-foreground shadow-lg' : 'bg-card text-muted-foreground hover:text-foreground'}`}
              style={sortMode === 'recent' ? { background: gradient } : undefined}
            >
              <Clock className="w-4 h-4" /> Recentes
            </button>
            <button onClick={() => setSortMode('popular')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${sortMode === 'popular' ? 'text-primary-foreground shadow-lg' : 'bg-card text-muted-foreground hover:text-foreground'}`}
              style={sortMode === 'popular' ? { background: gradient } : undefined}
            >
              <TrendingUp className="w-4 h-4" /> Populares
            </button>
          </div>

          <div className="h-6 w-px bg-border hidden sm:block" />

          <button onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${!activeCategory ? 'bg-foreground text-background shadow-lg' : 'bg-card text-muted-foreground hover:text-foreground'}`}
          >
            Todas
          </button>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeCategory === cat ? 'bg-foreground text-background shadow-lg' : 'bg-card text-muted-foreground hover:text-foreground'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </nav>

      {/* Posts Grid */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        {loading ? (
          <div className="flex justify-center py-32">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-2xl font-black text-foreground mb-2">Nenhum post encontrado</p>
            <p className="text-muted-foreground">Ainda não há artigos publicados nesta categoria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map(post => (
              <Link key={post.id} to={`/blog/${post.slug}`}
                className="group flex flex-col rounded-[24px] overflow-hidden border border-border bg-card hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="h-52 overflow-hidden">
                  <img
                    src={post.cover_image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600'}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-3 mb-3">
                    {post.category && (
                      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: content.branding.linkColor }}>
                        {post.category}
                      </span>
                    )}
                    <time className="text-xs text-muted-foreground" dateTime={post.created_at}>
                      {new Date(post.created_at).toLocaleDateString('pt-BR')}
                    </time>
                  </div>
                  <h2 className="text-xl font-black text-foreground mb-3 tracking-tight line-clamp-2 group-hover:text-primary transition-colors">{post.title}</h2>
                  {post.excerpt && <p className="text-muted-foreground text-sm line-clamp-3 flex-1">{post.excerpt}</p>}
                  <div className="mt-4 flex items-center gap-3">
                    {post.author_avatar && <img src={post.author_avatar} alt={post.author_name || ''} className="w-8 h-8 rounded-full" />}
                    {post.author_name && <span className="text-sm font-bold text-foreground">{post.author_name}</span>}
                    <span className="text-xs text-muted-foreground ml-auto">{post.views_count || 0} views</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default BlogPage;
