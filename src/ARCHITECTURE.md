# Arquitetura do Sistema — Guia para IAs e Desenvolvedores

## Regra Principal

Arquivos marcados com `@system` **NÃO DEVEM SER EDITADOS** por IAs de criação de sites.
Arquivos marcados com `@site` **PODEM SER EDITADOS** livremente.

---

## Mapa de Pastas

```
src/
├── components/
│   ├── admin/          # @system — Painel administrativo
│   ├── inline-edit/    # @system — Engine do editor visual (page builder)
│   ├── ui/             # @system — Design system (shadcn/ui)
│   ├── sections/       # @site — Templates de seções do site
│   ├── LandingSections.tsx  # @site — Componentes de seção existentes
│   ├── Services.tsx         # @site — Seção de serviços + impacto
│   ├── BlogSection.tsx      # @site — Seção de blog
│   ├── ClientLogosCarousel.tsx # @site — Carrossel de logos
│   └── ChatWidget.tsx       # @system — Widget de chat
│
├── contexts/
│   ├── SiteContentContext.tsx  # @system — Gerenciamento de conteúdo e seções
│   ├── InlineEditContext.tsx   # @system — Estado do editor visual
│   ├── AuthContext.tsx         # @system — Autenticação
│   └── LocaleContext.tsx       # @system — Internacionalização
│
├── hooks/               # @system — Hooks do sistema
├── integrations/        # @system — Cliente Supabase (NÃO EDITAR)
├── pages/               # @system — Roteamento de páginas
└── lib/                 # @system — Utilitários e traduções
```

---

## Como Funciona o Fluxo de Dados

```
Supabase (site_sections + site_content)
        ↓
SiteContentContext (carrega seções e conteúdo)
        ↓
HomePage.tsx (renderiza seções dinamicamente)
        ↓
DynamicSectionRenderer (mapeia section_type → componente)
        ↓
Componente da Seção (Hero, Stats, CTA, etc.)
```

---

## Como Adicionar um Novo Template de Seção

1. Crie o componente em `src/components/sections/NomeDaSecao.tsx`
2. Marque com `@site EDITABLE`
3. Registre em `src/components/sections/sectionRegistry.ts`
4. Adicione os dados default no registry
5. A seção ficará disponível no painel "Novo" do editor visual

### Exemplo de Componente de Seção

```tsx
/**
 * @site EDITABLE - Site content component
 * @description Minha nova seção customizada
 * @editable true
 * @module site
 */
import React from 'react';

interface MyNewSectionProps {
  data: {
    title: string;
    description: string;
  };
}

const MyNewSection = ({ data }: MyNewSectionProps) => {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <h2>{data.title}</h2>
        <p>{data.description}</p>
      </div>
    </section>
  );
};

export default MyNewSection;
```

---

## Tabelas Supabase Relevantes

| Tabela | Descrição |
|--------|-----------|
| `site_sections` | Lista e ordem das seções da homepage |
| `site_content` | Conteúdo editável do site (textos, cores, etc.) |
| `blog_posts` | Posts do blog |
| `chat_agent_config` | Configuração do agente de chat |
| `clients` | CRM de clientes |
| `kanban_leads` | Leads no kanban |
| `page_views` | Analytics de visitas |

---

## Regras para IAs

1. **NUNCA** modifique arquivos em `components/admin/`, `components/inline-edit/`, `components/ui/`
2. **NUNCA** modifique `contexts/`, `hooks/`, `integrations/`, `lib/utils.ts`
3. **PODE** modificar componentes de seção em `components/sections/` e `LandingSections.tsx`
4. **PODE** adicionar novos componentes de seção
5. **PODE** modificar estilos e conteúdo visual
6. Sempre use `EditableText` e `EditableElement` para tornar conteúdo editável
7. Sempre aceite `data` como prop para dados da seção
