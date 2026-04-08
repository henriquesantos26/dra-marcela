import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Eye, User, Tag, Clock, List } from 'lucide-react';
import { useBlogPost } from '@/hooks/useBlogPosts';
import { supabase } from '@/integrations/supabase/client';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { Navbar, Footer } from '@/components/LandingSections';
import SEOHead from '@/components/SEOHead';
import type { BlogPost } from '@/hooks/useBlogPosts';

/* ── helpers ── */
const extractHeadings = (html: string) => {
  const regex = /<h([23])\s*(?:id="([^"]*)")?[^>]*>(.*?)<\/h[23]>/gi;
  const headings: {
    level: number;
    id: string;
    text: string;
  }[] = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    const text = match[3].replace(/<[^>]*>/g, '');
    const id = match[2] || text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    headings.push({
      level: parseInt(match[1]),
      id,
      text
    });
  }
  return headings;
};
const addIdsToHeadings = (html: string) => {
  return html.replace(/<h([23])(\s[^>]*)?>([^<]*)<\/h[23]>/gi, (full, level, attrs, text) => {
    if (attrs && attrs.includes('id=')) return full;
    const id = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return `<h${level} id="${id}"${attrs || ''}>${text}</h${level}>`;
  });
};
const calcReadingTime = (html: string) => {
  const text = html.replace(/<[^>]*>/g, '');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};

