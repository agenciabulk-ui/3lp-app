"use client";

import { DiagnosticoCompleto, EmpresaInput } from "@/lib/types";
import ScoreGauge from "./ScoreGauge";
import CompetitorChart from "./CompetitorChart";
import RadiusRankingView from "./RadiusRankingView";
import CategoriasView from "./CategoriasView";
import CartaoAvaliacao from "./CartaoAvaliacao";
import AvaliacoesView from "./AvaliacoesView";

function statusFromScore(v: number) {
  if (v >= 75) return { c: "green", l: "Bom" };
  if (v >= 50) return { c: "amber", l: "Atenção" };
  return { c: "red", l: "Crítico" };
}
function colorFromScore(v: number) {
  if (v >= 75) return "#34A853";
  if (v >= 50) return "#F9AB00";
  return "#EA4335";
}

const KPIS: { k: keyof DiagnosticoCompleto["scores"]; l: string }[] = [
  { k: "seoLocal", l: "SEO Local" },
  { k: "avaliacoes", l: "Avaliações" },
  { k: "fotos", l: "Fotos" },
  { k: "produtos", l: "Produtos" },
  { k: "servicos", l: "Serviços" },
  { k: "postagens", l: "Postagens" },
  { k: "conversao", l: "Conversão" },
  { k: "autoridade", l: "Autoridade" },
  { k: "perfilCompleto", l: "Perfil completo" },
];

