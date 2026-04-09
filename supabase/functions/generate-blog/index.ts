import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { callAI, decryptKey } from "../_shared/ai-provider.ts";

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
    return publicUrl;
  } catch (err) {
    console.error("Upload exception:", err);
    return null;
  }
}

const STYLE_PROMPTS: Record<string, (topic: string, angle: string, seed: number) => string> = {
  realistic: (topic, angle, seed) => `Dark moody realistic photography style for a blog post about "${topic}". ${angle}. Cinematic lighting, dark tones, dramatic shadows, professional look. Unique composition seed:${seed}. Ultra high resolution. 16:9 aspect ratio.`,
  futuristic: (topic, angle, seed) => `Futuristic dark cyberpunk style illustration for a blog post about "${topic}". ${angle}. Neon lights, dark background, cyber elements, holographic effects, high contrast. Unique composition seed:${seed}. Ultra high resolution. 16:9 aspect ratio.`,
  "photo-realistic": (topic, angle, seed) => `Hyper-realistic photograph, indistinguishable from a real photo, for a blog post about "${topic}". ${angle}. Natural lighting, ultra-sharp focus, shallow depth of field, 8K resolution, photorealistic textures. Unique composition seed:${seed}. 16:9 aspect ratio.`,
  surreal: (topic, angle, seed) => `Surrealist dreamlike artwork for a blog post about "${topic}". ${angle}. Impossible geometry, melting elements, vivid unnatural colors, floating objects, Salvador Dalí inspired, fantastical atmosphere. Unique composition seed:${seed}. Ultra high resolution. 16:9 aspect ratio.`,
  "realistic-natural": (topic, angle, seed) => `Natural realistic photography with soft lighting for a blog post about "${topic}". ${angle}. Warm tones, golden hour, organic feel, high dynamic range, editorial photography style. Unique composition seed:${seed}. Ultra high resolution. 16:9 aspect ratio.`,
  pixar: (topic, angle, seed) => `Pixar-style 3D animated illustration for a blog post about "${topic}". ${angle}. Vibrant colors, stylized characters, smooth rendering, playful composition, Disney Pixar quality, subsurface scattering, volumetric lighting. Unique composition seed:${seed}. Ultra high resolution. 16:9 aspect ratio.`,
};

async function generateCoverImage(supabase: any, topic: string, imageStyle: string, customPrompt?: string): Promise<string | null> {
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

    const { data: geminiProv } = await supabase.from('ai_providers').select('*').eq('provider_name', 'gemini').eq('is_active', true).maybeSingle();
    let apiKey = Deno.env.get("GEMINI_API_KEY"); 
    if (geminiProv && geminiProv.api_key_encrypted) {
      apiKey = await decryptKey(supabase, geminiProv.api_key_encrypted);
    }
    
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured or no active Gemini provider found");

    // Chamada REST oficial para o modelo gemini-2.5-flash-image (geração nativa de imagem)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: stylePrompt }]
          }]
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini Image API error:", errText);
      return null;
    }

    const data = await response.json();
    let base64Data: string | null = null;
    let mimeType = "image/jpeg";

    // A imagem vem em response.candidates[0].content.parts como inlineData
    const parts = data?.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData) {
          base64Data = part.inlineData.data;
          mimeType = part.inlineData.mimeType || "image/jpeg";
          break;
        }
      }
    }

    if (base64Data) {
      const ext = mimeType.includes("png") ? "png" : "jpeg";
      const publicUrl = await uploadImageToStorage(`data:${mimeType};base64,${base64Data}`, "cover-ai", ext as "png" | "webp");
      return publicUrl;
    }

    console.error("Nenhuma imagem foi retornada pela API do Gemini.");
    return null; 
  } catch (err) { console.error("Cover image error:", err); return null; }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = getSupabaseAdmin();

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    const body = await req.json();
    const { topic, imageStyle, imageOnly, customImagePrompt, generateTopics, topicCount, niche } = body;

    if (generateTopics) {
      if (!niche) throw new Error("Niche is required for topic generation");
      const count = topicCount || 4;
      
      const systemPrompt = `Você é um estrategista de conteúdo e SEO. Gere exatamente ${count} temas de blog posts em português do Brasil para o nicho/assunto fornecido. Cada tema deve ser único, relevante e otimizado para SEO.`;
      const userPrompt = `Gere ${count} temas de blog posts para o nicho: "${niche}"`;
      
      const tools = [{
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
                  properties: { title: { type: "string" }, description: { type: "string" } },
                  required: ["title", "description"],
                },
              },
            },
            required: ["topics"],
          },
        },
      }];

      const aiResponse = await callAI(supabase, systemPrompt, userPrompt, null, tools);
      const toolCallUrl = aiResponse.toolCalls?.[0]?.function?.arguments;
      if (!toolCallUrl) throw new Error("Failed to parse AI topic response");
      
      const parsed = typeof toolCallUrl === "string" ? JSON.parse(toolCallUrl) : toolCallUrl;
      return new Response(JSON.stringify({ topics: parsed.topics }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (!topic) throw new Error("Topic is required");

    if (imageOnly) {
      const url = await generateCoverImage(supabase, topic, imageStyle || "realistic", customImagePrompt);
      return new Response(JSON.stringify({ cover_image: url }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const systemPrompt = `Você é um especialista em SEO e marketing de conteúdo. Gere um blog post COMPLETO e profissional em português do Brasil.\n\nREGRAS OBRIGATÓRIAS DE FORMATAÇÃO:\n- TODO o conteúdo gerado DEVE utilizar estritamente formatação HTML5 (<h2>, <h3>, <p>, <ul>, <li>, <strong>, etc).\n- JAMAIS utilize Markdown (não use ##, não use asteriscos para negrito). Escreva as tags HTML diretamente no texto.\n- A ausência das tags HTML comprometerá a legibilidade e o gerador de índice do blog.\n- NÃO inclua o conteúdo dentro de blocos de marcação de código (como \`\`\`html), forneça a string limpa já com as tags prontas.\n\nPráticas de SEO:\n- Uso de headings bem estruturados com tags <h2> e <h3>\n- Sempre envolva parágrafos em tags <p>\n- Use listas com <ul> e <li> para facilitar a leitura\n- Conteúdo humano, detalhado e conclusivo.`;
    const userPrompt = `Crie um blog post completo sobre: "${topic}"`;
    
    const tools = [{
      type: "function",
      function: {
        name: "create_blog_post",
        description: "Create a complete SEO-optimized blog post",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string" }, meta_title: { type: "string" }, meta_description: { type: "string" },
            excerpt: { type: "string" }, content: { type: "string", description: "The complete valid HTML formatted blog post content. MUST USE HTML TAGS (<h2>, <p>, <ul>) and NEVER EVER markdown." }, category: { type: "string" },
            tags: { type: "array", items: { type: "string" } }, slug: { type: "string" }
          },
          required: ["title", "meta_title", "meta_description", "excerpt", "content", "category", "tags", "slug"]
        }
      }
    }];

    const aiResponse = await callAI(supabase, systemPrompt, userPrompt, null, tools);
    const toolCallArgs = aiResponse.toolCalls?.[0]?.function?.arguments;
    if (!toolCallArgs) throw new Error("Failed to parse AI content response");

    const blogData = typeof toolCallArgs === "string" ? JSON.parse(toolCallArgs) : toolCallArgs;
    
    const coverImageUrl = await generateCoverImage(supabase, topic, imageStyle || "realistic", customImagePrompt);

    return new Response(JSON.stringify({ ...blogData, cover_image: coverImageUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-blog error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