/* ── component ── */
const BlogPostPage = () => {
  const {
    slug
  } = useParams<{
    slug: string;
  }>();
  const {
    post,
    loading
  } = useBlogPost(slug || '');
  const {
    content
  } = useSiteContent();
  const [latestPosts, setLatestPosts] = useState<BlogPost[]>([]);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [tocOpen, setTocOpen] = useState(true);
  const processedContent = useMemo(() => {
    if (!post?.content) return '';
    return addIdsToHeadings(post.content);
  }, [post?.content]);
  const headings = useMemo(() => extractHeadings(processedContent), [processedContent]);
  const readingTime = useMemo(() => post?.content ? calcReadingTime(post.content) : 0, [post?.content]);
  useEffect(() => {
    const fetchSidebar = async () => {
      const {
        data: latest
      } = await supabase.from('blog_posts').select('*').eq('published', true).order('created_at', {
        ascending: false
      }).limit(5);
      setLatestPosts((latest || []) as BlogPost[]);
    };
    fetchSidebar();
  }, []);
  useEffect(() => {
    if (!post) return;
    const fetchRelated = async () => {
      let query = supabase.from('blog_posts').select('*').eq('published', true).neq('id', post.id).limit(4);
      if (post.category) query = query.eq('category', post.category);
      const {
        data
      } = await query;
      setRelatedPosts((data || []) as BlogPost[]);
    };
    fetchRelated();
  }, [post?.id, post?.category]);
  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>;
  }
  if (!post) {
    return <div className="min-h-screen bg-background font-sans">
        <Navbar />
        <div className="pt-40 text-center px-6">
          <h1 className="text-4xl font-black text-foreground mb-4">Post não encontrado</h1>
          <Link to="/blog" className="text-primary font-bold hover:underline">Voltar ao blog</Link>
        </div>
        <Footer />
      </div>;
  }
  const ctaBg = content.branding.blogCtaBackground || content.branding.gradientFrom;
  const seoTitle = post.meta_title || post.title;
  const seoDescription = post.meta_description || post.excerpt || '';
  const canonicalUrl = `${window.location.origin}/blog/${post.slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: seoTitle,
    description: seoDescription,
    image: post.cover_image || undefined,
    datePublished: post.created_at,
    dateModified: post.updated_at,
    author: post.author_name ? {
      '@type': 'Person',
      name: post.author_name,
      ...(post.author_bio ? {
        description: post.author_bio
      } : {}),
      ...(post.author_avatar ? {
        image: post.author_avatar
      } : {})
    } : undefined,
    publisher: {
      '@type': 'Organization',
      name: '7 Zion',
      logo: {
        '@type': 'ImageObject',
        url: `${window.location.origin}/images/logo.png`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl
    },
    keywords: (post.tags || []).join(', '),
    wordCount: post.content ? post.content.replace(/<[^>]*>/g, '').split(/\s+/).length : undefined
  };
  return <div className="min-h-screen bg-background font-sans">
      <SEOHead title={`${seoTitle} | 7 Zion Blog`} description={seoDescription} canonicalUrl={canonicalUrl} ogImage={post.cover_image || undefined} ogType="article" jsonLd={jsonLd} />
      <Navbar />

      {/* Hero - banner starts from top, behind navbar */}
      <header className="relative">
        <div className="h-[500px] md:h-[600px] relative overflow-visible">
          <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: `url(${post.cover_image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200'})`
        }} />
          {/* Top gradient for navbar readability */}
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/70 to-transparent z-[1]" />
          {/* Bottom gradient to blend into content */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent px-[25px] opacity-80 border-[#050506] bg-[#070708] text-[#0d0f11]" />

        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 -mt-40 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main content */}
          <article className="flex-1 min-w-0">
            <Link to="/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm font-bold">
              <ArrowLeft className="w-4 h-4" /> Voltar ao blog
            </Link>

            {post.category && <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-primary-foreground mb-4" style={{
            background: content.branding.buttonColor
          }}>
                {post.category}
              </span>}

            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight leading-tight mb-6">{post.title}</h1>

            <div className="flex flex-wrap items-center gap-6 mb-6 text-sm text-muted-foreground">
              {post.author_name && <div className="flex items-center gap-2">
                  {post.author_avatar && <img src={post.author_avatar} alt={post.author_name} className="w-8 h-8 rounded-full" />}
                  <span className="font-bold text-foreground">{post.author_name}</span>
                </div>}
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <time dateTime={post.created_at}>{new Date(post.created_at).toLocaleDateString('pt-BR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}</time>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {readingTime} min de leitura
              </div>
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                {post.views_count || 0} visualizações
              </div>
            </div>

            {/* Author Bio (EEAT) */}
            {post.author_name && post.author_bio && <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border mb-8">
                {post.author_avatar && <img src={post.author_avatar} alt={post.author_name} className="w-12 h-12 rounded-full flex-shrink-0" />}
                <div>
                  <p className="text-sm font-bold text-foreground mb-1">Sobre {post.author_name}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{post.author_bio}</p>
                </div>
              </div>}

            {post.tags && post.tags.length > 0 && <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map((tag, i) => <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary text-xs font-bold text-muted-foreground border border-border">
                    <Tag className="w-3 h-3" /> {tag}
                  </span>)}
              </div>}

            {/* Table of Contents */}
            {headings.length > 2 && <nav className="bg-secondary rounded-2xl border border-border p-6 mb-8" aria-label="Índice do artigo">
                <button onClick={() => setTocOpen(!tocOpen)} className="flex items-center gap-2 w-full text-left">
                  <List className="w-4 h-4 text-primary" />
                  <span className="text-sm font-black text-foreground uppercase tracking-wider">Índice</span>
                  <span className="ml-auto text-xs text-muted-foreground">{tocOpen ? '▲' : '▼'}</span>
                </button>
                {tocOpen && <ol className="mt-4 space-y-2">
                    {headings.map((h, i) => <li key={i} className={h.level === 3 ? 'ml-5' : ''}>
                        <a href={`#${h.id}`} className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
                          {h.text}
                        </a>
                      </li>)}
                  </ol>}
              </nav>}

            <div className="prose prose-lg max-w-none text-foreground bg-card rounded-[32px] p-8 md:p-12 border border-border">
              {processedContent ? <div dangerouslySetInnerHTML={{
              __html: processedContent.replace(/\n/g, '<br/>')
            }} /> : <p className="text-muted-foreground italic">Sem conteúdo.</p>}
            </div>
          </article>

          {/* Sidebar */}
          <aside className="w-full lg:w-[360px] flex-shrink-0 space-y-8 lg:sticky lg:top-24 lg:self-start">
            {/* CTA Card */}
            <div className="rounded-[24px] p-8 text-primary-foreground" style={{
            background: `linear-gradient(135deg, ${ctaBg}, ${content.branding.gradientTo})`
          }}>
              <h3 className="text-2xl font-black mb-3 tracking-tight">Fique por dentro</h3>
              <p className="text-primary-foreground/80 text-sm mb-6 font-medium">Receba nossos melhores conteúdos direto no seu email.</p>
              <input type="email" placeholder="Seu melhor email" className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-primary-foreground placeholder-white/50 text-sm font-medium mb-3 outline-none focus:ring-2 focus:ring-white/30" />
              <button className="w-full py-3 rounded-xl bg-white text-foreground font-black text-sm hover:bg-white/90 transition-colors shadow-lg">
                Inscrever-se
              </button>
            </div>

            {/* Latest Posts */}
            <nav className="bg-card rounded-[24px] border border-border p-6" aria-label="Últimos posts">
              <h4 className="text-sm font-black text-foreground uppercase tracking-wider mb-4">Últimos Posts</h4>
              <div className="space-y-4">
                {latestPosts.filter(p => p.slug !== slug).slice(0, 4).map(p => <Link key={p.id} to={`/blog/${p.slug}`} className="flex gap-3 group">
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                      <div className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform" style={{
                    backgroundImage: `url(${p.cover_image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=200'})`
                  }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">{p.title}</h5>
                      <span className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </Link>)}
              </div>
            </nav>

            {/* Related Posts */}
            {relatedPosts.length > 0 && <nav className="bg-card rounded-[24px] border border-border p-6" aria-label="Posts relacionados">
                <h4 className="text-sm font-black text-foreground uppercase tracking-wider mb-4">Posts Relacionados</h4>
                <div className="space-y-4">
                  {relatedPosts.slice(0, 4).map(p => <Link key={p.id} to={`/blog/${p.slug}`} className="flex gap-3 group">
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                        <div className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform" style={{
                    backgroundImage: `url(${p.cover_image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=200'})`
                  }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">{p.title}</h5>
                        <div className="flex items-center gap-2">
                          {p.category && <span className="text-xs font-bold" style={{
                      color: content.branding.linkColor
                    }}>{p.category}</span>}
                          <span className="text-xs text-muted-foreground">{p.views_count || 0} views</span>
                        </div>
                      </div>
                    </Link>)}
                </div>
              </nav>}
          </aside>
        </div>
      </main>

      <div className="mt-20">
        <Footer />
      </div>
    </div>;
};
export default BlogPostPage;