"use client";

import { useEffect, useState } from "react";
import { Coleta, Concorrente, DadosBrutos, TermoBusca } from "@/lib/types";

export default function ReviewForm({
  initial,
  loading,
  onConfirm,
  onBack,
}: {
  initial: DadosBrutos;
  loading: boolean;
  onConfirm: (dados: DadosBrutos) => void;
  onBack: () => void;
}) {
  const [coleta, setColeta] = useState<Coleta>(initial.coleta);
  const [concorrentes, setConcorrentes] = useState<Concorrente[]>(initial.concorrentes);
  const [termos, setTermos] = useState<TermoBusca[]>(initial.buscaLocal.termos);

  useEffect(() => {
    setColeta(initial.coleta);
    setConcorrentes(initial.concorrentes);
    setTermos(initial.buscaLocal.termos);
  }, [initial]);

  const num = (v: string) => Number(v) || 0;

  const updateComp = (i: number, field: keyof Concorrente, value: string) => {
    setConcorrentes((prev) => prev.map((c, idx) => (idx === i ? { ...c, [field]: field === "nome" ? value : Number(value) || 0 } : c)));
  };
  const updateTermo = (i: number, field: keyof TermoBusca, value: string) => {
    setTermos((prev) => prev.map((t, idx) => (idx === i ? { ...t, [field]: value } : t)));
  };

  return (
    <section className="stage visible">
      <div className="eyebrow"><span className="dot" />Confira antes de gerar</div>
      <h1 className="page-title">Confira os <em>dados coletados</em></h1>
      <p className="page-sub">A pesquisa automática é uma estimativa. Corrija qualquer número antes de gerar o diagnóstico final, principalmente avaliações e nomes de concorrentes.</p>

      <div className="card">
        <div className="grid2">
          <div className="field"><label>Avaliações no Google</label><input className="edit-input" type="number" value={coleta.avaliacoes} onChange={(e) => setColeta({ ...coleta, avaliacoes: num(e.target.value) })} /></div>
          <div className="field"><label>Nota média</label><input className="edit-input" type="number" step="0.1" value={coleta.notaMedia} onChange={(e) => setColeta({ ...coleta, notaMedia: num(e.target.value) })} /></div>
          <div className="field"><label>Fotos no perfil</label><input className="edit-input" type="number" value={coleta.fotos} onChange={(e) => setColeta({ ...coleta, fotos: num(e.target.value) })} /></div>
          <div className="field"><label>Produtos cadastrados</label><input className="edit-input" type="number" value={coleta.produtos} onChange={(e) => setColeta({ ...coleta, produtos: num(e.target.value) })} /></div>
          <div className="field"><label>Serviços cadastrados</label><input className="edit-input" type="number" value={coleta.servicos} onChange={(e) => setColeta({ ...coleta, servicos: num(e.target.value) })} /></div>
          <div className="field"><label>Perguntas e respostas</label><input className="edit-input" type="number" value={coleta.perguntasRespostas} onChange={(e) => setColeta({ ...coleta, perguntasRespostas: num(e.target.value) })} /></div>
          <div className="field"><label>Última postagem</label><input className="edit-input" type="text" value={coleta.ultimaPostagem} onChange={(e) => setColeta({ ...coleta, ultimaPostagem: e.target.value })} /></div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 22, marginTop: 6, paddingTop: 18, borderTop: "1px solid var(--line)" }}>
          {[
            ["descricaoPresente", "Descrição preenchida"],
            ["horarioCompleto", "Horário completo"],
            ["linksCompletos", "Links completos"],
            ["telefone", "Telefone"],
            ["whatsapp", "WhatsApp"],
            ["siteAtivo", "Site ativo"],
            ["areaAtendimento", "Área de atendimento definida"],
          ].map(([key, label]) => (
            <label key={key} className="checkbox-row">
              <input type="checkbox" checked={(coleta as any)[key]} onChange={(e) => setColeta({ ...coleta, [key]: e.target.checked })} />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className="section-title">
        <div><h2>Concorrentes encontrados</h2><div className="section-sub">Corrija nomes, notas ou remova quem não for concorrente real</div></div>
        <button className="btn btn-ghost" style={{ padding: "9px 16px", fontSize: 13 }} onClick={() => setConcorrentes([...concorrentes, { nome: "", nota: 0, avaliacoes: 0 }])}>+ Adicionar linha</button>
      </div>
      <div className="card" style={{ padding: 20 }}>
        <table className="comp-table" style={{ width: "100%" }}>
          <thead><tr><th>Nome</th><th>Nota</th><th>Avaliações</th><th></th></tr></thead>
          <tbody>
            {concorrentes.map((c, i) => (
              <tr key={i}>
                <td><input className="edit-input" value={c.nome} onChange={(e) => updateComp(i, "nome", e.target.value)} /></td>
                <td><input className="edit-input edit-input-sm" type="number" step="0.1" value={c.nota} onChange={(e) => updateComp(i, "nota", e.target.value)} /></td>
                <td><input className="edit-input edit-input-sm" type="number" value={c.avaliacoes} onChange={(e) => updateComp(i, "avaliacoes", e.target.value)} /></td>
                <td><button className="btn btn-ghost" style={{ padding: "6px 10px", fontSize: 12 }} onClick={() => setConcorrentes(concorrentes.filter((_, idx) => idx !== i))}>Remover</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section-title"><div><h2>Palavras-chave de busca local</h2><div className="section-sub">Ajuste os termos se não fizerem sentido pro nicho</div></div></div>
      <div className="card" style={{ padding: 20 }}>
        <table className="comp-table" style={{ width: "100%" }}>
          <thead><tr><th>Termo</th><th>Volume estimado</th></tr></thead>
          <tbody>
            {termos.map((t, i) => (
              <tr key={i}>
                <td><input className="edit-input" value={t.termo} onChange={(e) => updateTermo(i, "termo", e.target.value)} /></td>
                <td>
                  <select className="edit-input" value={t.volumeRelativo} onChange={(e) => updateTermo(i, "volumeRelativo", e.target.value)}>
                    <option>Alto</option><option>Médio</option><option>Baixo</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="btn-row">
        <button className="btn btn-ghost" onClick={onBack} disabled={loading}>← Voltar</button>
        <button
          className="btn btn-primary"
          disabled={loading}
          onClick={() => onConfirm({ coleta, concorrentes: concorrentes.filter((c) => c.nome.trim()), buscaLocal: { termos: termos.filter((t) => t.termo.trim()) } })}
        >
          {loading ? (<><span className="spinner" /> Gerando diagnóstico...</>) : "Salvar e atualizar diagnóstico →"}
        </button>
      </div>
    </section>
  );
}
