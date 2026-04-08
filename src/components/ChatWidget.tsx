import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';
import { onChatTrigger } from '@/hooks/useChatTrigger';

interface ChatMessage {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

const getSessionId = () => {
  let sid = sessionStorage.getItem('chat_session_id');
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem('chat_session_id', sid);
  }
  return sid;
};

const ChatWidget = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [greeting, setGreeting] = useState('Olá! 👋 Como posso ajudar?');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef(getSessionId());

  const isHidden = location.pathname.startsWith('/admin') || location.pathname.startsWith('/acessar');

  // Load greeting
  useEffect(() => {
    supabase
      .from('chat_agent_config')
      .select('greeting')
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data?.greeting) setGreeting(data.greeting);
      });
  }, []);

  // Load existing conversation
  useEffect(() => {
    if (!open) return;
    const loadConversation = async () => {
      const { data: conv } = await supabase
        .from('chat_conversations')
        .select('id')
        .eq('session_id', sessionId.current)
        .neq('status', 'closed')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (conv) {
        setConversationId(conv.id);
        const { data: msgs } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: true });
        if (msgs) setMessages(msgs as ChatMessage[]);
      }
    };
    loadConversation();
  }, [open]);

  // Realtime subscription
  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `conversation_id=eq.${conversationId}` },
      (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages((prev) => {
            // Deduplicate by id OR by content+role (optimistic messages have temp ids)
            if (prev.some((m) => m.id === newMsg.id || (m.content === newMsg.content && m.role === newMsg.role))) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async (msg: string) => {
    if (!msg.trim() || sending) return;
    setSending(true);

    const tempId = crypto.randomUUID();
    setMessages((prev) => [...prev, { id: tempId, role: 'visitor', content: msg, created_at: new Date().toISOString() }]);

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const utm_source = urlParams.get('utm_source') || undefined;
      const utm_medium = urlParams.get('utm_medium') || undefined;
      const utm_campaign = urlParams.get('utm_campaign') || undefined;

      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: { conversation_id: conversationId, message: msg, session_id: sessionId.current, utm_source, utm_medium, utm_campaign },
      });

      if (error) throw error;
      if (data?.conversation_id && !conversationId) {
        setConversationId(data.conversation_id);
      }

      if (data?.reply) {
        setMessages((prev) => {
          const hasReply = prev.some((m) => m.content === data.reply && m.role === 'assistant');
          if (hasReply) return prev;
          return [...prev, { id: crypto.randomUUID(), role: 'assistant', content: data.reply, created_at: new Date().toISOString() }];
        });
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', content: 'Desculpe, ocorreu um erro. Tente novamente.', created_at: new Date().toISOString() },
      ]);
    } finally {
      setSending(false);
    }
  }, [conversationId, sending]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const msg = input.trim();
    setInput('');
    await sendMessage(msg);
  };

  // Listen for hero input triggers
  useEffect(() => {
    return onChatTrigger((message) => {
      setOpen(true);
      // Small delay to let the panel render before sending
      setTimeout(() => {
        sendMessage(message);
      }, 300);
    });
  }, [sendMessage]);

  if (isHidden) return null;

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-[90] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform"
          style={{ background: 'linear-gradient(135deg, #5766fe, #820dd1)' }}
          aria-label="Abrir chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-[90] w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-3rem)] rounded-3xl overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-white/10 flex flex-col"
          style={{ background: 'hsl(240 20% 6%)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10" style={{ background: 'linear-gradient(135deg, #5766fe, #820dd1)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-black text-white">7 Zion</p>
                <p className="text-[10px] text-white/70 font-bold">Online agora</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar">
            {messages.length === 0 && (
              <div className="flex justify-start">
                <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-bl-md text-sm font-medium bg-white/10 text-white/90">
                  {greeting}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'visitor' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm font-medium whitespace-pre-wrap ${
                    msg.role === 'visitor'
                      ? 'rounded-br-md text-white'
                      : 'rounded-bl-md bg-white/10 text-white/90'
                  }`}
                  style={msg.role === 'visitor' ? { background: 'linear-gradient(135deg, #5766fe, #820dd1)' } : undefined}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-white/10">
                  <Loader2 className="w-4 h-4 animate-spin text-white/60" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/10">
            <div className="flex items-center gap-2 bg-white/5 rounded-2xl px-4 py-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Digite sua mensagem..."
                className="flex-1 bg-transparent text-white text-sm placeholder-white/30 outline-none font-medium"
                disabled={sending}
              />
              <button
                onClick={handleSend}
                disabled={sending || !input.trim()}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white disabled:opacity-30 transition-all hover:scale-110"
                style={{ background: 'linear-gradient(135deg, #5766fe, #820dd1)' }}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
