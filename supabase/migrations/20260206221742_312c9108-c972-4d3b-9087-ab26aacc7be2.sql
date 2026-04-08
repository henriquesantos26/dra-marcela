
-- Add scheduled_at column for post scheduling
ALTER TABLE public.blog_posts ADD COLUMN scheduled_at timestamp with time zone DEFAULT NULL;

-- Add meta_title and meta_description for SEO
ALTER TABLE public.blog_posts ADD COLUMN meta_title text DEFAULT NULL;
ALTER TABLE public.blog_posts ADD COLUMN meta_description text DEFAULT NULL;
