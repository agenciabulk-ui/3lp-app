"use client";

import { CategoriaAnalise } from "@/lib/types";

function traduzCategoria(tipo: string) {
  return tipo
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export default function CategoriasView({ categorias }: { categorias: CategoriaAnalise }) {
  return (
    <>
      <div className="section-title">
        <div><h2>Categorias no Google</h2><div className="section-sub">Comparação com as categorias mais usadas pelos concorrentes do raio pesquisado</div></div>
      </div>
      <div className="chart-grid">
        <div className="chart-card">
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--muted)", marginBottom: 12 }}>Suas categorias atuais</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {categorias.nossasCategorias.length === 0 && <span style={{ fontSize: 13, color: "var(--muted-2)" }}>Nenhuma categoria identificada</span>}
            {categorias.nossasCategorias.map((c, i) => (
              <span key={i} className="badge green" style={{ fontSize: 12, padding: "6px 12px" }}>{traduzCategoria(c)}</span>
            ))}
          </div>

          {categorias.categoriasFaltantes.length > 0 && (
            <>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--muted)", margin: "22px 0 12px" }}>Categorias que concorrentes usam e você não usa</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {categorias.categoriasFaltantes.map((c, i) => (
                  <span key={i} className="badge red" style={{ fontSize: 12, padding: "6px 12px" }}>{traduzCategoria(c)}</span>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="chart-card">
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--muted)", marginBottom: 14 }}>Categorias mais comuns entre concorrentes</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {categorias.categoriasConcorrentesMaisComuns.map((c, i) => {
              const max = categorias.categoriasConcorrentesMaisComuns[0]?.ocorrencias || 1;
              const temos = categorias.nossasCategorias.includes(c.categoria);
              return (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
                    <span>{traduzCategoria(c.categoria)} {temos && <span style={{ color: "var(--green)" }}>✓</span>}</span>
                    <span style={{ color: "var(--muted)" }}>{c.ocorrencias} concorrentes</span>
                  </div>
                  <div className="kpi-bar-track"><div className="kpi-bar-fill" style={{ width: `${(c.ocorrencias / max) * 100}%`, background: temos ? "#34A853" : "#EA4335" }} /></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
