import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRight, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import type { BlogPost } from '@/hooks/useBlogPosts';

const HeroBlogCard = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchBannerPosts = async () => {
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .eq('show_in_banner', true)
        .order('created_at', { ascending: false })
        .limit(10);
      if (data?.length) setPosts(data as BlogPost[]);
    };
    fetchBannerPosts();
  }, []);

  // Auto-rotate
  useEffect(() => {
    if (posts.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % posts.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [posts.length]);

  const goUp = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + posts.length) % posts.length);
  }, [posts.length]);

  const goDown = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % posts.length);
  }, [posts.length]);

  if (!posts.length) return null;

  const post = posts[currentIndex];

  return (
    <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20 hidden xl:flex flex-col items-end gap-4 animate-fade-in">
      <div className="relative w-[420px]">

        {/* Card */}
        <div className="relative ml-20 bg-white/[0.07] backdrop-blur-2xl rounded-3xl border border-white/[0.12] p-7 overflow-visible shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]">
          {post.category && (
            <span
              className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white mb-4"
              style={{ background: 'linear-gradient(135deg, #5766fe, #820dd1)' }}
            >
              {post.category}
            </span>
          )}

          <h3 className="text-lg font-black text-white leading-tight mb-3 line-clamp-2">
            {post.title}
          </h3>

          <p className="text-xs text-white/50 leading-relaxed mb-5 line-clamp-3">
            {post.excerpt}
          </p>

          <Link
            to={`/blog/${post.slug}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-black uppercase tracking-wider hover:scale-105 transition-transform shadow-lg"
            style={{ background: 'linear-gradient(135deg, #5766fe, #820dd1)' }}
          >
            Ver Mais <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Navigation arrows */}
      {posts.length > 1 && (
        <div className="flex items-center gap-3 mr-4">
          <button
            onClick={goUp}
            className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all"
            aria-label="Post anterior"
          >
            <ChevronUp className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <span className="text-[10px] text-white/30 font-bold tabular-nums">
            {currentIndex + 1}/{posts.length}
          </span>
          <button
            onClick={goDown}
            className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all"
            aria-label="Próximo post"
          >
            <ChevronDown className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
      )}
    </div>
  );
};

export default HeroBlogCard;
