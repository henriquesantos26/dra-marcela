import React, { useRef, useState } from 'react';
import { Plus, Trash2, Upload, Loader2 } from 'lucide-react';
import { SiteContent } from '@/contexts/SiteContentContext';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  activeSection: string;
  draft: SiteContent;
  updateField: (path: string, value: string) => void;
  updateArrayItem: (path: string, index: number, field: string, value: string) => void;
  addFaq: () => void;
  removeFaq: (i: number) => void;
  addTestimonial: () => void;
  removeTestimonial: (i: number) => void;
  addService: () => void;
  removeService: (i: number) => void;
  updateServiceTag: (si: number, ti: number, v: string) => void;
  addServiceTag: (si: number) => void;
  removeServiceTag: (si: number, ti: number) => void;
  addClientLogo: () => void;
  removeClientLogo: (i: number) => void;
  setDraft: (d: SiteContent) => void;
}

const InputField = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div className="mb-4">
    <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-[#5766fe]/40 focus:border-[#5766fe]/50 transition-all text-sm"
    />
  </div>
);

const TextAreaField = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div className="mb-4">
    <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">{label}</label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-[#5766fe]/40 focus:border-[#5766fe]/50 transition-all resize-none text-sm"
    />
  </div>
);

const ColorField = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div>
    <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">{label}</label>
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent p-0.5"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-[#5766fe]/40 text-sm font-mono"
        placeholder="#000000"
      />
    </div>
  </div>
);

