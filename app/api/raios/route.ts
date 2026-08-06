import { NextRequest, NextResponse } from "next/server";
import { extrairJSON } from "@/lib/fallback";
import { EmpresaInput, RaioPosicao } from "@/lib/types";
import { buscarPorTextoNoRaio } from "@/lib/googlePlaces";

export const runtime = "nodejs";

const RAIOS_METROS = [1000, 2000, 3000];

export async function POST(req: NextRequest) {
  const placesKey = process.env.GOOGLE_PLACES_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!placesKey) {
    return NextResponse.json({ error: "GOOGLE_PLACES_API_KEY não configurada. Este recurso precisa da Google Places API." }, { status: 400 });
  }
  if (!anthropicKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY não configurada no servidor." }, { status: 500 });
  }

  const { input, placeId, lat, lng } = (await req.json()) as { input: EmpresaInput; placeId: string; lat: number; lng: number };

  try {
    const posicoes: RaioPosicao[] = [];
    for (const raioMetros of RAIOS_METROS) {
      const resultados = await buscarPorTextoNoRaio(placesKey, input.segmento, lat, lng, raioMetros, 20);
      const idx = resultados.findIndex((r) => r.id === placeId);
      const posicao = idx === -1 ? null : idx + 1;
      const concorrentesNaFrente = idx > 0 ? resultados.slice(0, idx).map((r) => ({ nome: r.nome, nota: r.nota, avaliacoes: r.avaliacoes })) : [];
      posicoes.push({
        raioKm: raioMetros / 1000,
        posicao,
        totalResultados: resultados.length,
        concorrentesNaFrente,
      });
    }

    const analise = await gerarAnaliseRaios(input, posicoes, anthropicKey);
    return NextResponse.json({ raios: analise });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Falha ao analisar raios de distância" }, { status: 500 });
  }
}

async function gerarAnaliseRaios(input: EmpresaInput, posicoes: RaioPosicao[], anthropicKey: string) {
  const schema = `[{"raioKm": number, "diagnostico": string, "acoesCorrigiveis": [string], "limitacaoEstrutural": "string ou null"}]`;

  const prompt = `Você é um consultor sênior de SEO local no Brasil. Estes são dados REAIS do Google Maps sobre a posição de "${input.nome}" (${input.segmento}) em diferentes raios de distância, buscando pelo termo "${input.segmento}":

${JSON.stringify(posicoes, null, 2)}

O Google usa 3 fatores de ranking local: relevância, distância e proeminência (avaliações, completude de perfil, autoridade). Distância é física e não pode ser "otimizada", é uma limitação estrutural. Proeminência e relevância são corrigíveis com trabalho de perfil.

Para cada raio, escreva:
1. Um diagnóstico curto e direto (1-2 frases) explicando por que o negócio está naquela posição, comparando com os concorrentes à frente listados (nota e avaliações deles vs o negócio analisado).
2. Uma lista de 2-4 ações corrigíveis específicas (relacionadas a perfil, avaliações, fotos, categorias) que podem melhorar a posição NAQUELE raio.
3. Se a posição parecer limitada principalmente pela distância física (concorrentes à frente estruturalmente mais centrais, mesmo com perfil pior), explique isso em "limitacaoEstrutural". Se não houver essa limitação clara, retorne null.

Seja honesto e realista, sem prometer 1º lugar garantido em nenhum raio. Isso será apresentado ao cliente ao vivo, então precisa ser um diagnóstico crível, não genérico.

Responda ESTRITAMENTE com um array JSON válido, sem markdown, seguindo exatamente este schema:
${schema}`;

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": anthropicKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 3000, messages: [{ role: "user", content: prompt }] }),
  });
  const raw = await resp.json();
  if (raw.error) throw new Error(raw.error.message || "Erro na API da Anthropic");
  const textBlocks = (raw.content || []).filter((b: any) => b.type === "text").map((b: any) => b.text).join("\n");
  const analiseTextos: { raioKm: number; diagnostico: string; acoesCorrigiveis: string[]; limitacaoEstrutural: string | null }[] = extrairJSON(textBlocks);

  return posicoes.map((p) => {
    const texto = analiseTextos.find((a) => a.raioKm === p.raioKm);
    return {
      ...p,
      diagnostico: texto?.diagnostico || "",
      acoesCorrigiveis: texto?.acoesCorrigiveis || [],
      limitacaoEstrutural: texto?.limitacaoEstrutural || null,
    };
  });
}
