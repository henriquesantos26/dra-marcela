
-- Table to store page view analytics
CREATE TABLE public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text,
  page_url text NOT NULL,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  device_type text,
  browser text,
  os text,
  screen_width integer,
  screen_height integer,
  language text,
  country text,
  city text,
  region text,
  ip_hash text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Public can insert (tracking)
CREATE POLICY "Anyone can insert page views"
  ON public.page_views FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admins can read
CREATE POLICY "Admins can read page views"
  ON public.page_views FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Index for faster queries
CREATE INDEX idx_page_views_created_at ON public.page_views(created_at DESC);
CREATE INDEX idx_page_views_utm_source ON public.page_views(utm_source);
CREATE INDEX idx_page_views_country ON public.page_views(country);
CREATE INDEX idx_page_views_device ON public.page_views(device_type);
