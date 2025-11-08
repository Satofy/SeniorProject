import { NextResponse } from "next/server"

type PandaTournament = {
  id: number
  name: string
  begin_at: string | null
  end_at: string | null
  status?: string
}

function mapStatus(s?: string): "upcoming" | "ongoing" | "completed" {
  switch ((s || "").toLowerCase()) {
    case "running":
    case "in_progress":
      return "ongoing"
    case "finished":
    case "completed":
      return "completed"
    default:
      return "upcoming"
  }
}

export async function GET() {
  const token = process.env.PANDASCORE_TOKEN || process.env.PANDA_KEY
  if (!token) {
    return NextResponse.json(
      { message: "Missing PANDASCORE_TOKEN. Add it to .env.local and restart dev server." },
      { status: 500 },
    )
  }

  const headers = { Authorization: `Bearer ${token}` }
  const games = ["valorant", "lol", "dota2"]

  try {
    const results = await Promise.all(
      games.map(async (g) => {
        const res = await fetch(
          `https://api.pandascore.co/${g}/tournaments?sort=-begin_at&per_page=10`,
          { headers, cache: "no-store" },
        )
        if (!res.ok) return [] as any[]
        const data = (await res.json()) as PandaTournament[]
        return data.map((t) => ({
          id: `${g}-${t.id}`,
          title: t.name,
          date: t.begin_at || t.end_at || new Date().toISOString(),
          type: g.toUpperCase(),
          status: mapStatus(t.status),
        }))
      }),
    )

    const merged = results.flat().slice(0, 24)
    return NextResponse.json(merged)
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || "Failed to fetch tournaments" }, { status: 500 })
  }
}
