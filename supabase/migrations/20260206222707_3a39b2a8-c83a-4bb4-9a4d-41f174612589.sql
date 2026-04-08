
-- Chat conversations
CREATE TABLE public.chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  visitor_name text,
  visitor_email text,
  status text NOT NULL DEFAULT 'ai_handling',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert conversations" ON public.chat_conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Visitors can read own conversations" ON public.chat_conversations FOR SELECT USING (true);
CREATE POLICY "Admins can update conversations" ON public.chat_conversations FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete conversations" ON public.chat_conversations FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Chat messages
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.chat_conversations(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL DEFAULT 'visitor',
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert messages" ON public.chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read messages" ON public.chat_messages FOR SELECT USING (true);

-- Chat agent config
CREATE TABLE public.chat_agent_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instructions text NOT NULL DEFAULT '',
  avoid_topics text NOT NULL DEFAULT '',
  fallback_message text NOT NULL DEFAULT '',
  greeting text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  temperature numeric NOT NULL DEFAULT 0.3,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_agent_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read agent config" ON public.chat_agent_config FOR SELECT USING (true);
CREATE POLICY "Admins can insert agent config" ON public.chat_agent_config FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update agent config" ON public.chat_agent_config FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete agent config" ON public.chat_agent_config FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Chat knowledge base
CREATE TABLE public.chat_knowledge (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL DEFAULT 'geral',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_knowledge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read knowledge" ON public.chat_knowledge FOR SELECT USING (true);
CREATE POLICY "Admins can insert knowledge" ON public.chat_knowledge FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update knowledge" ON public.chat_knowledge FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete knowledge" ON public.chat_knowledge FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default agent config
INSERT INTO public.chat_agent_config (instructions, avoid_topics, fallback_message, greeting, active, temperature)
VALUES (
  'Você é o assistente virtual da 7 Zion. Responda de forma educada e profissional. Use SOMENTE informações da base de conhecimento fornecida. Se a informação não estiver disponível, oriente o visitante a deixar seu email para contato.',
  'Não fale sobre preços de concorrentes. Não invente serviços ou funcionalidades. Não faça promessas de prazos ou resultados. Não compartilhe dados internos da empresa.',
  'Essa é uma ótima pergunta! Infelizmente não tenho essa informação no momento. Gostaria de deixar seu email para que nossa equipe entre em contato?',
  'Olá! 👋 Sou o assistente virtual da 7 Zion. Como posso ajudar você hoje?',
  true,
  0.3
);

-- Triggers for updated_at
CREATE TRIGGER update_chat_conversations_updated_at BEFORE UPDATE ON public.chat_conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_chat_agent_config_updated_at BEFORE UPDATE ON public.chat_agent_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
