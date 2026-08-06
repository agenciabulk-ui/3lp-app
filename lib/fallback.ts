import { DiagnosticoCompleto, EmpresaInput } from "./types";

export function gerarFallback(input: EmpresaInput): DiagnosticoCompleto {
  const mk = () => Math.round(40 + Math.random() * 40);
  const concorrentes = Array.from({ length: 6 }).map((_, i) => ({
    nome: `Concorrente estimado ${i + 1} (dado não localizado)`,
    nota: Number((3.5 + Math.random() * 1.3).toFixed(1)),
    avaliacoes: Math.floor(20 + Math.random() * 300),
    scoreGeral: mk(),
  }));

  return {
    coleta: {
      avaliacoes: 38,
      notaMedia: 4.3,
      fotos: 12,
      categorias: [input.segmento],
      produtos: 4,
      servicos: 6,
      descricaoPresente: false,
      ultimaPostagem: "há mais de 60 dias",
      perguntasRespostas: 2,
      horarioCompleto: true,
      linksCompletos: false,
      telefone: true,
      whatsapp: false,
      siteAtivo: !!input.site,
      areaAtendimento: false,
    },
    scores: {
      geral: 52,
      seoLocal: 48,
      avaliacoes: 60,
      fotos: 40,
      produtos: 55,
      servicos: 58,
      postagens: 30,
      conversao: 45,
      autoridade: 50,
      perfilCompleto: 44,
    },
    concorrentes,
    buscaLocal: {
      termos: [
        { termo: `${input.segmento} perto de mim`, posicaoEstimada: 6, volumeRelativo: "Alto" },
        { termo: `${input.segmento} em ${input.bairro || input.cidade}`, posicaoEstimada: 5, volumeRelativo: "Médio" },
        { termo: `melhor ${input.segmento} ${input.bairro || input.cidade}`, posicaoEstimada: 8, volumeRelativo: "Médio" },
        { termo: `${input.segmento} ${input.cidade}`, posicaoEstimada: 11, volumeRelativo: "Alto" },
        { termo: `${input.segmento} orçamento`, posicaoEstimada: 9, volumeRelativo: "Baixo" },
      ],
    },
    diagnostico: {
      pontosFortes: [
        "Perfil ativo no Google com avaliações consistentes.",
        "Boa nota média em relação ao segmento.",
      ],
      pontosFracos: [
        "Frequência de postagens abaixo do recomendado.",
        "Perfil incompleto, faltam produtos, serviços e área de atendimento.",
      ],
      oportunidades: [
        "Concorrentes diretos têm menos avaliações, espaço para liderar o segmento na região.",
        "Ausência de estratégia de postagens semanais é uma lacuna clara a explorar.",
      ],
      prioridades: [
        "Completar 100% do perfil do Google Business.",
        "Implementar rotina de postagens semanais.",
        "Estruturar estratégia de captação de novas avaliações.",
      ],
      acoesRecomendadas: [
        "Reorganizar categorias e descrição do perfil.",
        "Cadastrar todos os produtos e serviços.",
        "Criar calendário de postagens semanais.",
        "Configurar botões e links de contato.",
      ],
    },
    planoAcao: {
      urgente: [
        { prioridade: "Alta", descricao: "Completar informações básicas do perfil (horário, telefone, whatsapp).", impacto: "Alto", tempoEstimado: "2 dias" },
        { prioridade: "Alta", descricao: "Revisar e preencher a descrição do perfil no Google Business.", impacto: "Alto", tempoEstimado: "1 dia" },
        { prioridade: "Média", descricao: "Adicionar categorias secundárias corretas ao perfil.", impacto: "Médio", tempoEstimado: "1 dia" },
        { prioridade: "Alta", descricao: "Publicar fotos recentes do negócio, produtos e equipe.", impacto: "Alto", tempoEstimado: "3 dias" },
      ],
      dias30: [
        { prioridade: "Alta", descricao: "Publicar 4 postagens semanais no Google Business.", impacto: "Médio", tempoEstimado: "4 semanas" },
        { prioridade: "Média", descricao: "Cadastrar todos os produtos e serviços faltantes no perfil.", impacto: "Médio", tempoEstimado: "2 semanas" },
        { prioridade: "Média", descricao: "Responder todas as avaliações pendentes.", impacto: "Médio", tempoEstimado: "1 semana" },
      ],
      dias60: [
        { prioridade: "Média", descricao: "Estruturar estratégia de captação de avaliações.", impacto: "Alto", tempoEstimado: "30 dias" },
        { prioridade: "Média", descricao: "Criar seção de perguntas e respostas antecipando dúvidas comuns.", impacto: "Médio", tempoEstimado: "2 semanas" },
      ],
      dias90: [
        { prioridade: "Média", descricao: "Relatório comparativo com concorrentes e ajuste de estratégia.", impacto: "Alto", tempoEstimado: "contínuo" },
        { prioridade: "Baixa", descricao: "Revisão de área de atendimento e expansão de cobertura.", impacto: "Médio", tempoEstimado: "30 dias" },
      ],
    },
    proposta: {
      resumoExecutivo: "A análise identificou oportunidades relevantes de crescimento na presença digital local da empresa, com espaço claro para ganho de posição frente aos concorrentes diretos.",
      apresentacao: "A Bulk é uma agência especializada em presença digital local, atuando na organização estratégica de perfis Google Business para negócios locais.",
      problemasEncontrados: "O perfil apresenta lacunas em categorias, descrição, frequência de postagens e completude geral, reduzindo a visibilidade nas buscas locais.",
      analiseConcorrencia: "Os concorrentes mapeados na região apresentam níveis similares ou inferiores de estruturação, o que representa uma oportunidade real de posicionamento.",
      beneficios: [
        "Mais visibilidade nas buscas locais do Google",
        "Aumento na taxa de conversão de visitas em contatos",
        "Autoridade frente aos concorrentes diretos",
        "Relatórios mensais de acompanhamento",
      ],
      cronograma: "Trabalho estruturado em fases mensais, com entregas contínuas de organização, produção de conteúdo e monitoramento de resultados.",
      investimento: "O investimento para gestão completa de Google Business costuma variar entre R$ 600 e R$ 1.500 mensais no mercado brasileiro, a depender do escopo e da concorrência local.",
      objecoes: [
        { objecao: "Já temos um perfil no Google, por que investir nisso?", resposta: "Ter um perfil não é o mesmo que ter um perfil otimizado. A diferença está na estruturação e na frequência de atualização." },
      ],
      justificativaInvestimento: "O retorno se traduz em mais ligações, mensagens e visitas qualificadas vindas diretamente do Google, com custo por lead historicamente menor que mídia paga.",
      proximosPassos: [
        "Aprovação da proposta",
        "Acesso ao perfil do Google Business",
        "Início da reorganização completa",
        "Primeira postagem em até 5 dias úteis",
      ],
      conclusao: "A estruturação correta do Google Business é um dos investimentos de menor custo e maior retorno para negócios locais.",
    },
  };
}

export function extrairJSON(texto: string): any {
  let clean = texto.trim().replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
  const firstObj = clean.indexOf("{");
  const firstArr = clean.indexOf("[");
  const isArray = firstArr !== -1 && (firstObj === -1 || firstArr < firstObj);
  const openChar = isArray ? "[" : "{";
  const closeChar = isArray ? "]" : "}";
  const first = clean.indexOf(openChar);
  const last = clean.lastIndexOf(closeChar);
  clean = clean.slice(first, last + 1);
  return JSON.parse(clean);
}
