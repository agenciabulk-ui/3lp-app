import { NextRequest, NextResponse } from "next/server";
import { extrairJSON } from "@/lib/fallback";
import { EmpresaInput, DadosBrutos } from "@/lib/types";
import { buscarNegocioPrincipal, detalhesNegocio, buscarPorTextoNoRaio, analisarCategorias } from "@/lib/googlePlaces";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const placesKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!anthropicKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY não configurada no servidor." }, { status: 500 });
  }

  const input = (await req.json()) as EmpresaInput;

  try {
    if (placesKey) {
      const dados = await pesquisarComGooglePlaces(input, placesKey, anthropicKey);
      return NextResponse.json(dados);
    }
    const dados = await pesquisarComIA(input, anthropicKey);
    return NextResponse.json(dados);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Falha na pesquisa" }, { status: 500 });
  }
}

/* ======================= CAMINHO 1: Google Places (dados reais) + IA só para campos que a API não expõe ======================= */
async function pesquisarComGooglePlaces(input: EmpresaInput, placesKey: string, anthropicKey: string): Promise<DadosBrutos> {
  const queryPrincipal = `${input.nome}, ${input.bairro ? input.bairro + ", " : ""}${input.cidade} ${input.estado}`;
  const principal = await buscarNegocioPrincipal(placesKey, queryPrincipal);
  if (!principal) {
    // Não encontrou no Google, cai pro caminho de IA
    return pesquisarComIA(input, anthropicKey);
  }
  const detalhes = await detalhesNegocio(placesKey, principal.id);

  const lat = detalhes.lat ?? principal.lat!;
  const lng = detalhes.lng ?? principal.lng!;

  // Concorrentes: busca por segmento num raio amplo ao redor do negócio
  const raioBase = input.bairro ? 3000 : 6000;
  const proximos = await buscarPorTextoNoRaio(placesKey, input.segmento, lat, lng, raioBase, 15);
  const concorrentesBrutos = proximos.filter((p) => p.id !== principal.id).slice(0, 10);
  const concorrentes = concorrentesBrutos.map((p) => ({ nome: p.nome, nota: p.nota, avaliacoes: p.avaliacoes }));
  const categorias = analisarCategorias(detalhes.categorias, concorrentesBrutos);

  // Campos que a Places API não expõe: produtos, serviços, posts, Q&A, área de atendimento, descrição, whatsapp.
  // Pedimos pra IA estimar só isso, sem web_search (mais barato), com os dados reais como contexto.
  // Aproveitamos a mesma chamada pra já gerar respostas sugeridas para as avaliações reais coletadas.
  const camposFaltantes = await estimarCamposFaltantes(input, detalhes, anthropicKey);

  const avaliacoesRecentes = detalhes.avaliacoesRecentes.map((a, i) => ({
    ...a,
    respostaSugerida: camposFaltantes.respostasSugeridas?.find((r: any) => r.indice === i)?.resposta,
  }));
  const linkAvaliacao = `https://search.google.com/local/writereview?placeid=${principal.id}`;

  return {
    coleta: {
      avaliacoes: detalhes.avaliacoes,
      notaMedia: detalhes.nota,
      fotos: detalhes.fotos,
      categorias: detalhes.categorias,
      produtos: camposFaltantes.produtos,
      servicos: camposFaltantes.servicos,
      descricaoPresente: camposFaltantes.descricaoPresente,
      ultimaPostagem: camposFaltantes.ultimaPostagem,
      perguntasRespostas: camposFaltantes.perguntasRespostas,
      horarioCompleto: detalhes.horarioCompleto,
      linksCompletos: !!detalhes.site,
      telefone: detalhes.telefone,
      whatsapp: camposFaltantes.whatsapp,
      siteAtivo: !!detalhes.site,
      areaAtendimento: camposFaltantes.areaAtendimento,
    },
    concorrentes,
    buscaLocal: { termos: camposFaltantes.termos },
    fonte: "google_places",
    googlePlaceId: principal.id,
    googleLocation: { lat, lng },
    categorias,
    avaliacoesRecentes,
    linkAvaliacao,
  };
}

