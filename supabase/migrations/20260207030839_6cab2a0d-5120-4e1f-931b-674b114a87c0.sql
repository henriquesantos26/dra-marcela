
-- Create client_history table for tracking changes
CREATE TABLE public.client_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid NOT NULL,
  field_changed text NOT NULL,
  old_value text,
  new_value text,
  changed_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.client_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage client history" ON public.client_history
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can insert history" ON public.client_history
FOR INSERT WITH CHECK (true);

CREATE INDEX idx_client_history_client_id ON public.client_history (client_id);
