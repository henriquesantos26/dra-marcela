import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface AIResponse {
  content?: string;
  toolCalls?: any[];
  error?: string;
}

export async function getActiveProvider(supabase: any) {
  // Puxa provedores ordenados por prioridade (primary primeiro, depois backup)
  const { data: providers } = await supabase
    .from('ai_providers')
    .select('*')
    .eq('is_active', true)
    .order('priority', { ascending: true }); // 'backup', 'none', 'primary', ascending will put backup first? No, let's just fetch all and sort in JS to be safe.

  if (!providers || providers.length === 0) {
    throw new Error('Nenhum provedor de IA configurado ou ativo no sistema.');
  }

  // Sort: primary first, then backup, then none
  const sorted = providers.sort((a: any, b: any) => {
    const orders: Record<string, number> = { primary: 0, backup: 1, none: 2 };
    return (orders[a.priority] ?? 2) - (orders[b.priority] ?? 2);
  });

  return sorted;
}

export async function decryptKey(supabase: any, encryptedKey: string) {
  const { data, error } = await supabase.rpc('decrypt_api_key', { encrypted_key: encryptedKey });
  if (error || !data) throw new Error('Falha ao descriptografar chave de API');
  return data;
}

export async function callAI(supabase: any, systemPrompt: string, userPrompt: string, format?: any, tools?: any, toolChoice?: any) {
  const providers = await getActiveProvider(supabase);

  for (const provider of providers) {
    try {
      if (!provider.api_key_encrypted) continue;
      const apiKey = await decryptKey(supabase, provider.api_key_encrypted);
      
      if (provider.provider_name === 'gemini') {
        const model = provider.model_name || 'gemini-1.5-flash';
        return await callGemini(apiKey, model, systemPrompt, userPrompt, tools);
      } 
      else if (provider.provider_name === 'chatgpt') {
        const model = provider.model_name || 'gpt-4o-mini';
        return await callChatGPT(apiKey, model, systemPrompt, userPrompt, tools, format);
      }
    } catch (err: any) {
      console.error(`Falha no provedor ${provider.provider_name}:`, err);
      // Try next provider (failover)
      continue;
    }
  }

  throw new Error('Todos os provedores de IA falharam ou estão indisponíveis.');
}

async function callChatGPT(apiKey: string, model: string, systemPrompt: string, userPrompt: string, tools?: any, format?: any): Promise<AIResponse> {
  const messages = [];
  if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
  messages.push({ role: "user", content: userPrompt });

  const payload: any = {
    model,
    messages
  };

  if (format) {
    payload.response_format = format;
  }
  if (tools) {
    payload.tools = tools;
    payload.tool_choice = "auto";
  }

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!resp.ok) {
    throw new Error(`OpenAI error: ${resp.status} ${await resp.text()}`);
  }

  const data = await resp.json();
  const msg = data.choices?.[0]?.message;

  if (msg?.tool_calls) {
    return { toolCalls: msg.tool_calls };
  }

  return { content: msg?.content };
}

async function callGemini(apiKey: string, model: string, systemPrompt: string, userPrompt: string, tools?: any): Promise<AIResponse> {
  // Gemini expects tools in a different format via REST, but we can try to map standard OpenAI tools.
  // Actually, Gemini via OpenAI-compatible endpoint is usually easier, but direct is fine.
  // We use openAI compatibility endpoint for Gemini which is easier for tool calls!
  // Gemini API supports standard OpenAI format via: https://generativelanguage.googleapis.com/v1beta/openai/chat/completions

  const messages = [];
  if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
  messages.push({ role: "user", content: userPrompt });

  const payload: any = {
    model,
    messages
  };

  if (tools) {
    payload.tools = tools;
    payload.tool_choice = "auto";
  }

  const resp = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!resp.ok) {
    throw new Error(`Gemini error: ${resp.status} ${await resp.text()}`);
  }

  const data = await resp.json();
  const msg = data.choices?.[0]?.message;

  if (msg?.tool_calls) {
    return { toolCalls: msg.tool_calls };
  }

  return { content: msg?.content };
}
