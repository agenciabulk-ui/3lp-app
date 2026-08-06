# 3LP · Top 3 Local Presence

App Next.js (App Router) + TypeScript que gera diagnóstico automático de posicionamento no Google Business e proposta comercial em PDF. O nome vem do objetivo central da ferramenta: ajudar o negócio a ficar sempre entre os 3 primeiros do pacote local do Google.

## Identidade visual

Tema claro (fundo branco) com as cores do próprio Google (azul #4285F4, verde #34A853, amarelo #FBBC05, vermelho #EA4335), Poppins. O farol de status (bom/atenção/crítico) usa essas mesmas cores, reforçando a associação com o Google Business.

## O que é isso

Fluxo em 6 etapas: formulário da empresa → pesquisa automática → dashboard com score, comparação de concorrentes e posição por raio de distância → diagnóstico estratégico → plano de ação → proposta comercial exportável em PDF (via impressão do navegador, paisagem).

As chamadas para a API da Anthropic e da Google Places ficam em rotas de servidor (`app/api/pesquisar`, `app/api/analisar`, `app/api/raios`), então as chaves nunca ficam expostas no navegador do cliente.

## Dois modos de pesquisa

- **Sem `GOOGLE_PLACES_API_KEY`**: a IA pesquisa na web (estimativa, mais barato, funciona hoje).
- **Com `GOOGLE_PLACES_API_KEY`**: avaliações, nota e concorrentes vêm direto do Google (dado real), o app libera a análise de posição por raio de distância (1km, 2km, 3km) e a análise de categorias (compara suas categorias com as mais usadas pelos concorrentes do raio, apontando o que falta). Alguns campos que o Google não expõe publicamente (produtos, postagens, perguntas e respostas, WhatsApp) continuam sendo estimados pela IA e ficam marcados para revisão manual na etapa de conferência.

## Comparado ao GBP Check

Recursos deles que exigem acesso de administrador do cliente (via extensão logada, não API pública) e por isso não são replicáveis neste modelo de pré-análise: postagens, perguntas e respostas, publicar resposta automaticamente, insights oficiais de impressões/cliques, histórico de posição de palavras-chave mês a mês. Recursos que exigem histórico acumulado ao longo do tempo (evolução da análise, 18 meses de palavras-chave, estatísticas de uso, gestão de múltiplos locais): não dá para ter no primeiro uso, precisam de persistência (Supabase) rodando por semanas/meses. Ambos ficam como evolução natural se este uso interno validar bem.

Recursos que dá pra ter agora, sem custo extra:
- **Cartão de avaliação com QR code**: gerado localmente (biblioteca open source, sem API paga), aponta direto para a tela de avaliação do negócio no Google.
- **Avaliações reais com resposta sugerida pela IA**: usa as avaliações que a própria Places API retorna, a resposta precisa ser colada manualmente no Google (postar automático exige acesso admin do cliente).
- **Análise de categorias**: compara suas categorias com as mais usadas pelos concorrentes do raio, com dado real.

## Rodando localmente

```bash
npm install
cp .env.example .env.local
# edite .env.local e cole sua ANTHROPIC_API_KEY (console.anthropic.com)
# opcional: cole também GOOGLE_PLACES_API_KEY (console.cloud.google.com, ative "Places API (New)")
npm run dev
```

Abra http://localhost:3000

## Histórico de diagnósticos (Supabase)

Já criei um projeto Supabase gratuito chamado "bulk-diagnostico" na mesma conta que você tinha conectado (organização "vidrazapp", separado do projeto da calculadora de vidros). As credenciais já estão no `.env.example`. Com isso configurado:

- Todo diagnóstico gerado é salvo automaticamente (silenciosamente, não trava o fluxo se falhar).
- A Etapa 1 mostra uma lista "Diagnósticos recentes" com os últimos 50, clicáveis para reabrir sem refazer a pesquisa.
- Sem essas variáveis de ambiente, o app funciona normal, só não salva nem mostra histórico.

**Migrar para a conta da Bulk depois**: crie um novo projeto Supabase pela conta da Bulk, rode a migration abaixo nele, e troque `SUPABASE_URL`/`SUPABASE_ANON_KEY` nas variáveis de ambiente do Vercel. Os dados antigos não migram automaticamente (ficam no projeto antigo), mas o app volta a funcionar imediatamente no novo projeto.

```sql
create table if not exists public.diagnosticos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nome_empresa text not null,
  bairro text,
  cidade text not null,
  estado text not null,
  segmento text not null,
  site text,
  gbp_link text,
  fonte text,
  score_geral int,
  input jsonb not null,
  dados jsonb not null
);
create index if not exists diagnosticos_created_at_idx on public.diagnosticos (created_at desc);
create index if not exists diagnosticos_nome_empresa_idx on public.diagnosticos (nome_empresa);
alter table public.diagnosticos enable row level security;
create policy "service role tem acesso total" on public.diagnosticos for all using (true) with check (true);
```

## Deploy no Vercel

Você já tem o Vercel conectado, então o caminho mais rápido:

1. Suba este projeto para um repositório no GitHub (crie um repo vazio e faça `git init`, `git add .`, `git commit`, `git remote add origin ...`, `git push`).
2. No painel do Vercel, clique em "Add New Project" e importe esse repositório.
3. Em "Environment Variables", adicione `ANTHROPIC_API_KEY` (obrigatória), `GOOGLE_PLACES_API_KEY` (opcional, mas recomendada) e `SUPABASE_URL` + `SUPABASE_ANON_KEY` (opcionais, para histórico) com os valores do `.env.example`.
4. Clique em Deploy. Em ~1 minuto está no ar em uma URL tipo `3lp-app.vercel.app`.
5. Se quiser um domínio próprio (ex: `3lp.com.br` ou similar), isso é configurado em Project Settings → Domains, apontando um CNAME no seu provedor de DNS.

Alternativa sem GitHub: instale a CLI (`npm i -g vercel`), rode `vercel` dentro da pasta do projeto e siga o assistente, depois `vercel env add` para configurar as chaves em produção.

## Como criar a chave da Google Places API (New)

1. Acesse console.cloud.google.com e crie um projeto (ou use um existente).
2. Ative a "Places API (New)" em APIs & Services → Library.
3. Crie uma credencial de API Key em APIs & Services → Credentials.
4. Restrinja a chave só à Places API (New), por segurança.
5. Ative billing no projeto (obrigatório pelo Google, mas há cota mensal gratuita que cobre um uso baixo como o seu).
6. Cole a chave em `GOOGLE_PLACES_API_KEY` no `.env.local` (local) ou nas variáveis de ambiente do Vercel (produção).

## Próximos passos sugeridos

- Se este uso interno validar bem, considerar transformar em multi-tenant (contas separadas por agência, cobrança recorrente) para vender como produto.
- Adicionar histórico de diagnósticos por cliente (dá pra plugar Supabase, que você já usa).
- Ajustar o texto de investimento na proposta (`prompt` em `app/api/analisar/route.ts`) se quiser fixar uma faixa de preço específica da Bulk em vez da estimativa de mercado.

## Estrutura

```
app/
  page.tsx                 orquestrador do fluxo (estado das 6 etapas)
  api/pesquisar/route.ts   fase 1: dados brutos (Google Places real ou IA com busca na web)
  api/raios/route.ts       posição por raio de distância + diagnóstico corrigível vs estrutural
  api/analisar/route.ts    fase 2: scores + diagnóstico + plano + proposta
  globals.css              design system (branco, cores do Google, Poppins)
components/
  Stepper, ScoreGauge, CompetitorChart, RadiusRankingView, ReviewForm,
  Dashboard, DiagnosticoView, PlanoAcaoView, PropostaView
lib/
  types.ts                 tipos compartilhados
  fallback.ts              dados de fallback caso a IA falhe
  googlePlaces.ts           cliente da Google Places API (New)
```

## Nota sobre o nome

O produto se chama **3LP** (Top 3 Local Presence). Identificadores técnicos como o nome do repositório sugerido e do projeto no Supabase (`bulk-diagnostico`) são só rótulos internos herdados do desenvolvimento, não aparecem pro usuário final e não precisam ser trocados junto, mas se quiser deixar tudo consistente é só renomear o repositório no GitHub e o projeto no painel do Supabase, sem nenhum impacto técnico.
