"use client";

import { Diagnostico } from "@/lib/types";

export default function DiagnosticoView({ diagnostico, onBack, onNext }: { diagnostico: Diagnostico; onBack: () => void; onNext: () => void }) {
  return (
    <section className="stage visible">
      <div className="eyebrow"><span className="dot" />Etapa 4 de 6</div>
      <h1 className="page-title">Diagnóstico <em>Estratégico</em></h1>
      <p className="page-sub">Leitura comercial da situação atual, pronta para apresentar ao cliente.</p>

      <div className="diag-grid">
        <div className="diag-card diag-forte">
          <h3><span className="ic">✓</span>Pontos fortes</h3>
          <ul>{diagnostico.pontosFortes.map((t, i) => <li key={i}>{t}</li>)}</ul>
        </div>
        <div className="diag-card diag-fraco">
          <h3><span className="ic">!</span>Pontos fracos</h3>
          <ul>{diagnostico.pontosFracos.map((t, i) => <li key={i}>{t}</li>)}</ul>
        </div>
        <div className="diag-card diag-oport">
          <h3><span className="ic">↗</span>Oportunidades</h3>
          <ul>{diagnostico.oportunidades.map((t, i) => <li key={i}>{t}</li>)}</ul>
        </div>
        <div className="diag-card diag-prior">
          <h3><span className="ic">★</span>Prioridades</h3>
          <ul>{diagnostico.prioridades.map((t, i) => <li key={i}>{t}</li>)}</ul>
        </div>
        <div className="diag-card diag-full">
          <h3><span className="ic" style={{ background: "var(--blue-soft)", color: "var(--blue)" }}>→</span>Ações recomendadas</h3>
          <div className="acoes-list">
            {diagnostico.acoesRecomendadas.map((a, i) => (
              <div className="acao-row" key={i}><div className="acao-num">{i + 1}</div><div className="acao-text">{a}</div></div>
            ))}
          </div>
        </div>
      </div>

      <div className="btn-row">
        <button className="btn btn-ghost" onClick={onBack}>← Voltar</button>
        <button className="btn btn-primary" onClick={onNext}>Ver plano de ação →</button>
      </div>
    </section>
  );
}
