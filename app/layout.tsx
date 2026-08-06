import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "3LP · Diagnóstico de Posicionamento Google",
  description: "Top 3 Local Presence. Diagnóstico automático de posicionamento no Google Business, com dashboard, plano de ação e proposta comercial em PDF.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
