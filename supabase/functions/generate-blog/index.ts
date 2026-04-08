import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function getSupabaseAdmin() {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
}

async function uploadImageToStorage(base64Url: string, prefix: string, format: "png" | "webp" = "webp"): Promise<string | null> {
  try {
    const supabase = getSupabaseAdmin();
    const base64Data = base64Url.replace(/^data:image\/\w+;base64,/, "");
    const raw = atob(base64Data);
    const arr = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);

    const contentType = format === "webp" ? "image/webp" : "image/png";
    const fileName = `blog/${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${format}`;

    const { error } = await supabase.storage
      .from("site-assets")
      .upload(fileName, arr, { contentType, upsert: true });

    if (error) { console.error("Upload error:", error.message); return null; }

    const { data: { publicUrl } } = supabase.storage.from("site-assets").getPublicUrl(fileName);
    console.log(`Image uploaded: ${publicUrl}`);
    return publicUrl;
  } catch (err) {
    console.error("Upload exception:", err);
    return null;
  }
}

const STYLE_PROMPTS: Record<string, (topic: string, angle: string, seed: number) => string> = {
  realistic: (topic, angle, seed) =>
    `Dark moody realistic photography style for a blog post about "${topic}". ${angle}. Cinematic lighting, dark tones, dramatic shadows, professional look. Unique composition seed:${seed}. Ultra high resolution. 16:9 aspect ratio.`,
  futuristic: (topic, angle, seed) =>
    `Futuristic dark cyberpunk style illustration for a blog post about "${topic}". ${angle}. Neon lights, dark background, cyber elements, holographic effects, high contrast. Unique composition seed:${seed}. Ultra high resolution. 16:9 aspect ratio.`,
  "photo-realistic": (topic, angle, seed) =>
    `Hyper-realistic photograph, indistinguishable from a real photo, for a blog post about "${topic}". ${angle}. Natural lighting, ultra-sharp focus, shallow depth of field, 8K resolution, photorealistic textures. Unique composition seed:${seed}. 16:9 aspect ratio.`,
  surreal: (topic, angle, seed) =>
    `Surrealist dreamlike artwork for a blog post about "${topic}". ${angle}. Impossible geometry, melting elements, vivid unnatural colors, floating objects, Salvador Dalí inspired, fantastical atmosphere. Unique composition seed:${seed}. Ultra high resolution. 16:9 aspect ratio.`,
  "realistic-natural": (topic, angle, seed) =>
    `Natural realistic photography with soft lighting for a blog post about "${topic}". ${angle}. Warm tones, golden hour, organic feel, high dynamic range, editorial photography style. Unique composition seed:${seed}. Ultra high resolution. 16:9 aspect ratio.`,
  pixar: (topic, angle, seed) =>
    `Pixar-style 3D animated illustration for a blog post about "${topic}". ${angle}. Vibrant colors, stylized characters, smooth rendering, playful composition, Disney Pixar quality, subsurface scattering, volumetric lighting. Unique composition seed:${seed}. Ultra high resolution. 16:9 aspect ratio.`,
};

