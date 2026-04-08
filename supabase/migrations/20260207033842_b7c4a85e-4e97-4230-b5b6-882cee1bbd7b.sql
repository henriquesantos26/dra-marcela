
ALTER TABLE public.blog_posts ADD COLUMN show_in_banner boolean NOT NULL DEFAULT false;
ALTER TABLE public.blog_posts ADD COLUMN character_image text;