const SectionCard = ({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) => (
  <div className="bg-card rounded-2xl border border-border p-6 mb-6">
    <h3 className="text-lg font-black text-foreground mb-1">{title}</h3>
    {description && <p className="text-sm text-muted-foreground mb-6">{description}</p>}
    {!description && <div className="mb-4" />}
    {children}
  </div>
);

const BrandLogoUploadField = ({ logoUrl, onLogoChange }: { logoUrl: string; onLogoChange: (url: string) => void }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `brands/brand-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('site-assets').upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('site-assets').getPublicUrl(path);
      onLogoChange(publicUrl);
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="mb-2">
      <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Logo da Marca</label>
      <div className="flex items-center gap-4">
        {logoUrl && <img src={logoUrl} alt="Logo" className="w-16 h-10 object-contain rounded bg-card p-1 border border-border invert" />}
        <div className="flex-1 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-foreground hover:bg-card/80 transition-all text-sm font-bold"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? 'Enviando...' : 'Upload da imagem'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          <input
            type="text"
            value={logoUrl}
            onChange={(e) => onLogoChange(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-[#5766fe]/40 text-sm"
            placeholder="ou cole uma URL..."
          />
        </div>
      </div>
    </div>
  );
};

const LogoUploadField = ({ logoUrl, onLogoChange }: { logoUrl: string; onLogoChange: (url: string) => void }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `logos/logo-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('site-assets').upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('site-assets').getPublicUrl(path);
      onLogoChange(publicUrl);
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Logo do Site</label>
      <div className="flex items-center gap-4">
        {logoUrl && <img src={logoUrl} alt="Logo" className="w-16 h-16 rounded-xl border border-border object-contain bg-secondary p-1" />}
        <div className="flex-1 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-secondary border border-border text-foreground hover:bg-secondary/80 transition-all text-sm font-bold"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? 'Enviando...' : 'Fazer upload do logo'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          <input
            type="text"
            value={logoUrl}
            onChange={(e) => onLogoChange(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-[#5766fe]/40 text-sm"
            placeholder="ou cole uma URL..."
          />
        </div>
      </div>
    </div>
  );
};

const FaviconUploadField = ({ faviconUrl, onFaviconChange }: { faviconUrl: string; onFaviconChange: (url: string) => void }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `favicons/favicon-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('site-assets').upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('site-assets').getPublicUrl(path);
      onFaviconChange(publicUrl);
    } catch (err) {
      console.error('Favicon upload error:', err);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Favicon (aba do navegador)</label>
      <div className="flex items-center gap-4">
        {faviconUrl && <img src={faviconUrl} alt="Favicon" className="w-10 h-10 rounded-lg border border-border object-contain bg-secondary p-1" />}
        <div className="flex-1 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-secondary border border-border text-foreground hover:bg-secondary/80 transition-all text-sm font-bold"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? 'Enviando...' : 'Upload do favicon'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          <input
            type="text"
            value={faviconUrl}
            onChange={(e) => onFaviconChange(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-[#5766fe]/40 text-sm"
            placeholder="ou cole uma URL..."
          />
        </div>
      </div>
    </div>
  );
};


const AdminSectionRenderer = (props: Props) => {
  const {
    activeSection, draft, updateField, updateArrayItem,
    addFaq, removeFaq, addTestimonial, removeTestimonial,
    addService, removeService, updateServiceTag, addServiceTag, removeServiceTag,
    addClientLogo, removeClientLogo, setDraft,
  } = props;

  switch (activeSection) {
    case 'branding':
      return (
        <SectionCard title="Logo & Cores" description="Defina o logo, favicon e as cores visuais do site.">
          <LogoUploadField
            logoUrl={draft.branding.logoUrl}
            onLogoChange={(url) => updateField('branding.logoUrl', url)}
          />
          <FaviconUploadField
            faviconUrl={draft.branding.faviconUrl || ''}
            onFaviconChange={(url) => updateField('branding.faviconUrl', url)}
          />

          <h4 className="text-sm font-black text-foreground mb-3 mt-2">Degradê principal</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <ColorField label="Cor inicial" value={draft.branding.gradientFrom} onChange={(v) => updateField('branding.gradientFrom', v)} />
            <ColorField label="Cor final" value={draft.branding.gradientTo} onChange={(v) => updateField('branding.gradientTo', v)} />
          </div>
          <div className="p-6 rounded-2xl border border-border mb-8" style={{ background: `linear-gradient(to right, ${draft.branding.gradientFrom}, ${draft.branding.gradientTo})` }}>
            <p className="text-white text-xl font-black text-center">Preview do degradê</p>
          </div>

          <h4 className="text-sm font-black text-foreground mb-3">Botões</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <ColorField label="Cor do botão" value={draft.branding.buttonColor} onChange={(v) => updateField('branding.buttonColor', v)} />
            <ColorField label="Cor do texto do botão" value={draft.branding.buttonTextColor} onChange={(v) => updateField('branding.buttonTextColor', v)} />
          </div>
          <div className="flex items-center gap-4 mb-8">
            <button className="px-8 py-3 rounded-2xl font-black text-sm shadow-lg" style={{ background: draft.branding.buttonColor, color: draft.branding.buttonTextColor }}>
              Preview botão
            </button>
            <button className="px-8 py-3 rounded-2xl font-black text-sm shadow-lg" style={{ background: `linear-gradient(to right, ${draft.branding.gradientFrom}, ${draft.branding.gradientTo})`, color: draft.branding.buttonTextColor }}>
              Preview degradê
            </button>
          </div>

          <h4 className="text-sm font-black text-foreground mb-3">Links & Badges</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <ColorField label="Cor dos links" value={draft.branding.linkColor} onChange={(v) => updateField('branding.linkColor', v)} />
            <ColorField label="Cor do badge" value={draft.branding.badgeColor} onChange={(v) => updateField('branding.badgeColor', v)} />
          </div>
          <div className="flex items-center gap-6 mb-8">
            <a href="#" className="font-bold underline decoration-2 underline-offset-4" style={{ color: draft.branding.linkColor }}>Preview link</a>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border" style={{ color: draft.branding.badgeColor, borderColor: `${draft.branding.badgeColor}33`, background: `${draft.branding.badgeColor}1a` }}>
              <span className="w-2 h-2 rounded-full" style={{ background: draft.branding.badgeColor }} />
              Preview badge
            </span>
          </div>

          <h4 className="text-sm font-black text-foreground mb-3">Blog CTA</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <ColorField label="Fundo do CTA do Blog" value={draft.branding.blogCtaBackground} onChange={(v) => updateField('branding.blogCtaBackground', v)} />
          </div>
          <div className="p-6 rounded-2xl border border-border mb-2" style={{ background: `linear-gradient(135deg, ${draft.branding.blogCtaBackground}, ${draft.branding.gradientTo})` }}>
            <p className="text-white text-lg font-black text-center">Preview CTA Blog</p>
          </div>
        </SectionCard>
      );

    case 'hero':
      return (
        <SectionCard title="Hero Section" description="Configure o topo da página principal.">
          <InputField label="Badge" value={draft.hero.badge} onChange={(v) => updateField('hero.badge', v)} />
          <InputField label="Título Linha 1" value={draft.hero.titleLine1} onChange={(v) => updateField('hero.titleLine1', v)} />
          <InputField label="Título Linha 2" value={draft.hero.titleLine2} onChange={(v) => updateField('hero.titleLine2', v)} />
          <InputField label="Subtítulo" value={draft.hero.subtitle} onChange={(v) => updateField('hero.subtitle', v)} />
          <InputField label="Placeholder" value={draft.hero.placeholder} onChange={(v) => updateField('hero.placeholder', v)} />
        </SectionCard>
      );

    case 'trustedBy':
      return (
        <SectionCard title="Marcas Parceiras" description="Logotipos das marcas parceiras exibidos no carrossel.">
          <InputField label="Label" value={draft.trustedBy.label} onChange={(v) => updateField('trustedBy.label', v)} />
          {(draft.trustedBy.items || []).map((item, idx) => (
            <div key={idx} className="mb-4 p-4 rounded-xl bg-secondary border border-border relative">
              <button onClick={() => { const d = JSON.parse(JSON.stringify(draft)); d.trustedBy.items.splice(idx, 1); setDraft(d); }} className="absolute top-3 right-3 text-destructive hover:text-destructive/80"><Trash2 className="w-4 h-4" /></button>
              <BrandLogoUploadField
                logoUrl={item.logoUrl}
                onLogoChange={(v) => updateArrayItem('trustedBy.items', idx, 'logoUrl', v)}
              />
            </div>
          ))}
          <button onClick={() => { const d = JSON.parse(JSON.stringify(draft)); if (!d.trustedBy.items) d.trustedBy.items = []; d.trustedBy.items.push({ name: "Nova marca", logoUrl: "" }); setDraft(d); }} className="flex items-center gap-2 text-[#5766fe] font-bold hover:opacity-80 transition-colors text-sm">
            <Plus className="w-4 h-4" /> Adicionar marca
          </button>
        </SectionCard>
      );

    case 'featureBanner':
      return (
        <SectionCard title="Feature Banner" description="Banner de destaque com descrição da agência.">
          <InputField label="Subtítulo" value={draft.featureBanner.subtitle} onChange={(v) => updateField('featureBanner.subtitle', v)} />
          <InputField label="Título Linha 1" value={draft.featureBanner.titleLine1} onChange={(v) => updateField('featureBanner.titleLine1', v)} />
          <InputField label="Título Linha 2" value={draft.featureBanner.titleLine2} onChange={(v) => updateField('featureBanner.titleLine2', v)} />
          <TextAreaField label="Descrição" value={draft.featureBanner.description} onChange={(v) => updateField('featureBanner.description', v)} />
        </SectionCard>
      );

    case 'services':
      return (
        <>
          <SectionCard title="Impacto" description="Edite os textos e métricas da seção de impacto acima dos serviços.">
            <InputField label="Título Linha 1" value={draft.impact?.titleLine1 || ''} onChange={(v) => updateField('impact.titleLine1', v)} />
            <InputField label="Título Linha 2" value={draft.impact?.titleLine2 || ''} onChange={(v) => updateField('impact.titleLine2', v)} />
            <InputField label="Texto Destaque (colorido)" value={draft.impact?.titleHighlight || ''} onChange={(v) => updateField('impact.titleHighlight', v)} />
            
            <h4 className="text-sm font-black text-foreground mb-3 mt-4">Tags</h4>
            {(draft.impact?.tags || []).map((tag: string, idx: number) => (
              <div key={idx} className="flex items-center gap-2 mb-2">
                <input type="text" value={tag} onChange={(e) => {
                  const d = JSON.parse(JSON.stringify(draft));
                  if (!d.impact) return;
                  d.impact.tags[idx] = e.target.value;
                  setDraft(d);
                }} className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#5766fe]/40" />
                <button onClick={() => {
                  const d = JSON.parse(JSON.stringify(draft));
                  d.impact.tags.splice(idx, 1);
                  setDraft(d);
                }} className="text-destructive hover:text-destructive/80"><Trash2 className="w-3 h-3" /></button>
              </div>
            ))}
            <button onClick={() => {
              const d = JSON.parse(JSON.stringify(draft));
              if (!d.impact) return;
              d.impact.tags.push('Nova tag');
              setDraft(d);
            }} className="text-xs text-[#5766fe] font-bold hover:opacity-80 flex items-center gap-1 mt-1 mb-4">
              <Plus className="w-3 h-3" /> Adicionar tag
            </button>

            <h4 className="text-sm font-black text-foreground mb-3">Card 1 - Resultados</h4>
            <InputField label="Título" value={draft.impact?.card1Title || ''} onChange={(v) => updateField('impact.card1Title', v)} />
            <TextAreaField label="Descrição" value={draft.impact?.card1Description || ''} onChange={(v) => updateField('impact.card1Description', v)} />
            {(draft.impact?.card1Stats || []).map((stat: { value: string; label: string }, idx: number) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input type="text" value={stat.value} onChange={(e) => {
                  const d = JSON.parse(JSON.stringify(draft));
                  d.impact.card1Stats[idx].value = e.target.value;
                  setDraft(d);
                }} className="w-24 px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm font-bold" placeholder="Valor" />
                <input type="text" value={stat.label} onChange={(e) => {
                  const d = JSON.parse(JSON.stringify(draft));
                  d.impact.card1Stats[idx].label = e.target.value;
                  setDraft(d);
                }} className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm" placeholder="Label" />
                <button onClick={() => {
                  const d = JSON.parse(JSON.stringify(draft));
                  d.impact.card1Stats.splice(idx, 1);
                  setDraft(d);
                }} className="text-destructive hover:text-destructive/80"><Trash2 className="w-3 h-3" /></button>
              </div>
            ))}
            <button onClick={() => {
              const d = JSON.parse(JSON.stringify(draft));
              if (!d.impact) return;
              d.impact.card1Stats.push({ value: '', label: '' });
              setDraft(d);
            }} className="text-xs text-[#5766fe] font-bold hover:opacity-80 flex items-center gap-1 mt-1 mb-4">
              <Plus className="w-3 h-3" /> Adicionar métrica
            </button>

            <h4 className="text-sm font-black text-foreground mb-3">Card 2 - Budget</h4>
            <InputField label="Título" value={draft.impact?.card2Title || ''} onChange={(v) => updateField('impact.card2Title', v)} />
            <TextAreaField label="Descrição" value={draft.impact?.card2Description || ''} onChange={(v) => updateField('impact.card2Description', v)} />
            <InputField label="Valor destaque" value={draft.impact?.card2Value || ''} onChange={(v) => updateField('impact.card2Value', v)} />
          </SectionCard>

          <SectionCard title="Serviços" description="Gerencie os cards de serviços exibidos no site.">
            <InputField label="Título" value={draft.services.title} onChange={(v) => updateField('services.title', v)} />
            <InputField label="Subtítulo" value={draft.services.subtitle} onChange={(v) => updateField('services.subtitle', v)} />
            {draft.services.items.map((item, idx) => (
              <div key={idx} className="mb-4 p-4 rounded-xl bg-secondary border border-border relative">
                <button onClick={() => removeService(idx)} className="absolute top-3 right-3 text-destructive hover:text-destructive/80"><Trash2 className="w-4 h-4" /></button>
                <p className="text-xs font-bold text-muted-foreground mb-3">Serviço {idx + 1}</p>
                <InputField label="Título" value={item.title} onChange={(v) => updateArrayItem('services.items', idx, 'title', v)} />
                
                <div className="mb-4">
                  <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Estilo do Card</label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {[
                      { id: 'light', label: '☀️ Claro' },
                      { id: 'dark', label: '🌙 Escuro' },
                      { id: 'gradient', label: '🎨 Gradiente' },
                      { id: 'gradient-wide', label: '🎨 Grad. Largo' },
                      { id: 'glass', label: '🪟 Vidro' },
                    ].map((style) => (
                      <button
                        key={style.id}
                        onClick={() => updateArrayItem('services.items', idx, 'type', style.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                          (item.type || 'light') === style.id
                            ? 'border-[#5766fe] bg-[#5766fe]/10 text-foreground'
                            : 'border-border bg-card text-muted-foreground hover:border-muted-foreground/30'
                        }`}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-wider">Tags</p>
                {item.tags.map((tag, tIdx) => (
                  <div key={tIdx} className="flex items-center gap-2 mb-2">
                    <input type="text" value={tag} onChange={(e) => updateServiceTag(idx, tIdx, e.target.value)} className="flex-1 px-3 py-2 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#5766fe]/40" />
                    <button onClick={() => removeServiceTag(idx, tIdx)} className="text-destructive hover:text-destructive/80"><Trash2 className="w-3 h-3" /></button>
                  </div>
                ))}
                <button onClick={() => addServiceTag(idx)} className="text-xs text-[#5766fe] font-bold hover:opacity-80 flex items-center gap-1 mt-1">
                  <Plus className="w-3 h-3" /> Adicionar tag
                </button>
              </div>
            ))}
            <button onClick={addService} className="flex items-center gap-2 text-[#5766fe] font-bold hover:opacity-80 transition-colors text-sm">
              <Plus className="w-4 h-4" /> Adicionar serviço
            </button>
          </SectionCard>
        </>
      );

    case 'clientLogos':
      return (
        <SectionCard title="Logos dos Clientes" description="Logotipos exibidos no carrossel de clientes.">
          <InputField label="Título da seção" value={draft.clientLogos.title} onChange={(v) => updateField('clientLogos.title', v)} />
          {draft.clientLogos.items.map((item, idx) => (
            <div key={idx} className="mb-4 p-4 rounded-xl bg-secondary border border-border relative flex items-center gap-4">
              <button onClick={() => removeClientLogo(idx)} className="absolute top-3 right-3 text-destructive hover:text-destructive/80"><Trash2 className="w-4 h-4" /></button>
              {item.logoUrl && <img src={item.logoUrl} alt={item.name} className="w-16 h-10 object-contain rounded bg-card p-1" />}
              <div className="flex-1">
                <InputField label="Nome" value={item.name} onChange={(v) => updateArrayItem('clientLogos.items', idx, 'name', v)} />
                <InputField label="URL do Logo" value={item.logoUrl} onChange={(v) => updateArrayItem('clientLogos.items', idx, 'logoUrl', v)} />
              </div>
            </div>
          ))}
          <button onClick={addClientLogo} className="flex items-center gap-2 text-[#5766fe] font-bold hover:opacity-80 transition-colors text-sm">
            <Plus className="w-4 h-4" /> Adicionar logo
          </button>
        </SectionCard>
      );

    case 'stats':
      return (
        <SectionCard title="Estatísticas" description="Números de destaque exibidos no site.">
          {draft.stats.items.map((stat, idx) => (
            <div key={idx} className="mb-4 p-4 rounded-xl bg-secondary border border-border">
              <p className="text-xs font-bold text-muted-foreground mb-3">Estatística {idx + 1}</p>
              <InputField label="Valor" value={stat.value} onChange={(v) => updateArrayItem('stats.items', idx, 'value', v)} />
              <InputField label="Label" value={stat.label} onChange={(v) => updateArrayItem('stats.items', idx, 'label', v)} />
              <InputField label="Sublabel" value={stat.sublabel} onChange={(v) => updateArrayItem('stats.items', idx, 'sublabel', v)} />
            </div>
          ))}
          <TextAreaField label="Logos (separados por vírgula)" value={draft.stats.logos.join(', ')} onChange={(v) => {
            const newDraft = JSON.parse(JSON.stringify(draft));
            newDraft.stats.logos = v.split(',').map((l: string) => l.trim()).filter(Boolean);
            setDraft(newDraft);
          }} />
        </SectionCard>
      );

    case 'testimonials':
      return (
        <SectionCard title="Depoimentos" description="Gerencie os depoimentos de clientes.">
          <InputField label="Título" value={draft.testimonials.title} onChange={(v) => updateField('testimonials.title', v)} />
          <InputField label="Subtítulo" value={draft.testimonials.subtitle} onChange={(v) => updateField('testimonials.subtitle', v)} />
          {draft.testimonials.items.map((item, idx) => (
            <div key={idx} className="mb-4 p-4 rounded-xl bg-secondary border border-border relative">
              <button onClick={() => removeTestimonial(idx)} className="absolute top-3 right-3 text-destructive hover:text-destructive/80"><Trash2 className="w-4 h-4" /></button>
              <p className="text-xs font-bold text-muted-foreground mb-3">Depoimento {idx + 1}</p>
              <InputField label="Nome" value={item.name} onChange={(v) => updateArrayItem('testimonials.items', idx, 'name', v)} />
              <InputField label="Role" value={item.role} onChange={(v) => updateArrayItem('testimonials.items', idx, 'role', v)} />
              <TextAreaField label="Texto" value={item.text} onChange={(v) => updateArrayItem('testimonials.items', idx, 'text', v)} />
              <InputField label="Avatar URL" value={item.avatar} onChange={(v) => updateArrayItem('testimonials.items', idx, 'avatar', v)} />
            </div>
          ))}
          <button onClick={addTestimonial} className="flex items-center gap-2 text-[#5766fe] font-bold hover:opacity-80 transition-colors text-sm">
            <Plus className="w-4 h-4" /> Adicionar depoimento
          </button>
        </SectionCard>
      );

    case 'faqs':
      return (
        <SectionCard title="FAQs" description="Perguntas frequentes exibidas no site.">
          <InputField label="Título" value={draft.faqs.title} onChange={(v) => updateField('faqs.title', v)} />
          <InputField label="Subtítulo" value={draft.faqs.subtitle} onChange={(v) => updateField('faqs.subtitle', v)} />
          {draft.faqs.items.map((faq, idx) => (
            <div key={idx} className="mb-4 p-4 rounded-xl bg-secondary border border-border relative">
              <button onClick={() => removeFaq(idx)} className="absolute top-3 right-3 text-destructive hover:text-destructive/80"><Trash2 className="w-4 h-4" /></button>
              <p className="text-xs font-bold text-muted-foreground mb-3">FAQ {idx + 1}</p>
              <InputField label="Pergunta" value={faq.question} onChange={(v) => updateArrayItem('faqs.items', idx, 'question', v)} />
              <TextAreaField label="Resposta" value={faq.answer} onChange={(v) => updateArrayItem('faqs.items', idx, 'answer', v)} />
            </div>
          ))}
          <button onClick={addFaq} className="flex items-center gap-2 text-[#5766fe] font-bold hover:opacity-80 transition-colors text-sm">
            <Plus className="w-4 h-4" /> Adicionar FAQ
          </button>
        </SectionCard>
      );

    case 'footerCta':
      return (
        <SectionCard title="Footer CTA" description="Call-to-action final do site.">
          <InputField label="Título Linha 1" value={draft.footerCta.titleLine1} onChange={(v) => updateField('footerCta.titleLine1', v)} />
          <InputField label="Título Linha 2" value={draft.footerCta.titleLine2} onChange={(v) => updateField('footerCta.titleLine2', v)} />
          <InputField label="Subtítulo" value={draft.footerCta.subtitle} onChange={(v) => updateField('footerCta.subtitle', v)} />
        </SectionCard>
      );

    case 'socialMusic':
      return (
        <>
          <SectionCard title="Redes Sociais" description="Links das redes sociais exibidos no banner principal.">
            <InputField label="Facebook (URL completa)" value={draft.socialLinks?.facebook || ''} onChange={(v) => updateField('socialLinks.facebook', v)} />
            <InputField label="Instagram (URL completa)" value={draft.socialLinks?.instagram || ''} onChange={(v) => updateField('socialLinks.instagram', v)} />
            <InputField label="WhatsApp (número com DDI, ex: 5511999999999)" value={draft.socialLinks?.whatsapp || ''} onChange={(v) => updateField('socialLinks.whatsapp', v)} />
          </SectionCard>
          <SectionCard title="Música de Fundo" description="Música que toca no banner principal ao clicar no player.">
            <InputField label="URL do áudio (MP3)" value={draft.heroMusic?.url || ''} onChange={(v) => updateField('heroMusic.url', v)} />
            <InputField label="Nome da música" value={draft.heroMusic?.label || ''} onChange={(v) => updateField('heroMusic.label', v)} />
          </SectionCard>
        </>
      );

    default:
      return null;
  }
};

export default AdminSectionRenderer;
