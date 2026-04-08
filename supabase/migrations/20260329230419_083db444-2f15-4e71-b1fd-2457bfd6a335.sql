
-- Create site_sections table for dynamic page builder
CREATE TABLE public.site_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locale TEXT NOT NULL DEFAULT 'pt',
  section_type TEXT NOT NULL,
  section_data JSONB NOT NULL DEFAULT '{}',
  position INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_sections ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can read site sections"
  ON public.site_sections FOR SELECT
  TO public
  USING (true);

-- Admin write access
CREATE POLICY "Admins can insert site sections"
  ON public.site_sections FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update site sections"
  ON public.site_sections FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete site sections"
  ON public.site_sections FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Seed with current homepage sections
INSERT INTO public.site_sections (locale, section_type, position, is_visible) VALUES
  ('pt', 'hero', 0, true),
  ('pt', 'trustedBy', 1, true),
  ('pt', 'featureBanner', 2, true),
  ('pt', 'services', 3, true),
  ('pt', 'templates', 4, true),
  ('pt', 'stats', 5, true),
  ('pt', 'clientLogos', 6, true),
  ('pt', 'testimonials', 7, true),
  ('pt', 'blog', 8, true),
  ('pt', 'faq', 9, true),
  ('pt', 'footerCta', 10, true);

-- Also seed for 'en' locale
INSERT INTO public.site_sections (locale, section_type, position, is_visible) VALUES
  ('en', 'hero', 0, true),
  ('en', 'trustedBy', 1, true),
  ('en', 'featureBanner', 2, true),
  ('en', 'services', 3, true),
  ('en', 'templates', 4, true),
  ('en', 'stats', 5, true),
  ('en', 'clientLogos', 6, true),
  ('en', 'testimonials', 7, true),
  ('en', 'blog', 8, true),
  ('en', 'faq', 9, true),
  ('en', 'footerCta', 10, true);
