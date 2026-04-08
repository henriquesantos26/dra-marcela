/**
 * @site EDITABLE - Site content component
 * @description Blog section for the landing page
 * @editable true
 * @module site
 */
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBlogPosts, BlogPost } from '@/hooks/useBlogPosts';
import { useSiteContent } from '@/contexts/SiteContentContext';

const BlogSection = () => {
  const { posts, loading } = useBlogPosts({ published: true, limit: 5 });
  const { content } = useSiteContent();
  const gradient = `linear-gradient(to right, ${content.branding.gradientFrom}, ${content.branding.gradientTo})`;

  if (loading || posts.length === 0) return null;

  const featured = posts[0];
  const rest = posts.slice(1, 5);

  return (
    <section className="px-6 py-32">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <h2 className="text-6xl font-black text-foreground mb-4 tracking-tighter">Blog</h2>
          <p className="text-muted-foreground text-xl font-medium">Insights, tendências e estratégias para o seu negócio.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Featured post */}
          <Link to={`/blog/${featured.slug}`} className="group relative rounded-[32px] overflow-hidden h-full min-h-[500px] border border-border flex">
            <img
              src={featured.cover_image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800'}
              alt={featured.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="relative z-10 h-full flex flex-col justify-end p-10">
              {featured.category && (
                <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-primary-foreground mb-4 w-fit" style={{ background: content.branding.buttonColor }}>
                  {featured.category}
                </span>
              )}
              <h3 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight leading-tight">{featured.title}</h3>
              {featured.excerpt && <p className="text-white/70 text-lg font-medium line-clamp-2">{featured.excerpt}</p>}
            </div>
          </Link>

          {/* Grid of smaller posts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {rest.map((post) => (
              <Link key={post.id} to={`/blog/${post.slug}`} className="group flex flex-col rounded-[24px] overflow-hidden border border-border bg-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="h-40 overflow-hidden">
                  <div
                    className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url(${post.cover_image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400'})` }}
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  {post.category && (
                    <span className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: content.branding.linkColor }}>
                      {post.category}
                    </span>
                  )}
                  <h4 className="text-lg font-black text-foreground mb-2 tracking-tight line-clamp-2 group-hover:text-primary transition-colors">{post.title}</h4>
                  {post.excerpt && <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>}
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="text-center mt-16">
          <Link
            to="/blog"
            className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-black text-lg shadow-xl hover:scale-105 transition-all text-primary-foreground"
            style={{ background: gradient }}
          >
            Ver todos os artigos <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
