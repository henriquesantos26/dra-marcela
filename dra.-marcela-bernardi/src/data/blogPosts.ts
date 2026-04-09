export interface BlogPost {
  id: string;
  imagem: string;
  titulo: string;
  resumo: string;
  conteudo: string;
  data: string;
  autor: string;
  categoria: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: "opcoes-sustentaveis-absorvente",
    imagem: "https://images.unsplash.com/photo-1620052581237-5d36667ae466?q=80&w=1200&auto=format&fit=crop",
    titulo: "Opções sustentáveis para substituir o absorvente descartável",
    resumo: "Hoje eu vou compartilhar com vocês algumas opções sustentáveis para substituir o tradicional absorvente descartável.",
    conteudo: `
      <p>A preocupação com o meio ambiente e com a <strong>saúde íntima</strong> tem levado muitas mulheres a buscarem alternativas aos absorventes descartáveis tradicionais. Além do impacto ambiental significativo — estima-se que uma mulher use cerca de 10.000 a 15.000 absorventes durante sua vida fértil —, os produtos convencionais muitas vezes contêm plásticos, perfumes e substâncias químicas que podem causar alergias e irritações. Como médica ginecologista, acredito que a <strong>ginecologia natural</strong> e o uso de produtos ecológicos são passos fundamentais para o bem-estar feminino.</p>
      
      <h2>1. Coletor Menstrual (Copo Menstrual)</h2>
      <p>O coletor menstrual é um pequeno copo de silicone medicinal ou elastômero termoplástico (TPE) que é inserido no canal vaginal para coletar o sangue menstrual. Ele é reutilizável, pode durar até 10 anos se bem cuidado, e precisa ser esvaziado, lavado e fervido entre os ciclos. É uma das opções mais econômicas a longo prazo e extremamente segura para a saúde íntima, pois não absorve a umidade natural da vagina.</p>
      
      <h3>Vantagens do Coletor</h3>
      <ul>
        <li>Livre de substâncias químicas e perfumes.</li>
        <li>Pode ser usado por até 12 horas seguidas.</li>
        <li>Redução drástica na produção de lixo.</li>
      </ul>

      <h2>2. Calcinhas Absorventes</h2>
      <p>As calcinhas absorventes parecem calcinhas normais, mas possuem camadas de tecidos tecnológicos que absorvem o fluxo menstrual, evitam vazamentos e neutralizam odores. Elas são laváveis e reutilizáveis. São ideais para quem busca conforto e praticidade, podendo ser usadas sozinhas em dias de fluxo leve a moderado, ou como segurança extra junto com o coletor menstrual.</p>

      <h2>3. Absorventes de Pano Reutilizáveis</h2>
      <p>Os absorventes de pano modernos são muito diferentes dos "paninhos" usados no passado. Eles possuem formato anatômico, abas com botões para fixação na calcinha e camadas de tecidos superabsorventes e impermeáveis (mas respiráveis). Após o uso, basta deixá-los de molho em água fria e lavá-los normalmente. São macios, confortáveis e livres de produtos químicos.</p>

      <h2>4. Esponjas Menstruais</h2>
      <p>Existem esponjas menstruais sintéticas e naturais (do mar). Elas são inseridas na vagina de forma semelhante a um absorvente interno, mas são reutilizáveis por alguns ciclos. É importante ter cuidado redobrado com a higienização e certificar-se de adquirir produtos específicos e seguros para uso íntimo, seguindo as recomendações da <a href="https://www.gov.br/anvisa/pt-br" target="_blank" rel="noopener">Anvisa</a>.</p>

      <h2>Como Escolher a Melhor Opção?</h2>
      <p>A escolha da melhor alternativa sustentável depende do seu estilo de vida, intensidade do fluxo menstrual e conforto pessoal. Muitas mulheres optam por combinar diferentes métodos, como usar o coletor durante o dia e a calcinha absorvente para dormir. O importante é experimentar e encontrar o que funciona melhor para o seu corpo, contribuindo para a sua saúde e para a preservação do meio ambiente. Se você está grávida ou planejando, confira também nosso guia sobre <a href="/blog/sinais-alarme-gestantes">sinais de alerta na gestação</a>.</p>
    `,
    data: "15 de Março de 2026",
    autor: "Dra. Marcela",
    categoria: "Sustentabilidade"
  },
  {
    id: "sinais-alarme-gestantes",
    imagem: "https://images.unsplash.com/photo-1531983412531-1f49a365ffed?q=80&w=1200&auto=format&fit=crop",
    titulo: "4 sinais de alarme para gestantes procurarem os serviços de saúde",
    resumo: "Vamos conversar sobre os quatro sinais de alarme que as gestantes devem prestar atenção e procurar atendimento médico.",
    conteudo: `
      <p>A gestação é um período de muitas transformações no corpo da mulher. É natural sentir desconfortos, mas é fundamental saber diferenciar os sintomas normais da gravidez daqueles que indicam uma possível complicação. Conhecer os <strong>sinais de alarme na gravidez</strong> ajuda a garantir a segurança da mãe e do bebê, permitindo uma intervenção médica rápida quando necessário. Como especialista em <strong>obstetrícia humanizada</strong>, reforço que a escuta do próprio corpo é o primeiro passo para um <strong>pré-natal</strong> de excelência.</p>

      <h2>1. Sangramento Vaginal</h2>
      <p>Qualquer sangramento vaginal durante a gravidez deve ser avaliado por um médico. No início da gestação, um pequeno sangramento pode ocorrer devido à implantação do embrião, mas também pode ser sinal de ameaça de aborto ou gravidez ectópica. No segundo e terceiro trimestres, o sangramento pode indicar problemas com a placenta, como descolamento prematuro ou placenta prévia, ou até mesmo o início do trabalho de parto prematuro. Não hesite em procurar a emergência obstétrica.</p>

      <h2>2. Perda de Líquido pela Vagina</h2>
      <p>A perda de líquido claro e com odor semelhante a água sanitária pode ser o rompimento da bolsa das águas (ruptura prematura das membranas). Se isso acontecer antes das 37 semanas, é considerado prematuro e requer atendimento imediato para avaliar o risco de infecção e a necessidade de indução do parto ou outras medidas. Mesmo no final da gestação, é importante ir à maternidade para avaliação.</p>

      <h2>3. Dor Abdominal Intensa ou Contrações Regulares</h2>
      <p>Cólicas leves são comuns, mas dores abdominais intensas, contínuas ou contrações uterinas regulares e dolorosas antes das 37 semanas são sinais de alerta. Isso pode indicar trabalho de parto prematuro, descolamento de placenta ou outras complicações abdominais (como apendicite ou problemas na vesícula, que também podem ocorrer na gravidez). Se as contrações não melhorarem com repouso e hidratação, procure ajuda médica.</p>

      <h2>4. Alterações Visuais, Dor de Cabeça Forte e Inchaço Repentino</h2>
      <p>Esses sintomas, especialmente quando ocorrem juntos no segundo ou terceiro trimestre, podem ser sinais de pré-eclâmpsia, uma complicação grave caracterizada por pressão alta na gravidez. Fique atenta a:</p>
      <ul>
        <li>Dor de cabeça forte e persistente que não melhora com analgésicos comuns;</li>
        <li>Visão embaçada, sensibilidade à luz ou ver "pontos brilhantes" (escotomas);</li>
        <li>Inchaço súbito e acentuado no rosto, mãos e pés;</li>
        <li>Dor na parte superior do abdômen, geralmente do lado direito.</li>
      </ul>
      <p>A pré-eclâmpsia requer monitoramento rigoroso e, em casos graves, a antecipação do parto, conforme diretrizes da <a href="https://www.febrasgo.org.br/" target="_blank" rel="noopener">FEBRASGO</a>.</p>

      <h2>Quando Procurar o Médico?</h2>
      <p>Além desses quatro sinais principais, outros sintomas como febre alta, diminuição ou ausência dos movimentos do bebê (após a 20ª semana), dor ou ardência ao urinar, e vômitos intensos que impedem a alimentação também exigem avaliação médica. Na dúvida, é sempre melhor pecar pelo excesso de cuidado e entrar em contato com seu obstetra ou ir à emergência da maternidade. Aproveite para ler sobre <a href="/blog/vacinas-adolescentes-sus">vacinação e saúde preventiva</a>.</p>
    `,
    data: "10 de Março de 2026",
    autor: "Dra. Marcela",
    categoria: "Obstetrícia"
  },
  {
    id: "vacinas-adolescentes-sus",
    imagem: "https://images.unsplash.com/photo-1633436374961-09b92742047b?q=80&w=1200&auto=format&fit=crop",
    titulo: "Vacinas para adolescentes disponíveis no SUS",
    resumo: "Um dos públicos que eu gosto muito de atender em meu consultório são as adolescentes. Conheça as vacinas disponíveis.",
    conteudo: `
      <p>A adolescência é uma fase de grandes mudanças físicas e emocionais, e a <strong>saúde preventiva</strong> deve ser uma prioridade. A <strong>vacinação</strong> é uma das formas mais eficazes de prevenir doenças graves. O Sistema Único de Saúde (SUS) no Brasil oferece um calendário vacinal completo e gratuito para adolescentes. Manter a caderneta de vacinação atualizada é fundamental para proteger não apenas o adolescente, mas toda a comunidade. Como ginecologista, vejo a vacina do HPV como um marco na prevenção do câncer feminino.</p>

      <h2>1. Vacina contra o HPV (Papilomavírus Humano)</h2>
      <p>A vacina contra o HPV é uma das mais importantes na adolescência, pois previne cânceres relacionados ao vírus, como o câncer de colo do útero, vulva, vagina, pênis, ânus e orofaringe, além de verrugas genitais. No SUS, a vacina quadrivalente está disponível para:</p>
      <ul>
        <li>Meninas e meninos de 9 a 14 anos de idade.</li>
        <li>A vacina é administrada em esquema de duas doses, com intervalo de seis meses entre elas.</li>
      </ul>
      <p>É ideal que a vacinação ocorra antes do início da vida sexual, garantindo maior eficácia na prevenção, conforme orientações do <a href="https://www.gov.br/saude/pt-br" target="_blank" rel="noopener">Ministério da Saúde</a>.</p>

      <h2>2. Vacina Meningocócica ACWY</h2>
      <p>A doença meningocócica é uma infecção bacteriana grave que pode causar meningite e meningococcemia, com alta letalidade. A vacina ACWY protege contra quatro sorogrupos da bactéria (A, C, W e Y). No SUS, ela está disponível para:</p>
      <ul>
        <li>Adolescentes de 11 e 12 anos de idade (dose única ou reforço, dependendo do histórico vacinal).</li>
      </ul>

      <h2>3. Vacina contra Hepatite B</h2>
      <p>A hepatite B é uma infecção viral que ataca o fígado e pode se tornar crônica, levando a cirrose e câncer hepático. A transmissão ocorre por contato com sangue infectado ou relações sexuais desprotegidas. A vacina é administrada em três doses. Se o adolescente não foi vacinado na infância or não completou o esquema, deve fazê-lo o quanto antes.</p>

      <h2>4. Vacina Dupla Adulto (dT - Difteria e Tétano)</h2>
      <p>A vacina dT protege contra a difteria (doença respiratória grave) e o tétano (infecção que afeta o sistema nervoso, geralmente contraída por ferimentos). O reforço dessa vacina deve ser feito a cada 10 anos ao longo de toda a vida. Na adolescência, é importante verificar se o reforço está em dia.</p>

      <h2>A Importância da Consulta de Rotina</h2>
      <p>A consulta ginecológica ou hebiátrica (especialista em adolescentes) é o momento ideal para revisar a caderneta de vacinação, esclarecer dúvidas sobre saúde sexual e reprodutiva, e garantir que o adolescente esteja protegido. Pais e responsáveis devem incentivar essa rotina de cuidados. Para as mulheres que já passaram dessa fase e buscam alternativas de cuidado, vejam nosso post sobre <a href="/blog/opcoes-sustentaveis-absorvente">opções sustentáveis de higiene íntima</a>.</p>
    `,
    data: "05 de Março de 2026",
    autor: "Dra. Marcela",
    categoria: "Ginecologia"
  }
];
