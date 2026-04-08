import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Upload, Loader2, Save, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { useInlineEdit } from '@/contexts/InlineEditContext';
import { useSiteContent, SiteContent } from '@/contexts/SiteContentContext';
import { supabase } from '@/integrations/supabase/client';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

/* ─── Compact Field Components ─── */

const Field = ({ label, value, onChange, multiline = false }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) => (
  <div className="mb-3">
    <Label className="text-white/60 text-[10px] font-bold uppercase tracking-wider mb-1 block">{label}</Label>
    {multiline ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className="w-full bg-white/10 border border-white/20 text-white text-xs rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
      />
    ) : (
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-white/10 border-white/20 text-white text-xs h-9"
      />
    )}
  </div>
);

const ColorField = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div className="mb-3">
    <Label className="text-white/60 text-[10px] font-bold uppercase tracking-wider mb-1 block">{label}</Label>
    <div className="flex items-center gap-2">
      <label className="relative cursor-pointer">
        <div className="w-8 h-8 rounded-lg border border-white/30" style={{ backgroundColor: value || '#000000' }} />
        <input type="color" value={value || '#000000'} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
      </label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="#000000" className="bg-white/10 border-white/20 text-white text-xs h-8 font-mono" />
    </div>
  </div>
);

const ImageUploadField = ({ label, value, onChange, bucket = 'site-assets', path = 'logos' }: { label: string; value: string; onChange: (v: string) => void; bucket?: string; path?: string }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const filePath = `${path}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from(bucket).upload(filePath, file, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
      onChange(publicUrl);
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="mb-3">
      <Label className="text-white/60 text-[10px] font-bold uppercase tracking-wider mb-1 block">{label}</Label>
      <div className="flex items-center gap-2">
        {value && <img src={value} alt="" className="w-10 h-10 rounded-lg border border-white/20 object-contain bg-white/5 p-0.5" />}
        <div className="flex-1 flex flex-col gap-1">
          <button onClick={() => fileRef.current?.click()} disabled={uploading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white/80 hover:bg-white/15 text-[10px] font-bold">
            {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
            {uploading ? 'Enviando...' : 'Upload'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="URL..." className="bg-white/10 border-white/20 text-white text-[10px] h-7" />
        </div>
      </div>
    </div>
  );
};

/* ─── Collapsible Group ─── */
const Group = ({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-3 rounded-lg border border-white/10 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-xs font-bold text-white/80 transition-colors">
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        {title}
      </button>
      {open && <div className="p-3 space-y-0">{children}</div>}
    </div>
  );
};

/* ─── Section-specific content panels ─── */

const SECTION_MAP: Record<string, { label: string; sections: string[] }> = {
  hero: { label: 'Hero', sections: ['hero', 'socialMusic'] },
  trustedBy: { label: 'Marcas Parceiras', sections: ['trustedBy'] },
  featureBanner: { label: 'Banner Destaque', sections: ['featureBanner'] },
  services: { label: 'Serviços & Impacto', sections: ['services', 'impact'] },
  stats: { label: 'Estatísticas', sections: ['stats'] },
  clientLogos: { label: 'Logos Clientes', sections: ['clientLogos'] },
  testimonials: { label: 'Depoimentos', sections: ['testimonials'] },
  faq: { label: 'FAQs', sections: ['faqs'] },
  footerCta: { label: 'Footer CTA', sections: ['footerCta'] },
};

const ContentControls = () => {
  const { selectedSection } = useInlineEdit();
  const { content, updateContent, saving } = useSiteContent();
  const [draft, setDraft] = useState<SiteContent>(JSON.parse(JSON.stringify(content)));
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setDraft(JSON.parse(JSON.stringify(content)));
    setDirty(false);
  }, [content]);

  const updateField = useCallback((path: string, value: string) => {
    setDraft(prev => {
      const d = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj: any = d;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!obj[keys[i]] || typeof obj[keys[i]] !== 'object') obj[keys[i]] = {};
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return d;
    });
    setDirty(true);
  }, []);

  const mutateDraft = useCallback((fn: (d: SiteContent) => void) => {
    setDraft(prev => {
      const d = JSON.parse(JSON.stringify(prev));
      fn(d);
      return d;
    });
    setDirty(true);
  }, []);

  const handleSave = async () => {
    try {
      await updateContent(draft);
      setDirty(false);
      toast.success('Conteúdo salvo!');
    } catch {
      toast.error('Erro ao salvar');
    }
  };

  const updateArrayItem = (path: string, index: number, field: string, value: string) => {
    mutateDraft((d: any) => {
      const keys = path.split('.');
      let obj: any = d;
      for (const key of keys) obj = obj[key];
      obj[index][field] = value;
    });
  };

  // If no section selected, show branding panel
  const sectionId = selectedSection || 'branding';

  const renderBranding = () => (
    <>
      <Group title="Logo & Favicon" defaultOpen>
        <ImageUploadField label="Logo" value={draft.branding.logoUrl} onChange={(v) => updateField('branding.logoUrl', v)} path="logos" />
        <ImageUploadField label="Favicon" value={draft.branding.faviconUrl || ''} onChange={(v) => updateField('branding.faviconUrl', v)} path="favicons" />
      </Group>
      <Group title="Degradê Principal">
        <ColorField label="Cor inicial" value={draft.branding.gradientFrom} onChange={(v) => updateField('branding.gradientFrom', v)} />
        <ColorField label="Cor final" value={draft.branding.gradientTo} onChange={(v) => updateField('branding.gradientTo', v)} />
        <div className="h-8 rounded-lg" style={{ background: `linear-gradient(to right, ${draft.branding.gradientFrom}, ${draft.branding.gradientTo})` }} />
      </Group>
      <Group title="Botões">
        <ColorField label="Cor do botão" value={draft.branding.buttonColor} onChange={(v) => updateField('branding.buttonColor', v)} />
        <ColorField label="Texto do botão" value={draft.branding.buttonTextColor} onChange={(v) => updateField('branding.buttonTextColor', v)} />
      </Group>
      <Group title="Links & Badges">
        <ColorField label="Cor dos links" value={draft.branding.linkColor} onChange={(v) => updateField('branding.linkColor', v)} />
        <ColorField label="Cor do badge" value={draft.branding.badgeColor} onChange={(v) => updateField('branding.badgeColor', v)} />
      </Group>
      <Group title="Blog CTA">
        <ColorField label="Fundo CTA" value={draft.branding.blogCtaBackground} onChange={(v) => updateField('branding.blogCtaBackground', v)} />
      </Group>
    </>
  );

  const renderHero = () => (
    <>
      <Group title="Hero" defaultOpen>
        <Field label="Badge" value={draft.hero.badge} onChange={(v) => updateField('hero.badge', v)} />
        <Field label="Título Linha 1" value={draft.hero.titleLine1} onChange={(v) => updateField('hero.titleLine1', v)} />
        <Field label="Título Linha 2" value={draft.hero.titleLine2} onChange={(v) => updateField('hero.titleLine2', v)} />
        <Field label="Subtítulo" value={draft.hero.subtitle} onChange={(v) => updateField('hero.subtitle', v)} />
        <Field label="Placeholder" value={draft.hero.placeholder} onChange={(v) => updateField('hero.placeholder', v)} />
      </Group>
      <Group title="Redes Sociais">
        <Field label="Facebook" value={draft.socialLinks?.facebook || ''} onChange={(v) => updateField('socialLinks.facebook', v)} />
        <Field label="Instagram" value={draft.socialLinks?.instagram || ''} onChange={(v) => updateField('socialLinks.instagram', v)} />
        <Field label="WhatsApp" value={draft.socialLinks?.whatsapp || ''} onChange={(v) => updateField('socialLinks.whatsapp', v)} />
      </Group>
      <Group title="Música">
        <Field label="URL (MP3)" value={draft.heroMusic?.url || ''} onChange={(v) => updateField('heroMusic.url', v)} />
        <Field label="Nome" value={draft.heroMusic?.label || ''} onChange={(v) => updateField('heroMusic.label', v)} />
      </Group>
    </>
  );

  const renderTrustedBy = () => (
    <Group title="Marcas Parceiras" defaultOpen>
      <Field label="Label" value={draft.trustedBy.label} onChange={(v) => updateField('trustedBy.label', v)} />
      {(draft.trustedBy.items || []).map((item, idx) => (
        <div key={idx} className="mb-2 p-2 rounded-lg bg-white/5 border border-white/10 relative">
          <button onClick={() => mutateDraft(d => d.trustedBy.items.splice(idx, 1))} className="absolute top-1 right-1 text-red-400 hover:text-red-300"><Trash2 className="w-3 h-3" /></button>
          <ImageUploadField label={`Marca ${idx + 1}`} value={item.logoUrl} onChange={(v) => updateArrayItem('trustedBy.items', idx, 'logoUrl', v)} path="brands" />
        </div>
      ))}
      <button onClick={() => mutateDraft(d => { if (!d.trustedBy.items) d.trustedBy.items = []; d.trustedBy.items.push({ name: 'Nova marca', logoUrl: '' }); })} className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold hover:text-emerald-300">
        <Plus className="w-3 h-3" /> Adicionar marca
      </button>
    </Group>
  );

  const renderFeatureBanner = () => (
    <Group title="Banner Destaque" defaultOpen>
      <Field label="Subtítulo" value={draft.featureBanner.subtitle} onChange={(v) => updateField('featureBanner.subtitle', v)} />
      <Field label="Título Linha 1" value={draft.featureBanner.titleLine1} onChange={(v) => updateField('featureBanner.titleLine1', v)} />
      <Field label="Título Linha 2" value={draft.featureBanner.titleLine2} onChange={(v) => updateField('featureBanner.titleLine2', v)} />
      <Field label="Descrição" value={draft.featureBanner.description} onChange={(v) => updateField('featureBanner.description', v)} multiline />
    </Group>
  );

  const renderServices = () => (
    <>
      <Group title="Impacto" defaultOpen>
        <Field label="Título Linha 1" value={draft.impact?.titleLine1 || ''} onChange={(v) => updateField('impact.titleLine1', v)} />
        <Field label="Título Linha 2" value={draft.impact?.titleLine2 || ''} onChange={(v) => updateField('impact.titleLine2', v)} />
        <Field label="Destaque" value={draft.impact?.titleHighlight || ''} onChange={(v) => updateField('impact.titleHighlight', v)} />

        <Label className="text-white/60 text-[10px] font-bold mt-2 block">Tags</Label>
        {(draft.impact?.tags || []).map((tag: string, idx: number) => (
          <div key={idx} className="flex items-center gap-1 mb-1">
            <Input value={tag} onChange={(e) => mutateDraft(d => { d.impact.tags[idx] = e.target.value; })} className="bg-white/10 border-white/20 text-white text-[10px] h-7 flex-1" />
            <button onClick={() => mutateDraft(d => d.impact.tags.splice(idx, 1))} className="text-red-400"><Trash2 className="w-3 h-3" /></button>
          </div>
        ))}
        <button onClick={() => mutateDraft(d => { if (!d.impact) return; d.impact.tags.push('Nova tag'); })} className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold"><Plus className="w-3 h-3" /> Tag</button>
      </Group>

      <Group title="Card 1 - Resultados">
        <Field label="Título" value={draft.impact?.card1Title || ''} onChange={(v) => updateField('impact.card1Title', v)} />
        <Field label="Descrição" value={draft.impact?.card1Description || ''} onChange={(v) => updateField('impact.card1Description', v)} multiline />
        {(draft.impact?.card1Stats || []).map((stat: { value: string; label: string }, idx: number) => (
          <div key={idx} className="flex gap-1 mb-1">
            <Input value={stat.value} onChange={(e) => mutateDraft(d => { d.impact.card1Stats[idx].value = e.target.value; })} placeholder="Valor" className="bg-white/10 border-white/20 text-white text-[10px] h-7 w-16" />
            <Input value={stat.label} onChange={(e) => mutateDraft(d => { d.impact.card1Stats[idx].label = e.target.value; })} placeholder="Label" className="bg-white/10 border-white/20 text-white text-[10px] h-7 flex-1" />
            <button onClick={() => mutateDraft(d => d.impact.card1Stats.splice(idx, 1))} className="text-red-400"><Trash2 className="w-3 h-3" /></button>
          </div>
        ))}
        <button onClick={() => mutateDraft(d => { d.impact.card1Stats.push({ value: '', label: '' }); })} className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold"><Plus className="w-3 h-3" /> Métrica</button>
      </Group>

      <Group title="Card 2 - Budget">
        <Field label="Título" value={draft.impact?.card2Title || ''} onChange={(v) => updateField('impact.card2Title', v)} />
        <Field label="Descrição" value={draft.impact?.card2Description || ''} onChange={(v) => updateField('impact.card2Description', v)} multiline />
        <Field label="Valor" value={draft.impact?.card2Value || ''} onChange={(v) => updateField('impact.card2Value', v)} />
      </Group>

      <Group title="Serviços">
        <Field label="Título" value={draft.services.title} onChange={(v) => updateField('services.title', v)} />
        <Field label="Subtítulo" value={draft.services.subtitle} onChange={(v) => updateField('services.subtitle', v)} />
        {draft.services.items.map((item, idx) => (
          <div key={idx} className="mb-2 p-2 rounded-lg bg-white/5 border border-white/10 relative">
            <button onClick={() => mutateDraft(d => d.services.items.splice(idx, 1))} className="absolute top-1 right-1 text-red-400"><Trash2 className="w-3 h-3" /></button>
            <Field label={`Serviço ${idx + 1}`} value={item.title} onChange={(v) => updateArrayItem('services.items', idx, 'title', v)} />
            
            <Label className="text-white/60 text-[10px] font-bold block">Estilo</Label>
            <div className="flex flex-wrap gap-1 mb-2">
              {['light', 'dark', 'gradient', 'gradient-wide', 'glass'].map(s => (
                <button key={s} onClick={() => updateArrayItem('services.items', idx, 'type', s)} className={`px-2 py-1 rounded text-[9px] font-bold ${(item.type || 'light') === s ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/50'}`}>
                  {s}
                </button>
              ))}
            </div>

            <Label className="text-white/60 text-[10px] font-bold block">Tags</Label>
            {item.tags.map((tag, tIdx) => (
              <div key={tIdx} className="flex gap-1 mb-1">
                <Input value={tag} onChange={(e) => mutateDraft(d => { d.services.items[idx].tags[tIdx] = e.target.value; })} className="bg-white/10 border-white/20 text-white text-[10px] h-7 flex-1" />
                <button onClick={() => mutateDraft(d => d.services.items[idx].tags.splice(tIdx, 1))} className="text-red-400"><Trash2 className="w-3 h-3" /></button>
              </div>
            ))}
            <button onClick={() => mutateDraft(d => d.services.items[idx].tags.push('Nova tag'))} className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold"><Plus className="w-3 h-3" /> Tag</button>
          </div>
        ))}
        <button onClick={() => mutateDraft(d => d.services.items.push({ title: 'Novo serviço', tags: ['Tag 1'] }))} className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold"><Plus className="w-3 h-3" /> Serviço</button>
      </Group>
    </>
  );

  const renderStats = () => (
    <Group title="Estatísticas" defaultOpen>
      {draft.stats.items.map((stat, idx) => (
        <div key={idx} className="mb-2 p-2 rounded-lg bg-white/5 border border-white/10">
          <Field label={`Stat ${idx + 1} - Valor`} value={stat.value} onChange={(v) => updateArrayItem('stats.items', idx, 'value', v)} />
          <Field label="Label" value={stat.label} onChange={(v) => updateArrayItem('stats.items', idx, 'label', v)} />
          <Field label="Sublabel" value={stat.sublabel} onChange={(v) => updateArrayItem('stats.items', idx, 'sublabel', v)} />
        </div>
      ))}
    </Group>
  );

  const renderClientLogos = () => (
    <Group title="Logos dos Clientes" defaultOpen>
      <Field label="Título" value={draft.clientLogos.title} onChange={(v) => updateField('clientLogos.title', v)} />
      {draft.clientLogos.items.map((item, idx) => (
        <div key={idx} className="mb-2 p-2 rounded-lg bg-white/5 border border-white/10 relative">
          <button onClick={() => mutateDraft(d => d.clientLogos.items.splice(idx, 1))} className="absolute top-1 right-1 text-red-400"><Trash2 className="w-3 h-3" /></button>
          <Field label="Nome" value={item.name} onChange={(v) => updateArrayItem('clientLogos.items', idx, 'name', v)} />
          <ImageUploadField label="Logo" value={item.logoUrl} onChange={(v) => updateArrayItem('clientLogos.items', idx, 'logoUrl', v)} path="brands" />
        </div>
      ))}
      <button onClick={() => mutateDraft(d => d.clientLogos.items.push({ name: 'Novo', logoUrl: '' }))} className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold"><Plus className="w-3 h-3" /> Logo</button>
    </Group>
  );

  const renderTestimonials = () => (
    <Group title="Depoimentos" defaultOpen>
      <Field label="Título" value={draft.testimonials.title} onChange={(v) => updateField('testimonials.title', v)} />
      <Field label="Subtítulo" value={draft.testimonials.subtitle} onChange={(v) => updateField('testimonials.subtitle', v)} />
      {draft.testimonials.items.map((item, idx) => (
        <div key={idx} className="mb-2 p-2 rounded-lg bg-white/5 border border-white/10 relative">
          <button onClick={() => mutateDraft(d => d.testimonials.items.splice(idx, 1))} className="absolute top-1 right-1 text-red-400"><Trash2 className="w-3 h-3" /></button>
          <Field label="Nome" value={item.name} onChange={(v) => updateArrayItem('testimonials.items', idx, 'name', v)} />
          <Field label="Cargo" value={item.role} onChange={(v) => updateArrayItem('testimonials.items', idx, 'role', v)} />
          <Field label="Texto" value={item.text} onChange={(v) => updateArrayItem('testimonials.items', idx, 'text', v)} multiline />
          <Field label="Avatar URL" value={item.avatar} onChange={(v) => updateArrayItem('testimonials.items', idx, 'avatar', v)} />
        </div>
      ))}
      <button onClick={() => mutateDraft(d => d.testimonials.items.push({ name: 'Novo', role: 'Cargo', text: 'Depoimento...', avatar: 'https://i.pravatar.cc/150?u=new' }))} className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold"><Plus className="w-3 h-3" /> Depoimento</button>
    </Group>
  );

  const renderFaqs = () => (
    <Group title="FAQs" defaultOpen>
      <Field label="Título" value={draft.faqs.title} onChange={(v) => updateField('faqs.title', v)} />
      <Field label="Subtítulo" value={draft.faqs.subtitle} onChange={(v) => updateField('faqs.subtitle', v)} />
      {draft.faqs.items.map((faq, idx) => (
        <div key={idx} className="mb-2 p-2 rounded-lg bg-white/5 border border-white/10 relative">
          <button onClick={() => mutateDraft(d => d.faqs.items.splice(idx, 1))} className="absolute top-1 right-1 text-red-400"><Trash2 className="w-3 h-3" /></button>
          <Field label="Pergunta" value={faq.question} onChange={(v) => updateArrayItem('faqs.items', idx, 'question', v)} />
          <Field label="Resposta" value={faq.answer} onChange={(v) => updateArrayItem('faqs.items', idx, 'answer', v)} multiline />
        </div>
      ))}
      <button onClick={() => mutateDraft(d => d.faqs.items.push({ question: 'Nova pergunta', answer: 'Resposta' }))} className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold"><Plus className="w-3 h-3" /> FAQ</button>
    </Group>
  );

  const renderFooterCta = () => (
    <Group title="Footer CTA" defaultOpen>
      <Field label="Título Linha 1" value={draft.footerCta.titleLine1} onChange={(v) => updateField('footerCta.titleLine1', v)} />
      <Field label="Título Linha 2" value={draft.footerCta.titleLine2} onChange={(v) => updateField('footerCta.titleLine2', v)} />
      <Field label="Subtítulo" value={draft.footerCta.subtitle} onChange={(v) => updateField('footerCta.subtitle', v)} />
    </Group>
  );

  const renderContent = () => {
    switch (sectionId) {
      case 'hero': return renderHero();
      case 'trustedBy': return renderTrustedBy();
      case 'featureBanner': return renderFeatureBanner();
      case 'services': return renderServices();
      case 'stats': return renderStats();
      case 'clientLogos': return renderClientLogos();
      case 'testimonials': return renderTestimonials();
      case 'faq': return renderFaqs();
      case 'footerCta': return renderFooterCta();
      default: return renderBranding();
    }
  };

  return (
    <div className="space-y-3">
      {/* Section indicator */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-bold text-white/80">
            {selectedSection ? (SECTION_MAP[selectedSection]?.label || selectedSection) : 'Branding'}
          </span>
        </div>
        {dirty && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            Salvar
          </button>
        )}
      </div>

      {!selectedSection && (
        <p className="text-[10px] text-amber-400/80 font-bold bg-amber-400/10 px-3 py-2 rounded-lg">
          💡 Selecione uma seção no site para editar seu conteúdo, ou edite o branding abaixo.
        </p>
      )}

      {renderContent()}
    </div>
  );
};

export default ContentControls;
