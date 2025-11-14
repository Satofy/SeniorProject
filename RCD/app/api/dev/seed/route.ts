import {
  addTournament,
  addUser,
  addTeam,
  createRegistration,
  generateSingleElimBracket,
  generateDoubleElimBracket,
  teams,
  users,
} from "@/app/api/_mockData";

type SeedBody = {
  numTeams?: number; // default 8
  teamSize?: number; // including manager; default 5
  tournament?: {
    title?: string;
    kind?: "single" | "double";
    maxParticipants?: number;
    game?: string;
  };
};

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as SeedBody;
    const numTeams = Math.max(2, Math.min(64, body.numTeams ?? 8));
    const teamSize = Math.max(1, Math.min(10, body.teamSize ?? 5));
    const kind = body.tournament?.kind ?? "single";

    const t = addTournament({
      title: body.tournament?.title ?? `${kind === "double" ? "Double" : "Single"} Elim Test (${numTeams} teams)`,
      type: kind === "double" ? "double-elimination" : "single-elimination",
      status: "upcoming",
      maxParticipants: body.tournament?.maxParticipants ?? numTeams,
      game: body.tournament?.game ?? "Valorant",
    });

    const createdTeams: string[] = [];
    const createdManagers: string[] = [];
    const createdPlayers: string[] = [];

    for (let i = 0; i < numTeams; i++) {
      // Manager
      const mgr = addUser(
        `mgr${Date.now()}_${i}@example.com`,
        undefined,
        `manager_${i}`,
        "team_manager"
      );
      createdManagers.push(mgr.id);
      // Team
      const team = addTeam(`Team ${i + 1}`, `T${i + 1}`, mgr.id);
      createdTeams.push(team.id);
      // Players (teamSize - 1 because manager is a member already)
      const toAdd = Math.max(0, teamSize - 1);
      for (let p = 0; p < toAdd; p++) {
        const player = addUser(
          `p${Date.now()}_${i}_${p}@example.com`,
          undefined,
          `player_${i}_${p}`,
          "player"
        );
        createdPlayers.push(player.id);
        // Attach to team
        team.members.push(player);
        // Maintain single-team affiliation
        (player as any).teamId = team.id;
      }
      // Register team to tournament
      createRegistration(t.id, team.id);
    }

    // Generate bracket
    const teamIds = createdTeams;
    const bracket =
      kind === "double"
        ? generateDoubleElimBracket(t.id, teamIds)
        : generateSingleElimBracket(t.id, teamIds);

    return new Response(
      JSON.stringify({
        ok: true,
        tournament: t,
        counts: {
          teams: createdTeams.length,
          managers: createdManagers.length,
          players: createdPlayers.length,
        },
        bracket,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ ok: false, error: err?.message || String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function GET() {
  // Convenience: default seed with 8 teams, single elim
  return POST(new Request("http://localhost", { method: "POST", body: JSON.stringify({}) } as any));
}
