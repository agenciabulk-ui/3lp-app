"use client";

import { useEffect, useRef, useState } from "react";
import Stepper, { StageKey } from "@/components/Stepper";
import ReviewForm from "@/components/ReviewForm";
import Dashboard from "@/components/Dashboard";
import DiagnosticoView from "@/components/DiagnosticoView";
import PlanoAcaoView from "@/components/PlanoAcaoView";
import PropostaView from "@/components/PropostaView";
import { gerarFallback } from "@/lib/fallback";
import { DadosBrutos, DiagnosticoCompleto, EmpresaInput } from "@/lib/types";

type ItemHistorico = {
  id: string;
  created_at: string;
  nome_empresa: string;
  bairro: string | null;
  cidade: string;
  estado: string;
  segmento: string;
  fonte: string | null;
  score_geral: number | null;
};

const RESEARCH_STEPS = [
  "Consultando Google Maps",
  "Analisando perfil do Google Business",
  "Verificando site institucional",
  "Mapeando concorrentes locais",
  "Calculando pontuação de posicionamento",
  "Redigindo diagnóstico comercial",
];

function ResearchLoading() {
  const [activeIdx, setActiveIdx] = useState(0);
  useEffect(() => {
    setActiveIdx(0);
    const t = setInterval(() => setActiveIdx((i) => Math.min(i + 1, RESEARCH_STEPS.length)), 1900);
    return () => clearInterval(t);
  }, []);
  return (
    <section className="stage visible">
      <div className="research-wrap">
        <div className="radar"><div className="radar-ring" /><div className="radar-core" /></div>
        <div className="research-title">Pesquisando presença digital...</div>
        <div className="research-line">Isso leva cerca de 30 a 60 segundos.</div>
        <div className="research-log">
          {RESEARCH_STEPS.map((s, i) => (
            <div key={i} className={"research-item" + (i === activeIdx ? " active" : i < activeIdx ? " done" : "")}>
              <span className="ic">{i < activeIdx ? "✓" : "○"}</span><span>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [stage, setStage] = useState<StageKey>("1");
  const [maxDot, setMaxDot] = useState(1);
  const [input, setInput] = useState<EmpresaInput>({ nome: "", bairro: "", cidade: "", estado: "", segmento: "", site: "", gbp: "" });
  const [dadosBrutos, setDadosBrutos] = useState<DadosBrutos | null>(null);
  const [data, setData] = useState<DiagnosticoCompleto | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [historico, setHistorico] = useState<ItemHistorico[]>([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(true);

  useEffect(() => {
    carregarHistorico();
  }, []);

  async function carregarHistorico() {
    try {
      const resp = await fetch("/api/diagnosticos");
      const json = await resp.json();
      setHistorico(json.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setCarregandoHistorico(false);
    }
  }

  async function salvarDiagnostico(inputSalvo: EmpresaInput, dataSalva: DiagnosticoCompleto) {
    try {
      await fetch("/api/diagnosticos", { method: "POST", body: JSON.stringify({ input: inputSalvo, dados: dataSalva }) });
      carregarHistorico();
    } catch (e) {
      console.error(e); // salvar histórico nunca deve travar o fluxo principal
    }
  }

  async function reabrirDiagnostico(id: string) {
    try {
      const resp = await fetch(`/api/diagnosticos/${id}`);
      const registro = await resp.json();
      if (registro.error) throw new Error(registro.error);
      setInput(registro.input);
      setData(registro.dados);
      setIsFallback(false);
      irPara("3");
    } catch (e) {
      console.error(e);
      toast("Não consegui abrir esse diagnóstico salvo.");
    }
  }

  const DOT_MAP: Record<StageKey, number> = { "1": 1, "2": 2, "2b": 2, "3": 3, "4": 4, "5": 5, "6": 6 };

  function irPara(s: StageKey) {
    setStage(s);
    setMaxDot((m) => Math.max(m, DOT_MAP[s]));
  }

  function toast(msg: string) {
    setToastMsg(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(""), 3800);
  }

  async function iniciarAnalise() {
    if (!input.nome || !input.cidade || !input.estado || !input.segmento) {
      toast("Preencha nome, cidade, estado e segmento para continuar.");
      return;
    }
    irPara("2");
    try {
      const respPesquisa = await fetch("/api/pesquisar", { method: "POST", body: JSON.stringify(input) });
      const dados: DadosBrutos = await respPesquisa.json();
      if ((dados as any).error) throw new Error((dados as any).error);
      setIsFallback(false);

      try {
        const respAnalise = await fetch("/api/analisar", { method: "POST", body: JSON.stringify({ input, dados }) });
        const analise = await respAnalise.json();
        if (analise.error) throw new Error(analise.error);
        const full: DiagnosticoCompleto = { coleta: dados.coleta, fonte: dados.fonte, categorias: dados.categorias, avaliacoesRecentes: dados.avaliacoesRecentes, linkAvaliacao: dados.linkAvaliacao, ...analise };

        if (dados.googlePlaceId && dados.googleLocation) {
          try {
            const respRaios = await fetch("/api/raios", {
              method: "POST",
              body: JSON.stringify({ input, placeId: dados.googlePlaceId, lat: dados.googleLocation.lat, lng: dados.googleLocation.lng }),
            });
            const raiosData = await respRaios.json();
            if (!raiosData.error) full.raios = raiosData.raios;
          } catch (errRaios) {
            console.error(errRaios);
          }
        }

        setData(full); salvarDiagnostico(input, full);
        irPara("3");
      } catch (err2) {
        console.error(err2);
        toast("Não consegui concluir a análise agora. Usando estimativa para não travar o fluxo.");
        const fb = gerarFallback(input);
        const full: DiagnosticoCompleto = {
          coleta: dados.coleta,
          scores: fb.scores,
          diagnostico: fb.diagnostico,
          planoAcao: fb.planoAcao,
          proposta: fb.proposta,
          concorrentes: dados.concorrentes.length ? dados.concorrentes.map((c, i) => ({ ...c, scoreGeral: fb.concorrentes[i % fb.concorrentes.length].scoreGeral })) : fb.concorrentes,
          buscaLocal: { termos: dados.buscaLocal.termos.length ? dados.buscaLocal.termos.map((t, i) => ({ ...t, posicaoEstimada: fb.buscaLocal.termos[i % fb.buscaLocal.termos.length].posicaoEstimada })) : fb.buscaLocal.termos },
        };
        setData(full); salvarDiagnostico(input, full);
        irPara("3");
      }
    } catch (err) {
      console.error(err);
      toast("Não consegui concluir a pesquisa automática. Confira e preencha manualmente.");
      const fb = gerarFallback(input);
      setIsFallback(true);
      setDadosBrutos({
        coleta: fb.coleta,
        concorrentes: fb.concorrentes.map((c) => ({ nome: c.nome, nota: c.nota, avaliacoes: c.avaliacoes })),
        buscaLocal: { termos: fb.buscaLocal.termos.map((t) => ({ termo: t.termo, volumeRelativo: t.volumeRelativo })) },
      });
      irPara("2b");
    }
  }

  async function confirmarDados(dadosConfirmados: DadosBrutos) {
    setConfirmLoading(true);
    try {
      const resp = await fetch("/api/analisar", { method: "POST", body: JSON.stringify({ input, dados: dadosConfirmados }) });
      const analise = await resp.json();
      if (analise.error) throw new Error(analise.error);
      const full: DiagnosticoCompleto = { coleta: dadosConfirmados.coleta, ...analise };
      setData(full); salvarDiagnostico(input, full);
      irPara("3");
    } catch (err) {
      console.error(err);
      toast("Não consegui gerar o diagnóstico agora. Usando estimativa para não travar o fluxo.");
      const fb = gerarFallback(input);
      const full: DiagnosticoCompleto = {
        coleta: dadosConfirmados.coleta,
        scores: fb.scores,
        diagnostico: fb.diagnostico,
        planoAcao: fb.planoAcao,
        proposta: fb.proposta,
        concorrentes: dadosConfirmados.concorrentes.length ? dadosConfirmados.concorrentes.map((c, i) => ({ ...c, scoreGeral: fb.concorrentes[i % fb.concorrentes.length].scoreGeral })) : fb.concorrentes,
        buscaLocal: { termos: dadosConfirmados.buscaLocal.termos.length ? dadosConfirmados.buscaLocal.termos.map((t, i) => ({ ...t, posicaoEstimada: fb.buscaLocal.termos[i % fb.buscaLocal.termos.length].posicaoEstimada })) : fb.buscaLocal.termos },
      };
      setData(full); salvarDiagnostico(input, full);
      irPara("3");
    } finally {
      setConfirmLoading(false);
    }
  }

  function abrirEdicaoDados() {
    if (!data) return;
    setDadosBrutos({ coleta: data.coleta, concorrentes: data.concorrentes, buscaLocal: data.buscaLocal });
    irPara("2b");
  }

  return (
    <>
      <div className="topbar">
        <div className="brand">
          <div className="brand-mark">3</div>
          <div>
            <div className="brand-name">3LP</div>
            <div className="brand-tag">Top 3 Local Presence</div>
          </div>
        </div>
        <Stepper
          currentStage={stage}
          maxDot={maxDot}
          hasData={!!data}
          onNavigate={(s) => irPara(s)}
          onEdit={abrirEdicaoDados}
        />
      </div>

      <div className="shell">
        {stage === "1" && (
          <section className="stage visible">
            <div className="eyebrow"><span className="dot" />Etapa 1 de 6</div>
            <h1 className="page-title">Vamos diagnosticar a<br /><em>presença digital</em> do seu cliente.</h1>
            <p className="page-sub">Preencha os dados abaixo. A ferramenta vai pesquisar o Google Business, o site e os principais concorrentes automaticamente, e gerar um dashboard e uma proposta comercial prontos para envio.</p>

            <div className="card">
              <div className="grid2">
                <div className="field"><label>Nome da empresa</label><input value={input.nome} onChange={(e) => setInput({ ...input, nome: e.target.value })} placeholder="Ex: Vidraçaria Ideal" /></div>
                <div className="field"><label>Segmento</label><input value={input.segmento} onChange={(e) => setInput({ ...input, segmento: e.target.value })} placeholder="Ex: Vidraçaria, clínica, barbearia..." /></div>
                <div className="field"><label>Bairro</label><input value={input.bairro} onChange={(e) => setInput({ ...input, bairro: e.target.value })} placeholder="Ex: Freguesia, Barra da Tijuca..." /></div>
                <div className="field"><label>Cidade</label><input value={input.cidade} onChange={(e) => setInput({ ...input, cidade: e.target.value })} placeholder="Ex: Rio de Janeiro" /></div>
                <div className="field"><label>Estado</label><input value={input.estado} onChange={(e) => setInput({ ...input, estado: e.target.value })} placeholder="Ex: RJ" /></div>
                <div className="field"><label>Site <span className="opt">(opcional)</span></label><input value={input.site} onChange={(e) => setInput({ ...input, site: e.target.value })} placeholder="https://..." /></div>
                <div className="field"><label>Link do Google Meu Negócio <span className="opt">(opcional)</span></label><input value={input.gbp} onChange={(e) => setInput({ ...input, gbp: e.target.value })} placeholder="https://g.page/..." /></div>
              </div>
              <div className="btn-row">
                <span style={{ fontSize: 12.5, color: "var(--muted-2)" }}>Os dados são usados apenas para gerar este diagnóstico.</span>
                <button className="btn btn-primary" onClick={iniciarAnalise}>Analisar empresa →</button>
              </div>
            </div>

            {!carregandoHistorico && historico.length > 0 && (
              <>
                <div className="section-title"><div><h2>Diagnósticos recentes</h2><div className="section-sub">Reabra um diagnóstico já gerado sem precisar refazer a pesquisa</div></div></div>
                <div className="card" style={{ padding: 12 }}>
                  <table className="comp-table" style={{ width: "100%" }}>
                    <thead><tr><th>Empresa</th><th>Local</th><th>Score</th><th>Data</th><th></th></tr></thead>
                    <tbody>
                      {historico.map((h) => {
                        const local = h.bairro ? `${h.bairro}, ${h.cidade}/${h.estado}` : `${h.cidade}/${h.estado}`;
                        const data = new Date(h.created_at).toLocaleDateString("pt-BR");
                        return (
                          <tr key={h.id} style={{ cursor: "pointer" }} onClick={() => reabrirDiagnostico(h.id)}>
                            <td className="name-cell">{h.nome_empresa}</td>
                            <td style={{ color: "var(--muted)" }}>{local}</td>
                            <td>{h.score_geral ?? "—"}</td>
                            <td style={{ color: "var(--muted)" }}>{data}</td>
                            <td style={{ color: "var(--blue)", fontWeight: 600, fontSize: 12.5 }}>Abrir →</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        )}

        {stage === "2" && <ResearchLoading />}

        {stage === "2b" && dadosBrutos && (
          <ReviewForm initial={dadosBrutos} loading={confirmLoading} onConfirm={confirmarDados} onBack={() => irPara(data ? "3" : "1")} />
        )}

        {stage === "3" && data && (
          <Dashboard data={data} input={input} isFallback={isFallback} onBack={() => irPara("2b")} onNext={() => irPara("4")} onEdit={abrirEdicaoDados} />
        )}

        {stage === "4" && data && (
          <DiagnosticoView diagnostico={data.diagnostico} onBack={() => irPara("3")} onNext={() => irPara("5")} />
        )}

        {stage === "5" && data && (
          <PlanoAcaoView plano={data.planoAcao} onBack={() => irPara("4")} onNext={() => irPara("6")} />
        )}

        {stage === "6" && data && (
          <PropostaView data={data} input={input} onBack={() => irPara("5")} />
        )}
      </div>

      <div className="toast" style={{ display: toastMsg ? "block" : "none" }}>{toastMsg}</div>
    </>
  );
}
