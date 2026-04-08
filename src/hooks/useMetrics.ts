import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PageView {
  id: string;
  session_id: string;
  page_url: string;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  screen_width: number | null;
  screen_height: number | null;
  language: string | null;
  country: string | null;
  city: string | null;
  region: string | null;
  created_at: string;
}

interface MetricsSummary {
  totalViews: number;
  uniqueSessions: number;
  todayViews: number;
  thisWeekViews: number;
  topPages: { page: string; count: number }[];
  topCountries: { country: string; count: number }[];
  topCities: { city: string; count: number }[];
  deviceBreakdown: { device: string; count: number }[];
  browserBreakdown: { browser: string; count: number }[];
  osBreakdown: { os: string; count: number }[];
  utmSources: { source: string; count: number }[];
  utmCampaigns: { campaign: string; count: number }[];
  referrers: { referrer: string; count: number }[];
  viewsByDay: { date: string; count: number }[];
  languages: { lang: string; count: number }[];
}

export const useMetrics = (dateRange: 'today' | '7d' | '30d' | 'all' = '30d') => {
  const [data, setData] = useState<PageView[]>([]);
  const [summary, setSummary] = useState<MetricsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      let query = supabase
        .from('page_views')
        .select('*')
        .order('created_at', { ascending: false });

      const now = new Date();
      if (dateRange === 'today') {
        query = query.gte('created_at', new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString());
      } else if (dateRange === '7d') {
        query = query.gte('created_at', new Date(now.getTime() - 7 * 86400000).toISOString());
      } else if (dateRange === '30d') {
        query = query.gte('created_at', new Date(now.getTime() - 30 * 86400000).toISOString());
      }

      const { data: views, error } = await query.limit(1000);
      if (error) {
        console.error('Metrics fetch error:', error);
        setLoading(false);
        return;
      }

      const rows = (views || []) as PageView[];
      setData(rows);

      // Compute summary
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const sessions = new Set(rows.map(r => r.session_id).filter(Boolean));

      const countBy = <T extends string | null>(arr: (T)[]): { key: string; count: number }[] => {
        const map: Record<string, number> = {};
        arr.forEach(v => { if (v) map[v] = (map[v] || 0) + 1; });
        return Object.entries(map).map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count);
      };

      const viewsByDay: Record<string, number> = {};
      rows.forEach(r => {
        const day = r.created_at.split('T')[0];
        viewsByDay[day] = (viewsByDay[day] || 0) + 1;
      });

      setSummary({
        totalViews: rows.length,
        uniqueSessions: sessions.size,
        todayViews: rows.filter(r => r.created_at.startsWith(today)).length,
        thisWeekViews: rows.filter(r => r.created_at >= weekAgo).length,
        topPages: countBy(rows.map(r => r.page_url)).map(i => ({ page: i.key, count: i.count })),
        topCountries: countBy(rows.map(r => r.country)).map(i => ({ country: i.key, count: i.count })),
        topCities: countBy(rows.map(r => r.city)).map(i => ({ city: i.key, count: i.count })),
        deviceBreakdown: countBy(rows.map(r => r.device_type)).map(i => ({ device: i.key, count: i.count })),
        browserBreakdown: countBy(rows.map(r => r.browser)).map(i => ({ browser: i.key, count: i.count })),
        osBreakdown: countBy(rows.map(r => r.os)).map(i => ({ os: i.key, count: i.count })),
        utmSources: countBy(rows.map(r => r.utm_source)).map(i => ({ source: i.key, count: i.count })),
        utmCampaigns: countBy(rows.map(r => r.utm_campaign)).map(i => ({ campaign: i.key, count: i.count })),
        referrers: countBy(rows.map(r => r.referrer).map(r => {
          if (!r) return null;
          try { return new URL(r).hostname; } catch { return r; }
        })).map(i => ({ referrer: i.key, count: i.count })),
        viewsByDay: Object.entries(viewsByDay).sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({ date, count })),
        languages: countBy(rows.map(r => r.language?.split('-')[0] || null)).map(i => ({ lang: i.key, count: i.count })),
      });

      setLoading(false);
    };

    fetch();
  }, [dateRange]);

  return { data, summary, loading };
};
