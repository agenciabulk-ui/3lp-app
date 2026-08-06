"use client";

import { PlanoAcao, Tarefa } from "@/lib/types";

function prioColor(p: string) {
  const low = (p || "").toLowerCase();
  if (low.includes("alta")) return { bg: "rgba(234,67,53,.14)", c: "#EA4335" };
  if (low.includes("méd") || low.includes("med")) return { bg: "rgba(249,171,0,.14)", c: "#F9AB00" };
  return { bg: "rgba(52,168,83,.14)", c: "#34A853" };
}

function Col({ title, tagClass, tasks }: { title: string; tagClass: string; tasks: Tarefa[] }) {
  return (
    <div>
      <div className="plano-col-head"><span className={`tag ${tagClass}`} /><h4>{title}</h4></div>
      {tasks.map((t, i) => {
        const pc = prioColor(t.prioridade);
        return (
          <div className="task" key={i}>
            <span className="task-prio" style={{ background: pc.bg, color: pc.c }}>{t.prioridade}</span>
            <div className="task-desc">{t.descricao}</div>
            <div className="task-meta"><span><b>Impacto:</b> {t.impacto}</span><span>{t.tempoEstimado}</span></div>
          </div>
        );
      })}
    </div>
  );
}

export default function PlanoAcaoView({ plano, onBack, onNext }: { plano: PlanoAcao; onBack: () => void; onNext: () => void }) {
  return (
    <section className="stage visible">
      <div className="eyebrow"><span className="dot" />Etapa 5 de 6</div>
      <h1 className="page-title">Plano de <em>Ação</em></h1>
      <p className="page-sub">Roadmap de execução dividido por horizonte de tempo.</p>

      <div className="plano-cols">
        <Col title="Urgente" tagClass="tag-urgente" tasks={plano.urgente} />
        <Col title="30 dias" tagClass="tag-30" tasks={plano.dias30} />
        <Col title="60 dias" tagClass="tag-60" tasks={plano.dias60} />
        <Col title="90 dias" tagClass="tag-90" tasks={plano.dias90} />
      </div>

      <div className="btn-row">
        <button className="btn btn-ghost" onClick={onBack}>← Voltar</button>
        <button className="btn btn-primary" onClick={onNext}>Gerar proposta comercial →</button>
      </div>
    </section>
  );
}
