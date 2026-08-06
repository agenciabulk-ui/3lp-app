const BASE = "https://places.googleapis.com/v1";

export type PlaceLite = {
  id: string;
  nome: string;
  nota: number;
  avaliacoes: number;
  lat?: number;
  lng?: number;
  tipos?: string[];
};

export type ReviewLite = { autor: string; nota: number; texto: string };

export type PlaceDetalhado = PlaceLite & {
  categorias: string[];
  telefone: boolean;
  whatsapp: boolean; // Places API não expõe WhatsApp, sempre false aqui, fica pra revisão manual
  site: string | null;
  horarioCompleto: boolean;
  fotos: number;
  businessStatus: string | null;
  avaliacoesRecentes: ReviewLite[];
};

async function placesFetch(path: string, apiKey: string, fieldMask: string, body: any) {
  const resp = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": fieldMask,
    },
    body: JSON.stringify(body),
  });
  const json = await resp.json();
  if (json.error) throw new Error(json.error.message || "Erro na Google Places API");
  return json;
}

/** Localiza o negócio principal por nome + região, retornando id, nota, avaliações e coordenadas. */
export async function buscarNegocioPrincipal(apiKey: string, query: string): Promise<PlaceLite | null> {
  const json = await placesFetch(
    "/places:searchText",
    apiKey,
    "places.id,places.displayName,places.rating,places.userRatingCount,places.location",
    { textQuery: query, languageCode: "pt-BR", regionCode: "BR" }
  );
  const p = json.places?.[0];
  if (!p) return null;
  return {
    id: p.id,
    nome: p.displayName?.text || query,
    nota: p.rating || 0,
    avaliacoes: p.userRatingCount || 0,
    lat: p.location?.latitude,
    lng: p.location?.longitude,
  };
}

/** Busca detalhes completos de um negócio já identificado pelo place id. */
export async function detalhesNegocio(apiKey: string, placeId: string): Promise<PlaceDetalhado> {
  const resp = await fetch(`${BASE}/places/${placeId}`, {
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "id,displayName,rating,userRatingCount,types,nationalPhoneNumber,websiteUri,regularOpeningHours,photos,businessStatus,location,reviews.rating,reviews.text,reviews.authorAttribution",
    },
  });
  const p = await resp.json();
  if (p.error) throw new Error(p.error.message || "Erro ao buscar detalhes do negócio");
  return {
    id: p.id,
    nome: p.displayName?.text || "",
    nota: p.rating || 0,
    avaliacoes: p.userRatingCount || 0,
    lat: p.location?.latitude,
    lng: p.location?.longitude,
    categorias: (p.types || []).slice(0, 5),
    telefone: !!p.nationalPhoneNumber,
    whatsapp: false,
    site: p.websiteUri || null,
    horarioCompleto: !!p.regularOpeningHours,
    fotos: (p.photos || []).length,
    businessStatus: p.businessStatus || null,
    avaliacoesRecentes: (p.reviews || []).map((r: any) => ({
      autor: r.authorAttribution?.displayName || "Cliente",
      nota: r.rating || 0,
      texto: r.text?.text || "",
    })),
  };
}

/** Busca por texto (segmento) restrito a um raio em metros ao redor de um ponto. Usado tanto para listar concorrentes quanto para o ranking por raio. */
export async function buscarPorTextoNoRaio(
  apiKey: string,
  textQuery: string,
  lat: number,
  lng: number,
  radiusMeters: number,
  maxResultCount = 20
): Promise<PlaceLite[]> {
  const json = await placesFetch(
    "/places:searchText",
    apiKey,
    "places.id,places.displayName,places.rating,places.userRatingCount,places.location,places.types",
    {
      textQuery,
      languageCode: "pt-BR",
      regionCode: "BR",
      maxResultCount,
      locationBias: { circle: { center: { latitude: lat, longitude: lng }, radius: radiusMeters } },
    }
  );
  return (json.places || []).map((p: any) => ({
    id: p.id,
    nome: p.displayName?.text || "",
    nota: p.rating || 0,
    avaliacoes: p.userRatingCount || 0,
    lat: p.location?.latitude,
    lng: p.location?.longitude,
    tipos: p.types || [],
  }));
}

const CATEGORIAS_GENERICAS = new Set(["point_of_interest", "establishment", "store"]);

/** Compara nossas categorias com as dos concorrentes e aponta oportunidades. */
export function analisarCategorias(nossasCategorias: string[], concorrentes: PlaceLite[]) {
  const contagem = new Map<string, number>();
  for (const c of concorrentes) {
    for (const tipo of c.tipos || []) {
      if (CATEGORIAS_GENERICAS.has(tipo)) continue;
      contagem.set(tipo, (contagem.get(tipo) || 0) + 1);
    }
  }
  const maisComuns = Array.from(contagem.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([categoria, ocorrencias]) => ({ categoria, ocorrencias }));

  const nossasSet = new Set(nossasCategorias);
  const faltantes = maisComuns.filter((c) => !nossasSet.has(c.categoria)).map((c) => c.categoria);

  return {
    categoriaPrincipal: nossasCategorias[0] || "",
    nossasCategorias: nossasCategorias.filter((c) => !CATEGORIAS_GENERICAS.has(c)),
    categoriasConcorrentesMaisComuns: maisComuns,
    categoriasFaltantes: faltantes.slice(0, 5),
  };
}
