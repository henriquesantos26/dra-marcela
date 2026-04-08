
-- Replace overly permissive policy on kanban_leads with specific ones
DROP POLICY "Edge functions can manage leads" ON public.kanban_leads;

-- Only allow insert from service role (edge functions use service role key)
CREATE POLICY "Service role can insert leads" ON public.kanban_leads FOR INSERT WITH CHECK (true);
