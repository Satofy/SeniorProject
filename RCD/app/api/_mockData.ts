// Simple in-memory mock data for dev use

export type MockUser = {
  id: string;
  email: string;
  role: "guest" | "player" | "team_manager" | "admin";
  username?: string;
};

export type MockTeam = {
  id: string
  name: string
  tag?: string
  managerId: string
  members: MockUser[]
  gamesPlayed?: number
  balance?: number
  createdAt?: string
}

export type MockTournament = {
  id: string
  title: string
  date: string
  type: string
  status: "upcoming" | "ongoing" | "completed"
  description?: string
  maxParticipants?: number
  currentParticipants?: number
  prizePool?: string
  game?: string
}

// Registrations
export type Registration = {
  id: string
  tournamentId: string
  teamId: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
}

// Bracket/Match models
export type BracketKind = "single" | "double"
export type BracketSide = "winners" | "losers" | "grand"

export type Match = {
  id: string
  tournamentId: string
  side: BracketSide
  round: number
  index: number // position within round
  team1Id?: string | null
  team2Id?: string | null
  score1?: number
  score2?: number
  winnerId?: string
  scheduledAt?: string
  completedAt?: string
}

export type Bracket = {
  tournamentId: string
  kind: BracketKind
  rounds: Record<BracketSide, Array<{ round: number; matches: Match[] }>>
}

let counter = 1000
const newid = () => String(counter++)

// Seed users
export const users: MockUser[] = [
  {
    id: "1",
    email: "owner@example.com",
    role: "team_manager",
    username: "owner",
  },
  {
    id: "2",
    email: "player1@example.com",
    role: "player",
    username: "player1",
  },
  {
    id: "3",
    email: "player2@example.com",
    role: "player",
    username: "player2",
  },
  { id: "4", email: "admin@example.com", role: "admin", username: "admin" },
];

// Seed teams
export const teams: MockTeam[] = [
  {
    id: "t1",
    name: "RCD Legends",
    tag: "RCD",
    managerId: "1",
    members: [users[0], users[1], users[2]],
    gamesPlayed: 42,
    balance: 1500,
    createdAt: new Date().toISOString(),
  },
  {
    id: "t2",
    name: "Shadow Clan",
    tag: "SHDW",
    managerId: "4",
    members: [users[3], users[2]],
    gamesPlayed: 12,
    createdAt: new Date().toISOString(),
  },
]

// Seed tournaments
export const tournaments: MockTournament[] = [
  { id: "a1", title: "Autumn Cup", date: new Date().toISOString(), type: "5v5", status: "upcoming", maxParticipants: 32, currentParticipants: 10, game: "Valorant" },
  { id: "a2", title: "Winter Clash", date: new Date().toISOString(), type: "Solo", status: "ongoing", maxParticipants: 16, currentParticipants: 8, game: "League of Legends" },
]

// Storage for registrations and brackets
export const registrations: Registration[] = []
export const brackets: Record<string, Bracket> = {}

// Simple audit log storage
export type AuditLog = {
  timestamp: string
  user: string
  action: string
  details?: string
}

export const auditLogs: AuditLog[] = []

function log(user: string, action: string, details?: string) {
  auditLogs.push({ timestamp: new Date().toISOString(), user, action, details })
}

export function addTeam(name: string, tag?: string, managerId: string = users[0].id): MockTeam {
  const t: MockTeam = {
    id: `t${newid()}`,
    name,
    tag,
    managerId,
    members: [users.find((u) => u.id === managerId)!],
    createdAt: new Date().toISOString(),
  }
  teams.push(t)
  log(managerId, "create_team", `Team ${t.name} (${t.id}) created`)
  return t
}

export function getTeam(id: string) {
  return teams.find((t) => t.id === id) || null
}

export function removeMember(teamId: string, userId: string) {
  const team = getTeam(teamId)
  if (!team) return false
  team.members = team.members.filter((m) => m.id !== userId)
  return true
}

export function setUserRole(userId: string, role: MockUser["role"]) {
  const u = users.find((x) => x.id === userId)
  if (!u) return false
  u.role = role
  // Also reflect inside team member objects
  teams.forEach((t) => {
    t.members = t.members.map((m) => (m.id === userId ? { ...m, role } : m))
  })
  log(userId, "change_role", `Role changed to ${role}`)
  return true
}

export function deleteUser(userId: string) {
  const idx = users.findIndex((u) => u.id === userId)
  if (idx === -1) return false
  const [removed] = users.splice(idx, 1)
  // Remove from teams
  teams.forEach((t) => (t.members = t.members.filter((m) => m.id !== userId)))
  log(userId, "delete_user", `User ${removed.email} removed`)
  return true
}

export function deleteTeam(teamId: string) {
  const idx = teams.findIndex((t) => t.id === teamId)
  if (idx === -1) return false
  const [removed] = teams.splice(idx, 1)
  log(removed.managerId, "delete_team", `Team ${removed.name} (${removed.id}) deleted`)
  return true
}

export function addUser(
  email: string,
  password?: string,
  username?: string,
  role: MockUser["role"] = "player"
) {
  // Note: password is ignored in mock
  const u: MockUser = { id: newid(), email, role, username };
  users.push(u);
  log(u.id, "register", `User ${email} registered`);
  return u;
}

