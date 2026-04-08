
-- Add soft-delete column
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone DEFAULT NULL;

-- Update public read policy to exclude deleted posts
DROP POLICY IF EXISTS "Anyone can read published posts" ON public.blog_posts;
CREATE POLICY "Anyone can read published posts" ON public.blog_posts
  FOR SELECT TO public
  USING (published = true AND deleted_at IS NULL);
