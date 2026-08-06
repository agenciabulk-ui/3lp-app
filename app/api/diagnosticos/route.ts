import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { DiagnosticoCompleto, EmpresaInput } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ items: [] });
  const { data, error } = await supabase
    .from("diagnosticos")
    .select("id, created_at, nome_empresa, bairro, cidade, estado, segmento, fonte, score_geral")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data });
}

export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ skipped: true }); // sem Supabase configurado, segue sem salvar

  const { input, dados }: { input: EmpresaInput; dados: DiagnosticoCompleto } = await req.json();

  const { data, error } = await supabase
    .from("diagnosticos")
    .insert({
      nome_empresa: input.nome,
      bairro: input.bairro || null,
      cidade: input.cidade,
      estado: input.estado,
      segmento: input.segmento,
      site: input.site || null,
      gbp_link: input.gbp || null,
      fonte: dados.fonte || null,
      score_geral: dados.scores?.geral ?? null,
      input,
      dados,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
