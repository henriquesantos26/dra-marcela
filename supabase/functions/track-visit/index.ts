import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const body = await req.json();
    console.log('Tracking page view:', JSON.stringify(body));

    // Get IP for geolocation (hashed for privacy)
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';

    // Hash IP for privacy (we don't store raw IPs)
    const encoder = new TextEncoder();
    const data = encoder.encode(ip + 'salt_7zion_2024');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const ipHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);

    // Try to get geolocation from IP
    let country = body.country || null;
    let city = body.city || null;
    let region = null;

    if (!country && ip !== 'unknown') {
      try {
        const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=country,city,regionName,countryCode`);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          country = geoData.country || null;
          city = geoData.city || null;
          region = geoData.regionName || null;
        }
      } catch (e) {
        console.log('Geo lookup failed:', e);
      }
    }

    // Parse user agent for device/browser/OS
    const ua = body.userAgent || '';
    const deviceType = /Mobile|Android|iPhone|iPad/i.test(ua) 
      ? (/iPad|Tablet/i.test(ua) ? 'tablet' : 'mobile') 
      : 'desktop';
    
    const browser = /Edg/i.test(ua) ? 'Edge'
      : /OPR|Opera/i.test(ua) ? 'Opera'
      : /Chrome/i.test(ua) ? 'Chrome'
      : /Safari/i.test(ua) ? 'Safari'
      : /Firefox/i.test(ua) ? 'Firefox'
      : 'Other';

    const os = /Windows/i.test(ua) ? 'Windows'
      : /Mac/i.test(ua) ? 'macOS'
      : /Linux/i.test(ua) ? 'Linux'
      : /Android/i.test(ua) ? 'Android'
      : /iOS|iPhone|iPad/i.test(ua) ? 'iOS'
      : 'Other';

    const { error } = await supabase.from('page_views').insert({
      session_id: body.sessionId || null,
      page_url: body.pageUrl || '/',
      referrer: body.referrer || null,
      utm_source: body.utmSource || null,
      utm_medium: body.utmMedium || null,
      utm_campaign: body.utmCampaign || null,
      utm_term: body.utmTerm || null,
      utm_content: body.utmContent || null,
      device_type: deviceType,
      browser,
      os,
      screen_width: body.screenWidth || null,
      screen_height: body.screenHeight || null,
      language: body.language || null,
      country,
      city,
      region,
      ip_hash: ipHash,
    });

    if (error) {
      console.error('Insert error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Track error:', e);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
