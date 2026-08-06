"use client";

import { RaioAnalise } from "@/lib/types";

function corPosicao(pos: number | null) {
  if (pos === null) return { c: "#5F6368", label: "Fora do top 20" };
  if (pos <= 3) return { c: "#34A853", label: "Ótima posição" };
  if (pos <= 7) return { c: "#F9AB00", label: "Posição mediana" };
  return { c: "#EA4335", label: "Posição fraca" };
}

export default function RadiusRankingView({ raios }: { raios: RaioAnalise[] }) {
  return (
    <>
      <div className="section-title">
        <div><h2>Posição por raio de distância</h2><div className="section-sub">Ranking real no Google Maps, medido a partir do endereço do negócio</div></div>
      </div>
      <div className="chart-grid" style={{ gridTemplateColumns: `repeat(${raios.length}, 1fr)` }}>
        {raios.map((r) => {
          const cor = corPosicao(r.posicao);
          return (
            <div className="chart-card" key={r.raioKm}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Raio de {r.raioKm}km</span>
                <span className="badge" style={{ background: `${cor.c}22`, color: cor.c }}>{cor.label}</span>
              </div>
              <div style={{ fontSize: 36, fontWeight: 800, color: cor.c, lineHeight: 1 }}>
                {r.posicao ? `${r.posicao}º` : "—"}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 4, marginBottom: 14 }}>
                de {r.totalResultados} negócios encontrados nesse raio
              </div>
              <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.55, marginBottom: 12 }}>{r.diagnostico}</div>

              {r.acoesCorrigiveis.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--blue)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.3 }}>Corrigível</div>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                    {r.acoesCorrigiveis.map((a, i) => (
                      <li key={i} style={{ fontSize: 12.5, color: "var(--text)", paddingLeft: 14, position: "relative" }}>
                        <span style={{ position: "absolute", left: 0, top: 6, width: 5, height: 5, borderRadius: "50%", background: "var(--blue)" }} />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {r.limitacaoEstrutural && (
                <div style={{ fontSize: 11.5, color: "var(--muted)", background: "var(--panel-2)", padding: "10px 12px", borderRadius: 10, lineHeight: 1.5 }}>
                  <b style={{ color: "var(--muted)" }}>Limitação estrutural:</b> {r.limitacaoEstrutural}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 11.5, color: "var(--muted-2)", lineHeight: 1.6, marginTop: -8, marginBottom: 8 }}>
        ⓘ Posição medida com dados reais do Google Maps no momento da consulta. O ranking do Google muda com o tempo e pode variar conforme quem busca.
      </div>
    </>
  );
}
