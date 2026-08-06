"use client";

import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function CartaoAvaliacao({ nome, link }: { nome: string; link: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [copiado, setCopiado] = useState(false);

  function copiarLink() {
    navigator.clipboard.writeText(link);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  function baixarQR() {
    const canvas = wrapRef.current?.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `qrcode-avaliacao-${nome.toLowerCase().replace(/\s+/g, "-")}.png`;
    a.click();
  }

  return (
    <div className="chart-card" style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
      <div ref={wrapRef} style={{ background: "#fff", padding: 16, borderRadius: 12, flexShrink: 0, border: "1px solid var(--line-strong)" }}>
        <QRCodeCanvas value={link} size={140} bgColor="#ffffff" fgColor="#000000" />
      </div>
      <div style={{ flex: 1, minWidth: 220 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Cartão de avaliação</div>
        <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 14, lineHeight: 1.6 }}>
          Compartilhe esse QR code ou o link direto com os clientes de {nome} para facilitar novas avaliações no Google. Funciona impresso no balcão ou enviado por WhatsApp.
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn btn-primary" style={{ padding: "9px 16px", fontSize: 12.5 }} onClick={baixarQR}>⬇ Baixar QR Code</button>
          <button className="btn btn-ghost" style={{ padding: "9px 16px", fontSize: 12.5 }} onClick={copiarLink}>{copiado ? "Link copiado ✓" : "Copiar link direto"}</button>
        </div>
      </div>
    </div>
  );
}