async function generateCoverImage(topic: string, imageStyle: string, apiKey: string, customPrompt?: string): Promise<string | null> {
  try {
    const seed = Math.floor(Math.random() * 100000);
    const angles = ["bird's eye view", "low angle dramatic shot", "wide cinematic angle", "close-up detail shot", "isometric perspective"];
    const angle = angles[Math.floor(Math.random() * angles.length)];

    let stylePrompt: string;
    if (customPrompt && customPrompt.trim()) {
      stylePrompt = customPrompt.trim();
    } else {
      const promptFn = STYLE_PROMPTS[imageStyle] || STYLE_PROMPTS["realistic"];
      stylePrompt = promptFn(topic, angle, seed);
    }

    console.log(`Generating cover image - style: ${imageStyle}, custom: ${!!customPrompt}`);

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: stylePrompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!resp.ok) { console.error("Cover gen failed:", resp.status, await resp.text()); return null; }
    const data = await resp.json();
    const imgUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!imgUrl) { console.error("No image in response"); return null; }
    return await uploadImageToStorage(imgUrl, "ai-cover", "webp");
  } catch (err) { console.error("Cover image error:", err); return null; }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const body = await req.json();
    const { topic, imageStyle, imageOnly, customImagePrompt, generateTopics, topicCount, niche } = body;

    // ── Mode: Generate Topics ──
    if (generateTopics) {
      if (!niche) throw new Error("Niche is required for topic generation");
      const count = topicCount || 4;
      console.log(`generate-blog: generateTopics niche="${niche}" count=${count}`);

      const topicResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: `Você é um estrategista de conteúdo e SEO. Gere exatamente ${count} temas de blog posts em português do Brasil para o nicho/assunto fornecido. Cada tema deve ser único, relevante e otimizado para SEO.`,
            },
            { role: "user", content: `Gere ${count} temas de blog posts para o nicho: "${niche}"` },
          ],
          tools: [{
            type: "function",
            function: {
              name: "get_topics",
              description: "Return blog topic suggestions",
              parameters: {
                type: "object",
                properties: {
                  topics: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string", description: "Título sugerido para o post" },
                        description: { type: "string", description: "Breve descrição do conteúdo (1-2 frases)" },
                      },
                      required: ["title", "description"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["topics"],
                additionalProperties: false,
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "get_topics" } },
        }),
      });

      if (!topicResp.ok) {
        const errText = await topicResp.text();
        console.error("AI topics error:", topicResp.status, errText);
        if (topicResp.status === 429) return new Response(JSON.stringify({ error: "Rate limit. Tente novamente em alguns segundos." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (topicResp.status === 402) return new Response(JSON.stringify({ error: "Créditos insuficientes." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        throw new Error(`AI gateway error: ${topicResp.status}`);
      }

      const topicData = await topicResp.json();
      const toolCall = topicData.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall?.function?.arguments) throw new Error("Failed to parse topic suggestions");
      const parsed = JSON.parse(toolCall.function.arguments);

      return new Response(JSON.stringify({ topics: parsed.topics }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Existing modes ──
    if (!topic) throw new Error("Topic is required");
    console.log(`generate-blog: topic="${topic}", imageStyle="${imageStyle}", imageOnly=${imageOnly}`);

    // Image-only mode
    if (imageOnly) {
      const url = await generateCoverImage(topic, imageStyle || "realistic", LOVABLE_API_KEY, customImagePrompt);
      return new Response(JSON.stringify({ cover_image: url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Full blog generation
    const contentResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `Você é um especialista em SEO e marketing de conteúdo. Gere um blog post COMPLETO e profissional em português do Brasil.

O conteúdo DEVE seguir as melhores práticas de SEO do Google:
- Título otimizado para SEO (máx 60 caracteres) com a palavra-chave principal à esquerda
- Meta description apelativa (máx 155 caracteres) para maximizar CTR
- Uso de headings (H2, H3) estruturados com palavras-chave — cada H2 deve ter um id slug para âncoras
- A palavra-chave principal DEVE aparecer no primeiro parágrafo
- Parágrafos curtos (máx 3-4 linhas) e escaneáveis
- Uso de listas (ul/ol) quando apropriado
- Incluir 2-3 links internos usando <a href="/blog">
- Incluir pelo menos 1 link externo de alta autoridade usando target="_blank" rel="noopener noreferrer"
- Conteúdo mínimo de 1500 palavras
- Conclusão com CTA claro
- NÃO inclua seções meta/instrucionais, apenas o conteúdo do artigo`
          },
          { role: "user", content: `Crie um blog post completo sobre: "${topic}"` }
        ],
        tools: [{
          type: "function",
          function: {
            name: "create_blog_post",
            description: "Create a complete SEO-optimized blog post",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string" },
                meta_title: { type: "string" },
                meta_description: { type: "string" },
                excerpt: { type: "string" },
                content: { type: "string" },
                category: { type: "string" },
                tags: { type: "array", items: { type: "string" } },
                slug: { type: "string" }
              },
              required: ["title", "meta_title", "meta_description", "excerpt", "content", "category", "tags", "slug"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "create_blog_post" } },
      }),
    });

    if (!contentResp.ok) {
      const errText = await contentResp.text();
      console.error("AI content error:", contentResp.status, errText);
      if (contentResp.status === 429) return new Response(JSON.stringify({ error: "Rate limit. Tente novamente em alguns segundos." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (contentResp.status === 402) return new Response(JSON.stringify({ error: "Créditos insuficientes." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway error: ${contentResp.status}`);
    }

    const contentData = await contentResp.json();
    const toolCall = contentData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) throw new Error("Failed to parse AI response");
    const blogData = JSON.parse(toolCall.function.arguments);

    console.log("Generating cover image...");
    const coverImageUrl = await generateCoverImage(topic, imageStyle || "realistic", LOVABLE_API_KEY, customImagePrompt);

    console.log("Blog generation complete. Cover:", !!coverImageUrl);

    return new Response(JSON.stringify({
      ...blogData,
      cover_image: coverImageUrl,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-blog error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
