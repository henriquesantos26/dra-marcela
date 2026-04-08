CREATE TABLE public.whatsapp_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_name text,
  instance_status text NOT NULL DEFAULT 'disconnected',
  qr_code text,
  notifications_enabled boolean NOT NULL DEFAULT false,
  notify_new_lead boolean NOT NULL DEFAULT false,
  notify_new_chat boolean NOT NULL DEFAULT false,
  notify_form_submission boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.whatsapp_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage whatsapp_config"
  ON public.whatsapp_config
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can manage whatsapp_config"
  ON public.whatsapp_config
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);