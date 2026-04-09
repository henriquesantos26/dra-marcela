import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { callAI } from "../_shared/ai-provider.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function upsertLead(supabase: any, leadInfo: any, columnId: string, convId: string) {
  const { data: existingLead } = await supabase
    .from("kanban_leads")
    .select("id, name, phone, email")
    .eq("conversation_id", convId)
    .limit(1)
    .single();

  if (existingLead) {
    const updates: Record<string, string> = {};
    if (leadInfo.name && leadInfo.name !== existingLead.name) updates.name = leadInfo.name;
    if (leadInfo.phone && !existingLead.phone) updates.phone = leadInfo.phone;
    if (leadInfo.email && !existingLead.email) updates.email = leadInfo.email;
    if (Object.keys(updates).length > 0) {
      await supabase.from("kanban_leads").update(updates).eq("id", existingLead.id);
      console.log("Updated existing lead:", existingLead.id, updates);
    }
  } else {
    await supabase.from("kanban_leads").insert({
      name: leadInfo.name,
      phone: leadInfo.phone || null,
      email: leadInfo.email || null,
      column_id: columnId,
      conversation_id: convId,
      source: "chat",
      ...(leadInfo.utm_source ? { utm_source: leadInfo.utm_source } : {}),
      ...(leadInfo.utm_medium ? { utm_medium: leadInfo.utm_medium } : {}),
      ...(leadInfo.utm_campaign ? { utm_campaign: leadInfo.utm_campaign } : {}),
    });
    console.log("Created new lead from AI for conversation:", convId);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { conversation_id, message, session_id, utm_source, utm_medium, utm_campaign } = await req.json();
    if (!message?.trim()) throw new Error("Message is required");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, serviceKey);

    // Get or create conversation
    let convId = conversation_id;
    if (!convId && session_id) {
      const { data: existing } = await supabase
        .from("chat_conversations")
        .select("id")
        .eq("session_id", session_id)
        .neq("status", "closed")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (existing) {
        convId = existing.id;
      } else {
        const { data: newConv, error: convErr } = await supabase
          .from("chat_conversations")
          .insert({ session_id, status: "ai_handling" })
          .select("id")
          .single();
        if (convErr) throw convErr;
        convId = newConv.id;
      }
    }

    // Save visitor message
    await supabase.from("chat_messages").insert({
      conversation_id: convId,
      role: "visitor",
      content: message.trim(),
    });

    // Update conversation timestamp
    await supabase
      .from("chat_conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", convId);

    // Check if conversation is in human handling mode — skip AI
    const { data: convData } = await supabase
      .from("chat_conversations")
      .select("status")
      .eq("id", convId)
      .single();

    if (convData?.status === "human_handling") {
      console.log("Conversation in human_handling mode, skipping AI response");
      return new Response(
        JSON.stringify({ conversation_id: convId, reply: null, human_handling: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Load agent config
    const { data: config } = await supabase
      .from("chat_agent_config")
      .select("*")
      .limit(1)
      .single();

    if (!config?.active) {
      const fallback = config?.fallback_message || "No momento nosso atendimento está indisponível.";
      await supabase.from("chat_messages").insert({
        conversation_id: convId,
        role: "assistant",
        content: fallback,
      });
      return new Response(JSON.stringify({ conversation_id: convId, reply: fallback }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Load knowledge base
    const { data: knowledge } = await supabase
      .from("chat_knowledge")
      .select("title, content, category");

    const knowledgeText = (knowledge || [])
      .map((k) => `[${k.category}] ${k.title}:\n${k.content}`)
      .join("\n\n---\n\n");

    // Load conversation history (last 20 messages)
    const { data: history } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true })
      .limit(20);

    const chatHistory = (history || []).map((m) => ({
      role: m.role === "visitor" ? "user" : "assistant",
      content: m.content,
    }));

    // Build few-shot examples block
    const fewShotExamples = (config.few_shot_examples || [])
      .filter((ex: any) => ex.question?.trim() && ex.answer?.trim())
      .map((ex: any) => `Visitante: ${ex.question}\nAgente: ${ex.answer}`)
      .join("\n\n");

    // Build system prompt with lead extraction instructions
    const systemPrompt = `${config.instructions}

## PERSONA E TOM DE VOZ:
- Adote um tom consultivo, amigável e profissional.
- Seja consistente no estilo de escrita em todas as respostas.
- Transmita confiança e conhecimento sem ser arrogante.

## REGRAS ABSOLUTAS:
- Responda APENAS com base nas informações da BASE DE CONHECIMENTO abaixo.
- Se a informação NÃO estiver na base de conhecimento, use esta mensagem: "${config.fallback_message}"
- NUNCA invente informações, serviços, preços ou funcionalidades.
- Responda SEMPRE em português brasileiro, mesmo que a base de conhecimento tenha termos em inglês.

## FORMATAÇÃO DAS RESPOSTAS:
- Seja conciso e objetivo. Evite respostas longas.
- Para listas, use bullet points para facilitar a leitura.
- Limite as respostas a no máximo 3-4 frases, a menos que o visitante peça mais detalhes.

## TRATAMENTO DE AMBIGUIDADE:
- Caso a pergunta do visitante seja ambígua ou falte contexto para uma resposta precisa, peça educadamente que forneça mais detalhes antes de responder.
- Nunca assuma informações que não foram ditas pelo visitante.

## COLETA DE INFORMAÇÕES DO LEAD:
- Durante a conversa, tente naturalmente coletar o nome e telefone do visitante para contato futuro.
- Se o visitante informar seu nome, telefone ou email em qualquer mensagem, inclua no FINAL da sua resposta uma linha especial no formato: %%LEAD_DATA:{"name":"Nome","phone":"Telefone","email":"Email"}%%
- Esta linha especial NÃO será mostrada ao visitante, é apenas para registro interno.
- Só inclua os campos que o visitante realmente informou. Campos desconhecidos devem ser null.
- Se nenhuma informação nova de contato foi fornecida na mensagem atual, NÃO inclua a linha %%LEAD_DATA%%.

## TÓPICOS PROIBIDOS (nunca fale sobre):
${config.avoid_topics}
${fewShotExamples ? `
## EXEMPLOS DE PERGUNTAS E RESPOSTAS (siga este padrão):
${fewShotExamples}
` : ""}
## BASE DE CONHECIMENTO:
${knowledgeText || "Nenhum conhecimento cadastrado ainda. Use a mensagem de fallback para todas as perguntas."}`;

    // Build user prompt with history
    const transcript = chatHistory.map(m => `${m.role === "user" ? "Visitante" : "Assistente"}: ${m.content}`).join("\n\n");
    const userPrompt = `Histórico da conversa:\n${transcript}\n\nVisitante: ${message.trim()}`;

    // Call AI using shared provider
    const aiResponse = await callAI(supabase, systemPrompt, userPrompt);
    let reply = aiResponse.content || config.fallback_message;

    // Extract lead data if present
    const leadMatch = reply.match(/%%LEAD_DATA:(.*?)%%/);
    if (leadMatch) {
      try {
        const leadInfo = JSON.parse(leadMatch[1]);
        // Attach UTM params from the request
        if (utm_source) leadInfo.utm_source = utm_source;
        if (utm_medium) leadInfo.utm_medium = utm_medium;
        if (utm_campaign) leadInfo.utm_campaign = utm_campaign;
        console.log("Lead data extracted:", leadInfo);

        // Remove the lead data tag from the visible reply
        reply = reply.replace(/%%LEAD_DATA:.*?%%/g, "").trim();

        // Check if we have at least a name
        if (leadInfo.name) {
          // Get the fixed "Lead" column
          const { data: leadCol } = await supabase
            .from("kanban_columns")
            .select("id")
            .eq("is_fixed", true)
            .limit(1)
            .single();

          if (leadCol) {
            // Check if this phone exists in clients table (returning client)
            if (leadInfo.phone) {
              const { data: existingClient } = await supabase
                .from("clients")
                .select("*")
                .eq("phone", leadInfo.phone)
                .limit(1)
                .single();

              if (existingClient) {
                console.log("Returning client detected, restoring to kanban:", existingClient.id);
                // Move client back to kanban
                await supabase.from("kanban_leads").insert({
                  name: existingClient.name,
                  phone: existingClient.phone || null,
                  email: existingClient.email || leadInfo.email || null,
                  notes: existingClient.notes || null,
                  column_id: leadCol.id,
                  conversation_id: convId,
                  source: existingClient.source,
                });
                await supabase.from("clients").delete().eq("id", existingClient.id);
                // Skip normal lead creation since we restored
              } else {
                // Normal lead flow
                await upsertLead(supabase, leadInfo, leadCol.id, convId);
              }
            } else {
              // No phone, normal lead flow
              await upsertLead(supabase, leadInfo, leadCol.id, convId);
            }
          }
        }
      } catch (parseErr) {
        console.error("Failed to parse lead data:", parseErr);
        reply = reply.replace(/%%LEAD_DATA:.*?%%/g, "").trim();
      }
    }

    // Save assistant reply
    await supabase.from("chat_messages").insert({
      conversation_id: convId,
      role: "assistant",
      content: reply,
    });

    return new Response(
      JSON.stringify({ conversation_id: convId, reply }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("chat-ai error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