async function estimarCamposFaltantes(input: EmpresaInput, detalhes: any, anthropicKey: string) {
  const schema = `{
  "produtos": number, "servicos": number, "descricaoPresente": boolean, "ultimaPostagem": string,
  "perguntasRespostas": number, "whatsapp": boolean, "areaAtendimento": boolean,
  "termos": [{"termo": string, "volumeRelativo": "Alto|Médio|Baixo"}],
  "respostasSugeridas": [{"indice": number, "resposta": string}]
}`;
  const reviewsTexto = (detalhes.avaliacoesRecentes || [])
    .map((r: any, i: number) => `[${i}] ${r.autor} deu ${r.nota} estrelas: "${r.texto || '(sem comentário escrito)'}"`)
    .join("\n");

  const prompt = `Você é um consultor de marketing local no Brasil. Já temos dados REAIS do Google Places para "${input.nome}" (${input.segmento}, ${input.bairro || input.cidade}/${input.estado}): nota ${detalhes.nota}, ${detalhes.avaliacoes} avaliações, ${detalhes.fotos} fotos, categorias ${detalhes.categorias.join(", ")}.

A Places API não expõe alguns campos (produtos, serviços, postagens, perguntas e respostas, WhatsApp, área de atendimento, descrição do perfil). Estime esses campos de forma conservadora e realista com base em benchmarks do segmento no Brasil (não são dados reais, são estimativas, isso ficará claro para o operador revisar depois). Também estime as 5 palavras-chave mais prováveis de busca para esse negócio na região, com volume relativo.

${reviewsTexto ? `Estas são as avaliações reais mais recentes do perfil:\n${reviewsTexto}\n\nPara cada uma (usando o índice entre colchetes), escreva uma resposta sugerida, curta (2-4 frases), calorosa, personalizada com o nome do cliente e o conteúdo da avaliação, em português do Brasil, sem travessões, pronta para o dono do negócio colar no Google. Se a avaliação for negativa, a resposta deve ser profissional e buscar resolver o problema, não ser defensiva.` : "Não há avaliações recentes disponíveis, retorne respostasSugeridas como lista vazia."}

Responda ESTRITAMENTE em um único bloco JSON válido, sem markdown, seguindo este schema:
${schema}`;

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": anthropicKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 3000, messages: [{ role: "user", content: prompt }] }),
  });
  const raw = await resp.json();
  if (raw.error) throw new Error(raw.error.message || "Erro na API da Anthropic");
  const textBlocks = (raw.content || []).filter((b: any) => b.type === "text").map((b: any) => b.text).join("\n");
  return extrairJSON(textBlocks);
}

/* ======================= CAMINHO 2: IA com busca na web (sem Google Places configurada) ======================= */
async function pesquisarComIA(input: EmpresaInput, anthropicKey: string): Promise<DadosBrutos> {
  const schema = `{
  "coleta": {"avaliacoes": number, "notaMedia": number, "fotos": number, "categorias": [string], "produtos": number, "servicos": number, "descricaoPresente": boolean, "ultimaPostagem": string, "perguntasRespostas": number, "horarioCompleto": boolean, "linksCompletos": boolean, "telefone": boolean, "whatsapp": boolean, "siteAtivo": boolean, "areaAtendimento": boolean},
  "concorrentes": [{"nome": string, "nota": number, "avaliacoes": number}],
  "buscaLocal": {"termos": [{"termo": string, "volumeRelativo": "Alto|Médio|Baixo"}]}
}`;

  const prompt = `Você é um consultor sênior de marketing local da agência Bulk, especialista em Google Business Profile e SEO local no Brasil. Sua tarefa AGORA é só coletar dados, não escrever diagnóstico ainda.

Pesquise na web informações reais e atuais sobre esta empresa e seus concorrentes diretos:
- Nome: ${input.nome}
- Segmento: ${input.segmento}
- Bairro: ${input.bairro || "não informado"}
- Cidade/Estado: ${input.cidade}/${input.estado}
- Site: ${input.site || "não informado"}
- Google Business: ${input.gbp || "não informado"}

O foco é hiperlocal. Regra de busca geográfica: se o bairro for informado, busque concorrentes ESTRITAMENTE dentro desse bairro primeiro. Só inclua bairros vizinhos se encontrar menos de 4 concorrentes reais dentro do bairro informado. Se o bairro não for informado, use a cidade inteira como raio.

Faça o seguinte:
1. Pesquise o perfil do Google Business/Google Maps dessa empresa (avaliações, nota, fotos, categorias, produtos, serviços, postagens, perguntas e respostas, horário, telefone, whatsapp, área de atendimento). Busque o número exato de avaliações e a nota exata sempre que possível.
2. Pesquise o site institucional, se houver.
3. Identifique até 10 concorrentes diretos seguindo a regra geográfica acima, no mesmo segmento. IMPORTANTE: use exclusivamente nomes reais de empresas encontrados nas buscas. NUNCA use nomes genéricos como "Concorrente 1". É preferível listar 4 concorrentes reais do que 10 inventados.
4. Se não encontrar dados exatos de algum campo, faça estimativas realistas baseadas em benchmarks do segmento no Brasil, e nunca deixe campos vazios.
5. Estime as 5 palavras-chave/termos mais prováveis que um cliente digitaria no Google para encontrar esse tipo de negócio no bairro/cidade informados, com volume de busca relativo (Alto/Médio/Baixo).

Responda ESTRITAMENTE em um único bloco JSON válido, sem markdown, sem texto antes ou depois, seguindo exatamente este schema:
${schema}`;

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": anthropicKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
      tools: [{ type: "web_search_20250305", name: "web_search" }],
    }),
  });
  const raw = await resp.json();
  if (raw.error) throw new Error(raw.error.message || "Erro na API da Anthropic");
  const textBlocks = (raw.content || []).filter((b: any) => b.type === "text").map((b: any) => b.text).join("\n");
  const parsed = extrairJSON(textBlocks);
  return { ...parsed, fonte: "ia_busca_web" };
}
