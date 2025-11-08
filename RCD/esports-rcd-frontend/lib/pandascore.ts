// Server-side PandaScore API helper
// Do NOT import this from client components; use route handlers or server components

const BASE_URL = "https://api.pandascore.co" as const;

export type PandaTournament = {
  id: number;
  name: string;
  slug?: string;
  begin_at?: string | null;
  end_at?: string | null;
  prizepool?: string | null;
  league?: { id: number; name: string } | null;
  series?: { id: number; full_name?: string | null } | null;
  videogame?: { id: number; name: string; slug?: string } | null;
};

export type GameSlug = "valorant" | "lol" | "cs2" | "dota2" | string;

function getToken(): string {
  const token = process.env.PANDASCORE_API_TOKEN;
  if (!token) {
    throw new Error(
      "PANDASCORE_API_TOKEN is not set. Add it to .env.local (never commit real tokens)."
    );
  }
  return token;
}

export async function fetchPanda<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getToken()}`,
      Accept: "application/json",
      ...(init?.headers || {}),
    },
    // Helpful default caching when used in Next.js server routes/components
    next: { revalidate: 60 },
  } as RequestInit);

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`PandaScore ${res.status}: ${text || res.statusText}`);
  }
  return (await res.json()) as T;
}

export async function getTournamentsByGame(params: {
  game: GameSlug;
  page?: number;
  perPage?: number;
  past?: boolean; // if true, include past tournaments using filter on status
}): Promise<PandaTournament[]> {
  const { game, page = 1, perPage = 25 } = params;
  const search = new URLSearchParams();
  if (page) search.set("page", String(page));
  if (perPage) search.set("per_page", String(perPage));
  // You can add filters here, e.g., status, upcoming, running, etc.
  // search.set("filter[status]", params.past ? "finished" : "running,upcoming");

  const path = `/${encodeURIComponent(game)}/tournaments?${search.toString()}`;
  return fetchPanda<PandaTournament[]>(path);
}
