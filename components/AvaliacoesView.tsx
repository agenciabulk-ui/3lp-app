"use client";

import { useState } from "react";
import { Avaliacao } from "@/lib/types";

export default function AvaliacoesView({ avaliacoes }: { avaliacoes: Avaliacao[] }) {
  const [copiadoIdx, setCopiadoIdx] = useState<number | null>(null);

  function copiar(texto: string, i: number) {
    navigator.clipboard.writeText(texto);
    setCopiadoIdx(i);
    setTimeout(() => setCopiadoIdx(null), 2000);
  }

  return (
    <>
      <div className="section-title">
        <div><h2>Avaliações recentes</h2><div className="section-sub">Últimas avaliações reais do Google, com resposta sugerida pela IA</div></div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {avaliacoes.map((a, i) => (
          <div key={i} className="chart-card">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 13.5 }}>{a.autor}</span>
              <span style={{ color: "#F9AB00", fontSize: 13 }}>{"★".repeat(a.nota)}{"☆".repeat(5 - a.nota)}</span>
            </div>
            <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.55, marginBottom: 12 }}>
              {a.texto || <i style={{ color: "var(--muted-2)" }}>Sem comentário escrito</i>}
            </div>
            {a.respostaSugerida && (
              <div style={{ background: "var(--panel-2)", borderRadius: 10, padding: "12px 14px", fontSize: 12.5, color: "var(--text)", lineHeight: 1.55 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--blue)", textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 6 }}>
                  Resposta sugerida pela IA
                </div>
                {a.respostaSugerida}
                <div style={{ marginTop: 10 }}>
                  <button className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: 11.5 }} onClick={() => copiar(a.respostaSugerida!, i)}>
                    {copiadoIdx === i ? "Copiado ✓" : "Copiar resposta"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11.5, color: "var(--muted-2)", lineHeight: 1.6, marginTop: 8 }}>
        ⓘ As respostas precisam ser coladas manualmente no Google Business. Publicar automaticamente exigiria acesso de administrador do cliente, é uma modalidade de produto diferente (gestão recorrente).
      </div>
    </>
  );
}
