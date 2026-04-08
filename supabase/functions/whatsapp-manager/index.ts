import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL");
    const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY");

    if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
      throw new Error("Evolution API credentials not configured. Add EVOLUTION_API_URL and EVOLUTION_API_KEY as secrets.");
    }

    const apiUrl = EVOLUTION_API_URL.replace(/\/$/, "");

    // Verify admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    const { data: roleCheck } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleCheck) throw new Error("Forbidden: admin only");

    const body = await req.json();
    const { action } = body;

    // Helper: get or create config
    const getOrCreateConfig = async () => {
      const { data: existing } = await supabase.from("whatsapp_config").select("*").limit(1).maybeSingle();
      if (existing) return existing;
      
      const instanceName = `7zion-${Date.now().toString(36)}`;
      const { data: newCfg } = await supabase.from("whatsapp_config").insert({
        instance_name: instanceName,
        instance_status: "disconnected",
      }).select("*").single();
      return newCfg;
    };

    if (action === "get_config") {
      const cfg = await getOrCreateConfig();
      return new Response(JSON.stringify({ config: cfg }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "create_instance") {
      const cfg = await getOrCreateConfig();
      const instanceName = cfg.instance_name;

      console.log(`Creating instance: ${instanceName} at ${apiUrl}`);

      // First try to check if instance already exists
      try {
        const statusRes = await fetch(`${apiUrl}/instance/connectionState/${instanceName}`, {
          headers: { apikey: EVOLUTION_API_KEY },
        });
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          const state = statusData?.instance?.state || statusData?.state;
          console.log(`Existing instance state: ${state}`);
          
          if (state === "open" || state === "connected") {
            await supabase.from("whatsapp_config").update({ 
              instance_status: "connected", 
              qr_code: null 
            }).eq("id", cfg.id);
            
            return new Response(JSON.stringify({
              success: true,
              status: "connected",
              message: "Instance already connected!",
            }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          
          // Instance exists but not connected — try to reconnect
          console.log("Instance exists, attempting reconnect...");
          const connectRes = await fetch(`${apiUrl}/instance/connect/${instanceName}`, {
            headers: { apikey: EVOLUTION_API_KEY },
          });
          
          if (connectRes.ok) {
            const connectData = await connectRes.json();
            const base64 = connectData?.base64 || connectData?.qrcode?.base64;
            const qrCode = base64 ? (base64.startsWith("data:") ? base64 : `data:image/png;base64,${base64}`) : null;
            
            await supabase.from("whatsapp_config").update({
              instance_status: qrCode ? "connecting" : "disconnected",
              qr_code: qrCode,
            }).eq("id", cfg.id);

            return new Response(JSON.stringify({
              success: true,
              qr_code: qrCode,
              status: "connecting",
            }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }
      } catch (e) {
        console.log("Instance check failed, will create new:", e);
      }

      // Create new instance
      const createRes = await fetch(`${apiUrl}/instance/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: EVOLUTION_API_KEY,
        },
        body: JSON.stringify({
          instanceName,
          qrcode: true,
          integration: "WHATSAPP-BAILEYS",
        }),
      });

      if (!createRes.ok) {
        const errText = await createRes.text();
        console.error("Evolution API error:", errText);
        
        // If instance already exists (409), try reconnect
        if (createRes.status === 409) {
          const connectRes = await fetch(`${apiUrl}/instance/connect/${instanceName}`, {
            headers: { apikey: EVOLUTION_API_KEY },
          });
          if (connectRes.ok) {
            const connectData = await connectRes.json();
            const base64 = connectData?.base64 || connectData?.qrcode?.base64;
            const qrCode = base64 ? (base64.startsWith("data:") ? base64 : `data:image/png;base64,${base64}`) : null;
            
            await supabase.from("whatsapp_config").update({
              instance_status: "connecting",
              qr_code: qrCode,
            }).eq("id", cfg.id);

            return new Response(JSON.stringify({
              success: true,
              qr_code: qrCode,
              status: "connecting",
            }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }
        
        throw new Error(`Evolution API error: ${createRes.status} - ${errText}`);
      }

      const result = await createRes.json();
      console.log("Instance created:", JSON.stringify(result).substring(0, 500));

      const rawBase64 = result?.qrcode?.base64 || null;
      const qrCode = rawBase64 ? (rawBase64.startsWith("data:") ? rawBase64 : `data:image/png;base64,${rawBase64}`) : null;

      await supabase.from("whatsapp_config").update({
        instance_status: qrCode ? "connecting" : "disconnected",
        qr_code: qrCode,
      }).eq("id", cfg.id);

      return new Response(JSON.stringify({
        success: true,
        qr_code: qrCode,
        status: "connecting",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "check_status") {
      const cfg = await getOrCreateConfig();
      if (!cfg.instance_name) {
        return new Response(JSON.stringify({ status: "disconnected" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      try {
        const statusRes = await fetch(`${apiUrl}/instance/connectionState/${cfg.instance_name}`, {
          headers: { apikey: EVOLUTION_API_KEY },
        });

        if (statusRes.ok) {
          const statusData = await statusRes.json();
          console.log("Connection state:", JSON.stringify(statusData));
          const state = statusData?.instance?.state || statusData?.state;

          if (state === "open" || state === "connected") {
            await supabase.from("whatsapp_config").update({ 
              instance_status: "connected", 
              qr_code: null 
            }).eq("id", cfg.id);
            return new Response(JSON.stringify({ status: "connected" }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }
      } catch (e) {
        console.error("Status check error:", e);
      }

      return new Response(JSON.stringify({ status: cfg.instance_status || "disconnected" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "refresh_qr") {
      const cfg = await getOrCreateConfig();
      if (!cfg.instance_name) throw new Error("No instance configured");

      // Check if already connected
      try {
        const statusRes = await fetch(`${apiUrl}/instance/connectionState/${cfg.instance_name}`, {
          headers: { apikey: EVOLUTION_API_KEY },
        });
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          const state = statusData?.instance?.state || statusData?.state;
          if (state === "open" || state === "connected") {
            await supabase.from("whatsapp_config").update({ 
              instance_status: "connected", 
              qr_code: null 
            }).eq("id", cfg.id);
            return new Response(JSON.stringify({ status: "connected", qr_code: null }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }
      } catch (_) {}

      // Get new QR
      const qrRes = await fetch(`${apiUrl}/instance/connect/${cfg.instance_name}`, {
        headers: { apikey: EVOLUTION_API_KEY },
      });

      let qrCode = null;
      if (qrRes.ok) {
        const qrData = await qrRes.json();
        const base64 = qrData?.base64 || qrData?.qrcode?.base64;
        if (base64) qrCode = base64.startsWith("data:") ? base64 : `data:image/png;base64,${base64}`;
      }

      await supabase.from("whatsapp_config").update({
        instance_status: "connecting",
        qr_code: qrCode,
      }).eq("id", cfg.id);

      return new Response(JSON.stringify({ qr_code: qrCode, status: "connecting" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "delete_instance") {
      const cfg = await getOrCreateConfig();
      if (!cfg.instance_name) throw new Error("No instance configured");

      try {
        await fetch(`${apiUrl}/instance/delete/${cfg.instance_name}`, {
          method: "DELETE",
          headers: { apikey: EVOLUTION_API_KEY },
        });
      } catch (e) {
        console.error("Delete instance error:", e);
      }

      // Reset config but keep the row
      const newName = `7zion-${Date.now().toString(36)}`;
      await supabase.from("whatsapp_config").update({
        instance_name: newName,
        instance_status: "disconnected",
        qr_code: null,
      }).eq("id", cfg.id);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Unknown action");
  } catch (e) {
    console.error("whatsapp-manager error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
