import { NextRequest, NextResponse } from "next/server";
import { extrairJSON } from "@/lib/fallback";
import { DadosBrutos, EmpresaInput } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY não configurada no servidor." }, { status: 500 });
  }

  const { input, dados } = (await req.json()) as { input: EmpresaInput; dados: DadosBrutos };

  const schema = `{
  "scores": {"geral": number, "seoLocal": number, "avaliacoes": number, "fotos": number, "produtos": number, "servicos": number, "postagens": number, "conversao": number, "autoridade": number, "perfilCompleto": number},
  "concorrentes": [{"nome": string, "nota": number, "avaliacoes": number, "scoreGeral": number}],
  "buscaLocal": {"termos": [{"termo": string, "posicaoEstimada": number, "volumeRelativo": "Alto|Médio|Baixo"}]},
  "diagnostico": {"pontosFortes": [string], "pontosFracos": [string], "oportunidades": [string], "prioridades": [string], "acoesRecomendadas": [string]},
  "planoAcao": {"urgente": [{"prioridade": "Alta|Média|Baixa", "descricao": string, "impacto": string, "tempoEstimado": string}], "dias30": [...], "dias60": [...], "dias90": [...]},
  "proposta": {"resumoExecutivo": string, "apresentacao": string, "problemasEncontrados": string, "analiseConcorrencia": string, "beneficios": [string], "cronograma": string, "investimento": string, "objecoes": [{"objecao": string, "resposta": string}], "justificativaInvestimento": string, "proximosPassos": [string], "conclusao": string}
}`;

  const prompt = `Você é um consultor sênior de marketing local da agência Bulk, especialista em Google Business Profile e SEO local no Brasil.

Um operador da agência já coletou e CONFIRMOU manualmente os dados abaixo sobre a empresa "${input.nome}" (${input.segmento}, ${input.bairro ? input.bairro + ", " : ""}${input.cidade}/${input.estado}). Use EXATAMENTE esses dados como verdade, não pesquise nem invente novos concorrentes ou números diferentes:

${JSON.stringify(dados, null, 2)}

Com base exclusivamente nesses dados confirmados:
1. Calcule scores de 0 a 100 para: geral, seoLocal, avaliacoes, fotos, produtos, servicos, postagens, conversao, autoridade, perfilCompleto, considerando os dados da empresa e a comparação com os concorrentes informados.
2. Para cada concorrente da lista confirmada, atribua um scoreGeral (0-100) coerente com a nota e avaliações dele frente aos demais. Não adicione nem remova concorrentes da lista.
3. Para cada termo de busca confirmado, estime uma posicaoEstimada (1 a 20+) de ${input.nome} nesse termo, com base na comparação com os concorrentes. Não adicione nem remova termos.
4. Escreva um diagnóstico comercial (pontos fortes, pontos fracos, oportunidades, prioridades, ações recomendadas) em linguagem persuasiva e profissional, em português do Brasil, sem usar travessões.
5. Monte um plano de ação completo e detalhado, dividido em Urgente, 30 dias, 60 dias e 90 dias, com NO MÍNIMO 5 e no máximo 7 tarefas em cada fase. Cada tarefa precisa ter prioridade, descrição, impacto esperado e tempo estimado. Este plano será apresentado AO VIVO para o cliente durante uma reunião comercial, com o objetivo de fazer o cliente perceber com clareza tudo que está errado ou incompleto hoje e sentir urgência em contratar. Portanto:
   - Baseie cada tarefa em uma lacuna real e específica encontrada nos dados coletados (cite números concretos sempre que possível).
   - Na fase "Urgente", inclua tudo que está crítico e visível imediatamente ao cliente.
   - Nas fases 30/60/90 dias, evolua para ações de crescimento e consolidação.
   - Use descrições específicas, nunca genéricas.
6. Escreva os textos de uma proposta comercial completa da Bulk (resumo executivo, apresentação, problemas encontrados, análise da concorrência, benefícios em lista, cronograma em texto corrido, investimento em texto corrido sugerindo uma faixa plausível de mercado para gestão de Google Business mensal no Brasil sem inventar valor fixo, 3 objeções comuns do cliente com resposta, justificativa do investimento, próximos passos em lista, e conclusão). Tom: consultoria estratégica de alto nível, direto ao ponto, sem travessões.

Responda ESTRITAMENTE em um único bloco JSON válido, sem markdown, sem texto antes ou depois, seguindo exatamente este schema:
${schema}`;

  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 11000,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const raw = await resp.json();
    if (raw.error) throw new Error(raw.error.message || "Erro na API da Anthropic");
    const textBlocks = (raw.content || [])
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("\n");
    const parsed = extrairJSON(textBlocks);
    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Falha ao gerar análise" }, { status: 500 });
  }
}
