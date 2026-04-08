import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { image_url } = await req.json();
    if (!image_url) throw new Error("image_url is required");

    console.log("remove-bg: Processing image:", image_url.substring(0, 80));

    // Use Gemini image model to recreate the character with transparent/white bg removed
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: image_url }
            },
            {
              type: "text",
              text: "Remove the background from this image completely. Keep ONLY the character/subject with absolutely NO background. Output the character on a completely transparent background. Maintain all details, colors, and quality of the original subject. PNG with transparency."
            }
          ]
        }],
        modalities: ["image", "text"],
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("AI error:", resp.status, errText);
      if (resp.status === 429) return new Response(JSON.stringify({ error: "Rate limit. Tente novamente." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (resp.status === 402) return new Response(JSON.stringify({ error: "Créditos insuficientes." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI error: ${resp.status}`);
    }

    const data = await resp.json();
    const newImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!newImageUrl) throw new Error("No image returned from AI");

    // Upload to storage
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const base64Data = newImageUrl.replace(/^data:image\/\w+;base64,/, "");
    const raw = atob(base64Data);
    const arr = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);

    const fileName = `blog/nobg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;
    const { error: uploadErr } = await supabase.storage
      .from("site-assets")
      .upload(fileName, arr, { contentType: "image/png", upsert: true });

    if (uploadErr) throw new Error(`Upload failed: ${uploadErr.message}`);

    const { data: { publicUrl } } = supabase.storage.from("site-assets").getPublicUrl(fileName);
    console.log("Background removed, uploaded:", publicUrl);

    return new Response(JSON.stringify({ image_url: publicUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("remove-bg error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
