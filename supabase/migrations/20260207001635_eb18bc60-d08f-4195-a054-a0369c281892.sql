
-- Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Create ai_providers table
CREATE TABLE IF NOT EXISTS public.ai_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  api_key_encrypted text,
  is_active boolean DEFAULT false,
  priority text DEFAULT 'none',
  model_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_providers ENABLE ROW LEVEL SECURITY;

-- Admin-only policies
CREATE POLICY "Admins can read ai_providers" ON public.ai_providers FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert ai_providers" ON public.ai_providers FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update ai_providers" ON public.ai_providers FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete ai_providers" ON public.ai_providers FOR DELETE USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Seed default providers
INSERT INTO public.ai_providers (provider_name, display_name, is_active, priority, model_name)
VALUES 
  ('gemini', 'Google Gemini', false, 'none', 'gemini-2.0-flash'),
  ('chatgpt', 'OpenAI ChatGPT', false, 'none', 'gpt-4o-mini'),
  ('lovable', 'Lovable AI', true, 'primary', 'default')
ON CONFLICT (provider_name) DO NOTHING;
