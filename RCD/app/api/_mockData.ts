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
