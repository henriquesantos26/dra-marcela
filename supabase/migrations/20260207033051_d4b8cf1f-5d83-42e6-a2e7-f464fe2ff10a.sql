-- Add author_bio column for EEAT
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS author_bio TEXT;