export function addTournament(data: Partial<MockTournament>) {
  const t: MockTournament = {
    id: `trn${newid()}`,
    title: data.title || "Untitled Tournament",
    date: data.date || new Date().toISOString().slice(0, 10),
    type: data.type || "single-elimination",
    status: (data.status as any) || "upcoming",
    description: data.description,
    maxParticipants: data.maxParticipants,
    currentParticipants: data.currentParticipants || 0,
    prizePool: data.prizePool,
    game: data.game,
  }
  tournaments.push(t)
  log("system", "create_tournament", `Tournament ${t.title} (${t.id}) created`)
  return t
}

export function getTournament(id: string) {
  return tournaments.find((t) => t.id === id) || null
}

export function updateTournament(id: string, data: Partial<MockTournament>) {
  const t = getTournament(id)
  if (!t) return null
  Object.assign(t, data)
  log("system", "update_tournament", `Tournament ${t.title} (${t.id}) updated`)
  return t
}

export function removeTournament(id: string) {
  const idx = tournaments.findIndex((t) => t.id === id)
  if (idx === -1) return false
  const [removed] = tournaments.splice(idx, 1)
  log("system", "delete_tournament", `Tournament ${removed.title} (${removed.id}) deleted`)
  return true
}

export function registerForTournament(id: string) {
  const t = getTournament(id)
  if (!t) return false
  if (t.maxParticipants && t.currentParticipants && t.currentParticipants >= t.maxParticipants) return false
  t.currentParticipants = (t.currentParticipants || 0) + 1
  log("system", "register_tournament", `Registration added to ${t.title} (${t.id})`)
  return true
}

// New registration APIs (team-based)
export function createRegistration(tournamentId: string, teamId: string) {
  const t = getTournament(tournamentId)
  if (!t) throw new Error("Tournament not found")
  // prevent duplicates
  const dup = registrations.find((r) => r.tournamentId === tournamentId && r.teamId === teamId && r.status !== "rejected")
  if (dup) throw new Error("Team already registered")
  if (t.maxParticipants && (t.currentParticipants || 0) >= t.maxParticipants) throw new Error("Tournament is full")
  const r: Registration = {
    id: `reg${newid()}`,
    tournamentId,
    teamId,
    status: "approved", // auto-approve for now
    createdAt: new Date().toISOString(),
  }
  registrations.push(r)
  t.currentParticipants = (t.currentParticipants || 0) + 1
  log(teamId, "tournament_register", `Team ${teamId} registered for ${t.title}`)
  return r
}

export function listRegistrations(tournamentId: string) {
  return registrations.filter((r) => r.tournamentId === tournamentId)
}

// Bracket generation helpers
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function nextPowerOfTwo(n: number) {
  let p = 1
  while (p < n) p <<= 1
  return p
}

export function generateSingleElimBracket(tournamentId: string, teamIds: string[]): Bracket {
  const shuffled = shuffle(teamIds)
  const size = nextPowerOfTwo(shuffled.length)
  const byes = size - shuffled.length
  const seeds: Array<string | null> = [...shuffled, ...Array(byes).fill(null)]

  const rounds: Array<{ round: number; matches: Match[] }> = []
  let roundIndex = 1
  let current = seeds
  let matchIdCounter = 1
  while (current.length > 1) {
    const matches: Match[] = []
    for (let i = 0; i < current.length; i += 2) {
      const team1Id = current[i]
      const team2Id = current[i + 1]
      const m: Match = {
        id: `m${tournamentId}-${matchIdCounter++}`,
        tournamentId,
        side: "winners",
        round: roundIndex,
        index: i / 2,
        team1Id,
        team2Id,
      }
      // Auto-advance on bye
      if (team1Id && !team2Id) {
        m.winnerId = team1Id
      } else if (!team1Id && team2Id) {
        m.winnerId = team2Id
      }
      matches.push(m)
    }
    rounds.push({ round: roundIndex, matches })
    // Compute winners for next round (byes propagate)
    const nextSeeds: Array<string | null> = []
    for (const m of matches) {
      if (m.winnerId) nextSeeds.push(m.winnerId)
      else nextSeeds.push(null) // unresolved until played
    }
    current = nextSeeds
    roundIndex++
  }
  const bracket: Bracket = {
    tournamentId,
    kind: "single",
    rounds: {
      winners: rounds,
      losers: [],
      grand: [],
    },
  }
  brackets[tournamentId] = bracket
  return bracket
}

export function generateDoubleElimBracket(tournamentId: string, teamIds: string[]): Bracket {
  // Winners bracket identical to single-elimination
  const winners = generateSingleElimBracket(tournamentId, teamIds).rounds.winners
  // Skeleton losers bracket with the necessary number of rounds
  const roundsCount = winners.length
  const losers: Array<{ round: number; matches: Match[] }> = []
  let matchIdCounter = 1000
  for (let r = 1; r <= roundsCount; r++) {
    // approximate number of matches per losers round
    const matchesInRound = Math.max(1, Math.floor(Math.pow(2, Math.max(0, roundsCount - r - 1))))
    const ms: Match[] = Array.from({ length: matchesInRound }, (_, i) => ({
      id: `lm${tournamentId}-${matchIdCounter++}`,
      tournamentId,
      side: "losers" as const,
      round: r,
      index: i,
      team1Id: null,
      team2Id: null,
    }))
    losers.push({ round: r, matches: ms })
  }
  const grand: Array<{ round: number; matches: Match[] }> = [
    { round: 1, matches: [{ id: `gm${tournamentId}-1`, tournamentId, side: "grand", round: 1, index: 0 }] as Match[] },
  ]
  const bracket: Bracket = {
    tournamentId,
    kind: "double",
    rounds: { winners, losers, grand },
  }
  brackets[tournamentId] = bracket
  return bracket
}

export function getBracket(tournamentId: string) {
  return brackets[tournamentId] || null
}
