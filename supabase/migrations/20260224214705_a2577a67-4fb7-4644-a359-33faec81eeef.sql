
CREATE TABLE public.tracking_scripts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  head_code TEXT DEFAULT '',
  body_code TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tracking_scripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage tracking scripts"
ON public.tracking_scripts
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.tracking_scripts (name, slug, head_code, body_code, is_active) VALUES
  ('Google Tag Manager', 'gtm', '', '', false),
  ('Google Analytics', 'ga', '', '', false),
  ('Meta Pixel', 'meta-pixel', '', '', false),
  ('Meta API (Conversions)', 'meta-api', '', '', false),
  ('Meta Domain Verification', 'meta-domain', '', '', false),
  ('Google Search Console', 'gsc', '', '', false);

CREATE TRIGGER update_tracking_scripts_updated_at
BEFORE UPDATE ON public.tracking_scripts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
