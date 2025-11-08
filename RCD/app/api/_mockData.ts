// Simple in-memory mock data for dev use

export type MockUser = {
  id: string
  email: string
  role: "guest" | "player" | "team_manager" | "admin"
}

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
}

let counter = 1000
const newid = () => String(counter++)

// Seed users
export const users: MockUser[] = [
  { id: "1", email: "owner@example.com", role: "team_manager" },
  { id: "2", email: "player1@example.com", role: "player" },
  { id: "3", email: "player2@example.com", role: "player" },
  { id: "4", email: "admin@example.com", role: "admin" },
]

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
  { id: "a1", title: "Autumn Cup", date: new Date().toISOString(), type: "5v5", status: "upcoming" },
  { id: "a2", title: "Winter Clash", date: new Date().toISOString(), type: "Solo", status: "ongoing" },
]

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
  return true
}
