export type EmpresaInput = {
  nome: string;
  bairro: string;
  cidade: string;
  estado: string;
  segmento: string;
  site: string;
  gbp: string;
};

export type Coleta = {
  avaliacoes: number;
  notaMedia: number;
  fotos: number;
  categorias: string[];
  produtos: number;
  servicos: number;
  descricaoPresente: boolean;
  ultimaPostagem: string;
  perguntasRespostas: number;
  horarioCompleto: boolean;
  linksCompletos: boolean;
  telefone: boolean;
  whatsapp: boolean;
  siteAtivo: boolean;
  areaAtendimento: boolean;
};

export type Concorrente = {
  nome: string;
  nota: number;
  avaliacoes: number;
  scoreGeral?: number;
};

export type TermoBusca = {
  termo: string;
  volumeRelativo: "Alto" | "Médio" | "Baixo";
  posicaoEstimada?: number;
};

export type Scores = {
  geral: number;
  seoLocal: number;
  avaliacoes: number;
  fotos: number;
  produtos: number;
  servicos: number;
  postagens: number;
  conversao: number;
  autoridade: number;
  perfilCompleto: number;
};

export type Diagnostico = {
  pontosFortes: string[];
  pontosFracos: string[];
  oportunidades: string[];
  prioridades: string[];
  acoesRecomendadas: string[];
};

export type Tarefa = {
  prioridade: "Alta" | "Média" | "Baixa";
  descricao: string;
  impacto: string;
  tempoEstimado: string;
};

export type PlanoAcao = {
  urgente: Tarefa[];
  dias30: Tarefa[];
  dias60: Tarefa[];
  dias90: Tarefa[];
};

export type Objecao = { objecao: string; resposta: string };

export type Proposta = {
  resumoExecutivo: string;
  apresentacao: string;
  problemasEncontrados: string;
  analiseConcorrencia: string;
  beneficios: string[];
  cronograma: string;
  investimento: string;
  objecoes: Objecao[];
  justificativaInvestimento: string;
  proximosPassos: string[];
  conclusao: string;
};

export type CategoriaAnalise = {
  categoriaPrincipal: string;
  nossasCategorias: string[];
  categoriasConcorrentesMaisComuns: { categoria: string; ocorrencias: number }[];
  categoriasFaltantes: string[];
};

export type Avaliacao = { autor: string; nota: number; texto: string; respostaSugerida?: string };

export type DadosBrutos = {
  coleta: Coleta;
  concorrentes: Concorrente[];
  buscaLocal: { termos: TermoBusca[] };
  fonte?: "google_places" | "ia_busca_web";
  googlePlaceId?: string;
  googleLocation?: { lat: number; lng: number };
  categorias?: CategoriaAnalise;
  avaliacoesRecentes?: Avaliacao[];
  linkAvaliacao?: string;
};

export type ConcorrenteNaFrente = { nome: string; nota: number; avaliacoes: number };

export type RaioPosicao = {
  raioKm: number;
  posicao: number | null;
  totalResultados: number;
  concorrentesNaFrente: ConcorrenteNaFrente[];
};

export type RaioAnalise = RaioPosicao & {
  diagnostico: string;
  acoesCorrigiveis: string[];
  limitacaoEstrutural: string | null;
};

export type Analise = {
  scores: Scores;
  concorrentes: Concorrente[];
  buscaLocal: { termos: TermoBusca[] };
  diagnostico: Diagnostico;
  planoAcao: PlanoAcao;
  proposta: Proposta;
};

export type DiagnosticoCompleto = {
  coleta: Coleta;
  raios?: RaioAnalise[];
  categorias?: CategoriaAnalise;
  avaliacoesRecentes?: Avaliacao[];
  linkAvaliacao?: string;
  fonte?: "google_places" | "ia_busca_web";
} & Analise;
