UPDATE site_content 
SET content = jsonb_set(
  content,
  '{services,items}',
  '[
    {"title":"Anúncios pagos Google & Meta Ads","tags":["Google Ads","Meta Ads","Performance"],"type":"light"},
    {"title":"Gestão de redes sociais","tags":["Instagram","TikTok","LinkedIn"],"type":"gradient-wide"},
    {"title":"Desenvolvimento de SaaS & Sites","tags":["SaaS","Sites","Landing Pages"],"type":"gradient"},
    {"title":"Branding & Identidade Visual","tags":["Logo","Manual de marca","Design"],"type":"dark"},
    {"title":"Produção de vídeos","tags":["Captação","Edição","Motion Graphics"],"type":"light"}
  ]'::jsonb
)
WHERE locale = 'pt';