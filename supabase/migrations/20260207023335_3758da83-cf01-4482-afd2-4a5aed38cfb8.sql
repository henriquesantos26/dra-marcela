
-- Kanban columns
CREATE TABLE public.kanban_columns (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  is_fixed boolean NOT NULL DEFAULT false,
  color text DEFAULT '#5766fe',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.kanban_columns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage kanban columns" ON public.kanban_columns FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Edge functions can read columns" ON public.kanban_columns FOR SELECT USING (true);

-- Insert fixed "Lead" column
INSERT INTO public.kanban_columns (name, position, is_fixed) VALUES ('Lead', 0, true);

-- Kanban leads
CREATE TABLE public.kanban_leads (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  phone text,
  email text,
  notes text,
  column_id uuid NOT NULL REFERENCES public.kanban_columns(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  conversation_id uuid REFERENCES public.chat_conversations(id) ON DELETE SET NULL,
  source text NOT NULL DEFAULT 'manual',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.kanban_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage kanban leads" ON public.kanban_leads FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Edge functions can manage leads" ON public.kanban_leads FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER update_kanban_leads_updated_at BEFORE UPDATE ON public.kanban_leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
