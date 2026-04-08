import React, { useState } from 'react';
import { useMetrics } from '@/hooks/useMetrics';
import {
  Eye, Users, Globe, Monitor, Smartphone, Tablet,
  TrendingUp, Search, ExternalLink, BarChart3, RefreshCw,
} from 'lucide-react';

type DateRange = 'today' | '7d' | '30d' | 'all';

const MetricCard = ({ label, value, icon: Icon, sub }: { label: string; value: string | number; icon: React.ElementType; sub?: string }) => (
  <div className="bg-card rounded-2xl border border-border p-6 flex items-start gap-4">
    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #5766fe, #820dd1)' }}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div>
      <p className="text-3xl font-black text-foreground">{value}</p>
      <p className="text-sm font-bold text-muted-foreground">{label}</p>
      {sub && <p className="text-xs text-muted-foreground/60 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const BreakdownTable = ({ title, items, labelKey, icon: Icon }: { title: string; items: { [k: string]: any }[]; labelKey: string; icon: React.ElementType }) => (
  <div className="bg-card rounded-2xl border border-border p-6">
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-4 h-4 text-muted-foreground" />
      <h4 className="text-sm font-black text-foreground uppercase tracking-wider">{title}</h4>
    </div>
    {items.length === 0 ? (
      <p className="text-sm text-muted-foreground">Sem dados ainda</p>
    ) : (
      <div className="space-y-2">
        {items.slice(0, 10).map((item, idx) => {
          const maxCount = items[0]?.count || 1;
          const pct = Math.round((item.count / maxCount) * 100);
          return (
            <div key={idx} className="relative">
              <div className="absolute inset-0 rounded-lg opacity-10" style={{ width: `${pct}%`, background: 'linear-gradient(to right, #5766fe, #820dd1)' }} />
              <div className="relative flex items-center justify-between px-3 py-2">
                <span className="text-sm font-semibold text-foreground truncate">{item[labelKey] || '(direto)'}</span>
                <span className="text-sm font-black text-muted-foreground ml-2">{item.count}</span>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);

const MiniChart = ({ data }: { data: { date: string; count: number }[] }) => {
  if (data.length === 0) return <p className="text-sm text-muted-foreground">Sem dados</p>;
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <h4 className="text-sm font-black text-foreground uppercase tracking-wider mb-4">Visualizações por dia</h4>
      <div className="flex items-end gap-1 h-32">
        {data.slice(-30).map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div className="absolute -top-8 bg-foreground text-background text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              {d.date}: {d.count}
            </div>
            <div
              className="w-full rounded-t-sm min-h-[2px] transition-all hover:opacity-80"
              style={{
                height: `${(d.count / max) * 100}%`,
                background: 'linear-gradient(to top, #5766fe, #820dd1)',
              }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-[10px] text-muted-foreground">{data[0]?.date}</span>
        <span className="text-[10px] text-muted-foreground">{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
};

const AdminMetricsPage = () => {
  const [range, setRange] = useState<DateRange>('30d');
  const { summary, loading } = useMetrics(range);

  const ranges: { value: DateRange; label: string }[] = [
    { value: 'today', label: 'Hoje' },
    { value: '7d', label: '7 dias' },
    { value: '30d', label: '30 dias' },
    { value: 'all', label: 'Tudo' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="space-y-6">
      {/* Date range selector */}
      <div className="flex items-center gap-2">
        {ranges.map(r => (
          <button
            key={r.value}
            onClick={() => setRange(r.value)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              range === r.value
                ? 'text-white shadow-lg'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
            style={range === r.value ? { background: 'linear-gradient(135deg, #5766fe, #820dd1)' } : undefined}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total de visualizações" value={summary.totalViews} icon={Eye} />
        <MetricCard label="Sessões únicas" value={summary.uniqueSessions} icon={Users} />
        <MetricCard label="Hoje" value={summary.todayViews} icon={TrendingUp} />
        <MetricCard label="Últimos 7 dias" value={summary.thisWeekViews} icon={BarChart3} />
      </div>

      {/* Chart */}
      <MiniChart data={summary.viewsByDay} />

      {/* Breakdown grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <BreakdownTable title="Países" items={summary.topCountries} labelKey="country" icon={Globe} />
        <BreakdownTable title="Cidades" items={summary.topCities} labelKey="city" icon={Globe} />
        <BreakdownTable title="Dispositivos" items={summary.deviceBreakdown} labelKey="device" icon={Monitor} />
        <BreakdownTable title="Navegadores" items={summary.browserBreakdown} labelKey="browser" icon={Monitor} />
        <BreakdownTable title="Sistemas operacionais" items={summary.osBreakdown} labelKey="os" icon={Monitor} />
        <BreakdownTable title="Idiomas" items={summary.languages} labelKey="lang" icon={Globe} />
      </div>

      {/* Marketing */}
      <h3 className="text-lg font-black text-foreground mt-4">Marketing & Aquisição</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <BreakdownTable title="UTM Source" items={summary.utmSources} labelKey="source" icon={Search} />
        <BreakdownTable title="UTM Campaign" items={summary.utmCampaigns} labelKey="campaign" icon={TrendingUp} />
        <BreakdownTable title="Referrers" items={summary.referrers} labelKey="referrer" icon={ExternalLink} />
      </div>

      {/* Pages */}
      <div className="grid grid-cols-1 gap-4">
        <BreakdownTable title="Páginas mais visitadas" items={summary.topPages} labelKey="page" icon={Eye} />
      </div>
    </div>
  );
};

export default AdminMetricsPage;
