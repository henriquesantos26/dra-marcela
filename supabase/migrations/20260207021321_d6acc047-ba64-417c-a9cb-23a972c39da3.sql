UPDATE site_content 
SET content = content || '{
  "impact": {
    "titleLine1": "data that",
    "titleLine2": "proves",
    "titleHighlight": "our impact",
    "tags": ["S.M Management", "Content Creation", "Target Advertising", "Brand Growth"],
    "highlightedTagIndex": 2,
    "card1Title": "Nossos resultados",
    "card1Description": "Nossas campanhas de publicidade segmentada alcançam o público certo no momento certo, com taxas de engajamento mais altas e menor custo por clique.",
    "card1Stats": [
      {"value": "3x", "label": "melhor taxa de conversão comparado a campanhas amplas"},
      {"value": "+65%", "label": "melhoria no ROI"},
      {"value": "40%", "label": "menos desperdício em anúncios"}
    ],
    "card2Title": "Budget em 2024",
    "card2Description": "O orçamento foi estrategicamente alocado para atingir o público-alvo, aumentar a visibilidade da marca e gerar conversões.",
    "card2Value": "R$613k"
  }
}'::jsonb
WHERE locale = 'pt';