export default function Dashboard({
  data,
  input,
  isFallback,
  onBack,
  onNext,
  onEdit,
}: {
  data: DiagnosticoCompleto;
  input: EmpresaInput;
  isFallback: boolean;
  onBack: () => void;
  onNext: () => void;
  onEdit: () => void;
}) {
  const s = data.scores;
  const st = statusFromScore(s.geral);
  const localTxt = input.bairro ? `${input.bairro}, ${input.cidade}/${input.estado}` : `${input.cidade}/${input.estado}`;
  const compSub = input.bairro ? `10 principais players do segmento em ${input.bairro} e arredores` : "10 principais players do segmento na região";

  const you = { nome: `${input.nome} (você)`, scoreGeral: s.geral };
  const allComp = [{ nome: you.nome, nota: data.coleta.notaMedia, avaliacoes: data.coleta.avaliacoes, scoreGeral: s.geral }, ...data.concorrentes]
    .sort((a, b) => (b.scoreGeral || 0) - (a.scoreGeral || 0));

  return (
    <section className="stage visible">
      <div className="eyebrow"><span className="dot" />Etapa 3 de 6</div>
      <h1 className="page-title">Dashboard de <em>Posicionamento</em></h1>
      <p className="page-sub">Análise gerada para {input.nome} com base em dados públicos do Google e concorrentes de {input.bairro || input.cidade}.</p>

      {isFallback && (
        <div className="fallback-banner">
          ⚠ A pesquisa automática não pôde ser concluída. Os dados abaixo são estimativas para fins de demonstração, não use este diagnóstico com o cliente sem revisar os números.
        </div>
      )}
      {!isFallback && data.fonte === "google_places" && (
        <div style={{ marginTop: -24, marginBottom: 36, padding: "10px 16px", background: "rgba(52,168,83,.1)", border: "1px solid rgba(52,168,83,.3)", borderRadius: 10, fontSize: 12.5, color: "#34A853", maxWidth: 640 }}>
          ✓ Avaliações, nota e concorrentes vieram diretamente do Google Places API (dados reais). Alguns campos (produtos, postagens, WhatsApp) ainda são estimados, revise antes de apresentar.
        </div>
      )}
      {!isFallback && data.fonte === "ia_busca_web" && (
        <div style={{ marginTop: -24, marginBottom: 36, padding: "10px 16px", background: "rgba(66,133,244,.08)", border: "1px solid rgba(66,133,244,.25)", borderRadius: 10, fontSize: 12.5, color: "var(--blue)", maxWidth: 640 }}>
          ⓘ Dados coletados por IA com busca na web (estimativa). Conecte a Google Places API para números exatos e o ranking por raio de distância.
        </div>
      )}

      <div className="dash-top">
        <div className="score-card">
          <div className="gauge-wrap"><ScoreGauge score={s.geral} /></div>
          <div className="score-status" style={{ background: "transparent", color: colorFromScore(s.geral), border: `1px solid ${colorFromScore(s.geral)}` }}>
            {st.l === "Bom" ? "Bom posicionamento" : st.l === "Atenção" ? "Precisa de atenção" : "Posicionamento crítico"}
          </div>
          <div className="score-empresa">{input.nome}</div>
          <div className="score-meta">{localTxt} · {input.segmento}</div>
          <button className="btn btn-ghost" style={{ marginTop: 16, padding: "8px 16px", fontSize: 12 }} onClick={onEdit}>✎ Corrigir dados coletados</button>
        </div>
        <div className="kpi-grid">
          {KPIS.map((item) => {
            const v = s[item.k] || 0;
            const st2 = statusFromScore(v);
            const col = colorFromScore(v);
            return (
              <div className="kpi" key={item.k}>
                <div className="kpi-head"><span className="kpi-name">{item.l}</span><span className={`badge ${st2.c}`}>{st2.l}</span></div>
                <div className="kpi-val">{v}</div>
                <div className="kpi-bar-track"><div className="kpi-bar-fill" style={{ width: `${v}%`, background: col }} /></div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="section-title">
        <div><h2>Comparação com concorrentes</h2><div className="section-sub">{compSub}</div></div>
      </div>
      <div className="chart-grid">
        <div className="chart-card"><CompetitorChart voce={you} concorrentes={data.concorrentes} /></div>
        <div className="chart-card">
          <table className="comp-table"><thead><tr><th>Empresa</th><th>Nota</th><th>Score</th></tr></thead>
            <tbody>
              {allComp.map((c, i) => {
                const isYou = c.nome === you.nome;
                const col = colorFromScore(c.scoreGeral || 0);
                return (
                  <tr key={i} className={isYou ? "you" : undefined}>
                    <td className="name-cell">{c.nome}{isYou && <span className="you-tag">VOCÊ</span>}</td>
                    <td>{(c.nota || 0).toString().slice(0, 3)} ★</td>
                    <td><span className="mini-bar-track"><span className="mini-bar-fill" style={{ width: `${c.scoreGeral}%`, background: col }} /></span>{c.scoreGeral}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {data.raios && data.raios.length > 0 && <RadiusRankingView raios={data.raios} />}

      {data.categorias && data.categorias.categoriasConcorrentesMaisComuns.length > 0 && <CategoriasView categorias={data.categorias} />}

      {data.linkAvaliacao && (
        <>
          <div className="section-title"><div><h2>Captação de avaliações</h2><div className="section-sub">Ferramenta pronta pra usar com o cliente hoje mesmo</div></div></div>
          <CartaoAvaliacao nome={input.nome} link={data.linkAvaliacao} />
        </>
      )}

      {data.avaliacoesRecentes && data.avaliacoesRecentes.length > 0 && <AvaliacoesView avaliacoes={data.avaliacoesRecentes} />}

      <div className="section-title">
        <div><h2>Como buscam por este negócio no Google</h2><div className="section-sub">Termos mais prováveis de busca e posição estimada frente aos concorrentes</div></div>
      </div>
      <div className="chart-card">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {data.buscaLocal.termos.map((t, i) => {
            const pos = t.posicaoEstimada || 0;
            let pc = { bg: "rgba(52,168,83,.14)", c: "#34A853", label: "Boa posição" };
            if (pos > 7) pc = { bg: "rgba(234,67,53,.14)", c: "#EA4335", label: "Posição fraca" };
            else if (pos > 3) pc = { bg: "rgba(249,171,0,.14)", c: "#F9AB00", label: "Posição mediana" };
            return (
              <div className="busca-row" key={i}>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600 }}>&quot;{t.termo}&quot;</span>
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>Volume de busca estimado: {t.volumeRelativo}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>~{pos}ª posição</span>
                  <span className="badge" style={{ background: pc.bg, color: pc.c }}>{pc.label}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 16, fontSize: 11.5, color: "var(--muted-2)", lineHeight: 1.6 }}>
          ⓘ Posição estimada pela IA com base no perfil coletado e nos concorrentes encontrados, não é um rastreamento em tempo real ponto a ponto no mapa.
        </div>
      </div>

      <div className="btn-row">
        <button className="btn btn-ghost" onClick={onBack}>← Voltar</button>
        <button className="btn btn-primary" onClick={onNext}>Ver diagnóstico →</button>
      </div>
    </section>
  );
}
