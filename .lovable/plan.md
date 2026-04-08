

## Abas de Status no Blog: Lixeira, Rascunhos, Programados e Postados

### Resumo

Adicionar sub-abas dentro da aba "Posts" para filtrar por status: **Todos**, **Rascunhos**, **Programados**, **Postados** e **Lixeira**. A lixeira usa soft-delete com coluna `deleted_at`.

### 1. Migração de banco de dados

Adicionar coluna `deleted_at` (timestamp, nullable) na tabela `blog_posts` para soft-delete. Posts com `deleted_at` preenchido estão na lixeira. Atualizar a policy pública para excluir posts deletados (`published = true AND deleted_at IS NULL`).

### 2. Alterações no `AdminBlogPage.tsx`

**Filtros por status** usando estado `postFilter`:
- **Todos**: `deleted_at IS NULL`
- **Rascunhos**: `published = false AND scheduled_at IS NULL AND deleted_at IS NULL`
- **Programados**: `published = false AND scheduled_at IS NOT NULL AND deleted_at IS NULL`
- **Postados**: `published = true AND deleted_at IS NULL`
- **Lixeira**: `deleted_at IS NOT NULL`

**UI**: Barra de filtros com botões/pills acima da lista de posts (dentro da tab "Posts"), cada um com contador.

**Ações na lixeira**:
- "Mover para lixeira" substitui o delete permanente atual
- Na aba Lixeira: botão "Restaurar" (limpa `deleted_at`) e "Excluir permanentemente"

### Arquivos modificados

| Arquivo | Mudança |
|---------|---------|
| Migração SQL | Adicionar `deleted_at` + atualizar RLS policy pública |
| `AdminBlogPage.tsx` | Sub-filtros de status, soft-delete, restaurar, delete permanente |
| `BlogPage.tsx` | Filtrar `deleted_at IS NULL` (já coberto pela RLS) |

