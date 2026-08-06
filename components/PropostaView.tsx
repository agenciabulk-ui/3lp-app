"use client";

import { DiagnosticoCompleto, EmpresaInput } from "@/lib/types";

function statusFromScore(v: number) {
  if (v >= 75) return { c: "green", l: "Bom" };
  if (v >= 50) return { c: "amber", l: "Atenção" };
  return { c: "red", l: "Crítico" };
}

function DocHeader({ title }: { title: string }) {
  return (
    <div className="doc-header">
      <div className="dh-mark"><span className="sq" />BULK</div>
      <div className="dh-title">{title}</div>
    </div>
  );
}
function DocFooter({ n, total }: { n: number; total: number }) {
  return (
    <div className="doc-footer"><span>Agência Bulk · Diagnóstico de Posicionamento Google</span><span>{n} / {total}</span></div>
  );
}

const KPI_LABELS: Record<string, string> = { seoLocal: "SEO Local", avaliacoes: "Avaliações", fotos: "Fotos", postagens: "Postagens", perfilCompleto: "Perfil completo" };
const PILL_COLORS: Record<string, { bg: string; c: string }> = {
  green: { bg: "#E7F8EF", c: "#178a4c" },
  amber: { bg: "#FCF3E1", c: "#a9740f" },
  red: { bg: "#FCE9E9", c: "#c22127" },
};

