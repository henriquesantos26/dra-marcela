import React from 'react';
import { useSiteContent } from '@/contexts/SiteContentContext';

const ImpactSection = () => {
  const { content } = useSiteContent();
  const accentColor = content.branding.gradientFrom;
  const impact = content.impact;

  // Fallback for old data without impact
  if (!impact) return null;

  return (
    <div className="mb-32">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left: Title + Tags */}
        <div>
          <h2 className="text-5xl md:text-6xl font-black text-white leading-[1] tracking-tighter mb-10">
            {impact.titleLine1}<br />
            {impact.titleLine2}<br />
            <span style={{ color: accentColor }}>{impact.titleHighlight}</span>
          </h2>

          <div className="flex flex-wrap gap-3">
            {(impact.tags || []).map((tag, idx) => (
              <span
                key={idx}
                className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
                  idx === (impact.highlightedTagIndex ?? 2)
                    ? 'text-white'
                    : 'bg-transparent border border-white/20 text-white/80 hover:border-white/40'
                }`}
                style={idx === (impact.highlightedTagIndex ?? 2) ? { background: accentColor } : undefined}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Results Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl p-7 text-black flex flex-col justify-between min-h-[280px]">
            <div>
              <h3 className="text-lg font-black mb-3">{impact.card1Title}</h3>
              <p className="text-xs text-black/50 leading-relaxed">{impact.card1Description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              {(impact.card1Stats || []).map((stat, idx) => (
                <div key={idx}>
                  <span className="text-3xl font-black" style={{ color: accentColor }}>{stat.value}</span>
                  <p className="text-[10px] text-black/40 font-bold uppercase tracking-wider mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-7 text-black flex flex-col justify-between min-h-[280px] relative overflow-hidden">
            <div>
              <h3 className="text-lg font-black mb-3">{impact.card2Title}</h3>
              <p className="text-xs text-black/50 leading-relaxed">{impact.card2Description}</p>
            </div>
            <div className="mt-auto">
              <span className="text-6xl md:text-7xl font-black" style={{ color: accentColor }}>
                {impact.card2Value}
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1.5" style={{ background: accentColor }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpactSection;
