"use client";

import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer } from "recharts";
import { Concorrente } from "@/lib/types";

export default function CompetitorChart({ voce, concorrentes }: { voce: { nome: string; scoreGeral: number }; concorrentes: Concorrente[] }) {
  const all = [voce, ...concorrentes]
    .map((c) => ({ nome: c.nome, score: c.scoreGeral || 0, isVoce: c.nome === voce.nome }))
    .sort((a, b) => b.score - a.score);

  return (
    <ResponsiveContainer width="100%" height={Math.max(220, all.length * 34)}>
      <BarChart data={all} layout="vertical" margin={{ left: 10, right: 20 }}>
        <XAxis type="number" domain={[0, 100]} tick={{ fill: "#5F6368", fontSize: 11, fontFamily: "Poppins" }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="nome"
          width={140}
          tick={{ fill: "#202124", fontSize: 11, fontFamily: "Poppins" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: string) => (v.length > 18 ? v.slice(0, 18) + "…" : v)}
        />
        <Bar dataKey="score" radius={[0, 6, 6, 0]} maxBarSize={22}>
          {all.map((entry, i) => (
            <Cell key={i} fill={entry.isVoce ? "#4285F4" : "#DADCE0"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