export default function PropostaView({ data, input, onBack }: { data: DiagnosticoCompleto; input: EmpresaInput; onBack: () => void }) {
  const pr = data.proposta;
  const s = data.scores;
  const hasRaios = !!(data.raios && data.raios.length);
  const TOTAL = hasRaios ? 9 : 8;
  const offset = hasRaios ? 1 : 0;
  const today = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <section className="stage visible">
      <div className="eyebrow"><span className="dot" />Etapa 6 de 6</div>
      <h1 className="page-title">Proposta <em>Comercial</em></h1>
      <p className="page-sub">Documento pronto para apresentação. Use o botão abaixo para exportar em PDF (paisagem, alta qualidade).</p>

      <div className="prop-toolbar no-print">
        <button className="btn btn-ghost" onClick={onBack}>← Voltar</button>
        <button className="btn btn-primary" onClick={() => window.print()}>⬇ Exportar PDF</button>
      </div>

      <div className="doc">
        {/* Capa */}
        <div className="doc-page doc-cover">
          <div className="cover-top"><div className="cover-mark">B</div><div style={{ fontWeight: 700 }}>BULK</div></div>
          <div className="cover-mid">
            <div className="cover-eyebrow">Proposta comercial · Google Business</div>
            <h1>Diagnóstico e plano de crescimento no Google para {input.nome}</h1>
            <div className="cover-client">{input.bairro ? `${input.bairro}, ` : ""}{input.cidade}/{input.estado} · {input.segmento}</div>
          </div>
          <div className="cover-bottom"><span>Preparado por Agência Bulk</span><span>{today}</span></div>
        </div>

        {/* Índice */}
        <div className="doc-page">
          <DocHeader title="Índice" />
          <div className="doc-h2">Índice</div>
          <div className="doc-h2-sub">Estrutura completa deste documento.</div>
          <ul className="doc-idx">
            {[
              ["01", "Apresentação", "03"],
              ["02", "Diagnóstico e problemas encontrados", "04"],
              ["03", "Análise da concorrência", "05"],
              ["04", "Benefícios e escopo do serviço", "06"],
              ["05", "Cronograma e investimento", "07"],
              ["06", "Próximos passos", "08"],
            ].map(([n, label, p]) => (
              <li key={n}><span className="idx-n">{n}</span><span>{label}</span><span className="idx-dots" /><span className="idx-p">{p}</span></li>
            ))}
          </ul>
          <DocFooter n={2} total={TOTAL} />
        </div>

        {/* Apresentação */}
        <div className="doc-page">
          <DocHeader title="01 · Apresentação" />
          <div className="doc-h2">Resumo executivo</div>
          <div className="doc-h2-sub">Visão geral da situação atual de {input.nome} no Google.</div>
          <div className="doc-cards3">
            <div className="doc-mini-card"><div className="n">{s.geral}/100</div><div className="l">Score geral</div></div>
            <div className="doc-mini-card"><div className="n">{data.coleta.avaliacoes}</div><div className="l">Avaliações no Google</div></div>
            <div className="doc-mini-card"><div className="n">{data.concorrentes.length}</div><div className="l">Concorrentes mapeados</div></div>
          </div>
          <div className="doc-body"><p>{pr.resumoExecutivo}</p><br /><p>{pr.apresentacao}</p></div>
          <DocFooter n={3} total={TOTAL} />
        </div>

        {/* Problemas */}
        <div className="doc-page">
          <DocHeader title="02 · Diagnóstico" />
          <div className="doc-h2">Problemas encontrados</div>
          <div className="doc-h2-sub">Pontos que limitam hoje o desempenho do perfil no Google.</div>
          <div className="doc-body"><p>{pr.problemasEncontrados}</p></div>
          <br />
          <table className="doc-table">
            <thead><tr><th>Indicador</th><th>Score</th><th>Situação</th></tr></thead>
            <tbody>
              {Object.keys(KPI_LABELS).map((k) => {
                const v = (s as any)[k] || 0;
                const st = statusFromScore(v);
                const pc = PILL_COLORS[st.c];
                return (
                  <tr key={k}><td>{KPI_LABELS[k]}</td><td>{v}/100</td><td><span className="doc-pill" style={{ background: pc.bg, color: pc.c }}>{st.l}</span></td></tr>
                );
              })}
            </tbody>
          </table>
          <DocFooter n={4} total={TOTAL} />
        </div>

        {/* Concorrência */}
        <div className="doc-page">
          <DocHeader title="03 · Concorrência" />
          <div className="doc-h2">Análise da concorrência</div>
          <div className="doc-h2-sub">Comparação com os principais players locais do segmento.</div>
          <div className="doc-body"><p>{pr.analiseConcorrencia}</p></div>
          <br />
          <table className="doc-table">
            <thead><tr><th>Empresa</th><th>Nota</th><th>Avaliações</th><th>Score</th></tr></thead>
            <tbody>
              <tr style={{ background: "#EAF2FB" }}><td><b>{input.nome} (você)</b></td><td>{data.coleta.notaMedia} ★</td><td>{data.coleta.avaliacoes}</td><td><b>{s.geral}</b></td></tr>
              {data.concorrentes.slice(0, 8).map((c, i) => (
                <tr key={i}><td>{c.nome}</td><td>{c.nota} ★</td><td>{c.avaliacoes}</td><td>{c.scoreGeral}</td></tr>
              ))}
            </tbody>
          </table>
          <DocFooter n={5} total={TOTAL} />
        </div>

        {/* Posição por raio de distância */}
        {hasRaios && (
          <div className="doc-page">
            <DocHeader title="03b · Posição por raio de distância" />
            <div className="doc-h2">Posição por raio de distância</div>
            <div className="doc-h2-sub">Ranking real no Google Maps a partir do endereço do negócio, buscando por &quot;{input.segmento}&quot;.</div>
            <div className="doc-cards3">
              {data.raios!.map((r) => {
                const cor = r.posicao === null ? "#5F6368" : r.posicao <= 3 ? "#178a4c" : r.posicao <= 7 ? "#a9740f" : "#c22127";
                return (
                  <div className="doc-mini-card" key={r.raioKm}>
                    <div className="n" style={{ color: cor }}>{r.posicao ? `${r.posicao}º` : "—"}</div>
                    <div className="l">Raio de {r.raioKm}km · {r.totalResultados} negócios</div>
                  </div>
                );
              })}
            </div>
            {data.raios!.map((r) => (
              <div className="doc-body" key={r.raioKm} style={{ marginBottom: 14 }}>
                <p><b>Raio de {r.raioKm}km:</b> {r.diagnostico}{r.limitacaoEstrutural ? ` ${r.limitacaoEstrutural}` : ""}</p>
              </div>
            ))}
            <DocFooter n={6} total={TOTAL} />
          </div>
        )}

        {/* Benefícios */}
        <div className="doc-page">
          <DocHeader title="04 · Benefícios e escopo" />
          <div className="doc-h2">Benefícios e escopo do serviço</div>
          <div className="doc-h2-sub">O que muda na prática com a gestão contínua da Bulk.</div>
          <div className="doc-benefits">
            {pr.beneficios.map((b, i) => (
              <div className="doc-benefit" key={i}><span className="chk">✓</span><span>{b}</span></div>
            ))}
          </div>
          <br />
          <div className="doc-body">
            <b>Escopo inclui:</b> organização completa do Google Business (categorias, descrição, SEO local, produtos, serviços, fotos, vídeos, perguntas e respostas), estratégia para novas avaliações, postagens semanais, página de apoio otimizada, configuração de botões e links, definição de área de atendimento, relatórios mensais, monitoramento e comparação contínua com concorrentes.
          </div>
          <DocFooter n={6 + offset} total={TOTAL} />
        </div>

        {/* Investimento */}
        <div className="doc-page">
          <DocHeader title="05 · Cronograma e investimento" />
          <div className="doc-h2">Cronograma e investimento</div>
          <div className="doc-h2-sub">Como o trabalho é estruturado e o retorno esperado.</div>
          <div className="doc-body"><p>{pr.cronograma}</p></div>
          <div className="doc-invest-box"><div className="lbl">Investimento sugerido</div><p style={{ fontSize: 14, lineHeight: 1.7 }}>{pr.investimento}</p></div>
          <br />
          <div className="doc-body"><p><b>Por que investir:</b> {pr.justificativaInvestimento}</p></div>
          <DocFooter n={7 + offset} total={TOTAL} />
        </div>

        {/* Próximos passos */}
        <div className="doc-page">
          <DocHeader title="06 · Próximos passos" />
          <div className="doc-h2">Próximos passos</div>
          <div className="doc-h2-sub">Como damos início ao trabalho assim que a proposta for aprovada.</div>
          {pr.proximosPassos.map((p, i) => (
            <div className="doc-step" key={i}><div className="sn">{i + 1}</div><div style={{ fontSize: 13.5, color: "#333", paddingTop: 5 }}>{p}</div></div>
          ))}
          <br />
          <div style={{ marginTop: 10 }}>
            {pr.objecoes.slice(0, 2).map((o, i) => (
              <div className="doc-obj" key={i}><div className="q">{o.objecao}</div><div className="a">{o.resposta}</div></div>
            ))}
          </div>
          <div className="doc-body" style={{ marginTop: 14 }}><p>{pr.conclusao}</p></div>
          <DocFooter n={8 + offset} total={TOTAL} />
        </div>
      </div>
    </section>
  );
}
