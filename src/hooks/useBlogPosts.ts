import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type BlogPost = Tables<'blog_posts'>;

export const useBlogPosts = (options?: { published?: boolean; limit?: number; category?: string }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      let query = supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (options?.published !== undefined) {
        query = query.eq('published', options.published);
      }
      if (options?.category) {
        query = query.eq('category', options.category);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) console.error('Blog fetch error:', error);
      setPosts((data || []) as BlogPost[]);
      setLoading(false);
    };
    fetch();
  }, [options?.published, options?.limit, options?.category]);

  return { posts, loading };
};

export const useBlogPost = (slug: string) => {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    const fetch = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) console.error('Blog post fetch error:', error);
      setPost(data as BlogPost | null);

      // Increment views
      if (data) {
        supabase
          .from('blog_posts')
          .update({ views_count: (data.views_count || 0) + 1 })
          .eq('id', data.id)
          .then(() => {});
      }
      setLoading(false);
    };
    fetch();
  }, [slug]);

  return { post, loading };
};
