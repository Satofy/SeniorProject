// Simple in-memory mock data for dev use

export type MockUser = {
  id: string;
  email: string;
  role: "guest" | "player" | "team_manager" | "admin";
  username?: string;
  // Single-team affiliation for simplified model
  teamId?: string;
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

// Team join requests
export type JoinRequest = {
  id: string
  teamId: string
  userId: string
  status: "pending" | "approved" | "declined"
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
  status?: "pending" | "completed"
}

export type Bracket = {
  tournamentId: string
  kind: BracketKind
  rounds: Record<BracketSide, Array<{ round: number; matches: Match[] }>>
}

let counter = 1000
const newid = () => String(counter++)

// Global singleton store to survive Next.js dev fast refresh
const g: any = globalThis as any
if (!g.__RCD_STORE__) {
  g.__RCD_STORE__ = {
    users: [] as MockUser[],
    teams: [] as MockTeam[],
    tournaments: [] as MockTournament[],
    registrations: [] as Registration[],
    brackets: {} as Record<string, Bracket>,
    joinRequests: [] as JoinRequest[],
    bracketSubscribers: {} as Record<string, Set<(b: Bracket) => void>>,
    auditLogs: [] as AuditLog[],
    userNotifications: {} as Record<string, UserNotification[]>,
  };
}
const STORE = g.__RCD_STORE__

// Seed users (only once)
export const users: MockUser[] = STORE.users
if (!users.length) {
  users.push(
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
    { id: "4", email: "admin@example.com", role: "admin", username: "admin" }
  );
}

export const teams: MockTeam[] = STORE.teams;
if (!teams.length) {
  teams.push(
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
    }
  );
}

export const tournaments: MockTournament[] = STORE.tournaments;
if (!tournaments.length) {
  tournaments.push(
    {
      id: "a1",
      title: "Autumn Cup",
      date: new Date().toISOString(),
      type: "5v5",
      status: "upcoming",
      maxParticipants: 32,
      currentParticipants: 10,
      game: "Valorant",
    },
    {
      id: "a2",
      title: "Winter Clash",
      date: new Date().toISOString(),
      type: "Solo",
      status: "ongoing",
      maxParticipants: 16,
      currentParticipants: 8,
      game: "League of Legends",
    }
  );
}

// Storage (persistent singleton references)
export const registrations: Registration[] = STORE.registrations
export const brackets: Record<string, Bracket> = STORE.brackets
export const joinRequests: JoinRequest[] = STORE.joinRequests
export const bracketSubscribers: Record<string, Set<(b: Bracket) => void>> = STORE.bracketSubscribers

function broadcastBracket(tournamentId: string) {
  const b = brackets[tournamentId]
  if (!b) return
  const subs = bracketSubscribers[tournamentId]
  subs?.forEach((fn) => {
    try { fn(b) } catch {}
  })
}

export function subscribeBracket(tournamentId: string, fn: (b: Bracket) => void) {
  if (!bracketSubscribers[tournamentId]) bracketSubscribers[tournamentId] = new Set()
  bracketSubscribers[tournamentId].add(fn)
  return () => bracketSubscribers[tournamentId].delete(fn)
}

// Simple audit log storage
export type AuditLog = {
  timestamp: string
  user: string
  action: string
  details?: string
}

export const auditLogs: AuditLog[] = STORE.auditLogs;
export type UserNotification = {
  id: string;
  type: "info" | "warning" | "success" | "action";
  message: string;
  createdAt: string;
  teamId?: string;
  requestId?: string;
  read?: boolean;
};
export const userNotifications: Record<string, UserNotification[]> =
  STORE.userNotifications;

function notify(
  userId: string,
  n: Omit<UserNotification, "id" | "createdAt"> & { createdAt?: string }
) {
  if (!userNotifications[userId]) userNotifications[userId] = [];
  const note: UserNotification = {
    id: `un${newid()}`,
    type: n.type || "info",
    message: n.message,
    createdAt: n.createdAt
      ? new Date(n.createdAt).toISOString()
      : new Date().toISOString(),
    teamId: n.teamId,
    requestId: n.requestId,
    read: false,
  };
  userNotifications[userId].unshift(note);
  return note;
}

export function listUserNotifications(userId: string) {
  return userNotifications[userId] || [];
}

export function clearUserNotifications(userId: string) {
  userNotifications[userId] = [];
}

export function markAllNotificationsRead(userId: string) {
  const list = userNotifications[userId];
  if (!list) return 0;
  let count = 0;
  for (const n of list) {
    if (!n.read) {
      n.read = true;
      count++;
    }
  }
  return count;
}

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
  };
  teams.push(t);
  // Assign manager teamId if not already set (single-team model)
  const mgr = users.find((u) => u.id === managerId);
  if (mgr && !mgr.teamId) mgr.teamId = t.id;
  log(managerId, "create_team", `Team ${t.name} (${t.id}) created`);
  return t;
}

export function getTeam(id: string) {
  return teams.find((t) => t.id === id) || null
}

export function createJoinRequest(teamId: string, userId: string): JoinRequest {
  const team = getTeam(teamId)
  if (!team) throw new Error("Team not found")
  const user = users.find((u) => u.id === userId);
  if (!user) throw new Error("User not found");
  // Block if user already affiliated with a team (single-team rule)
  if (user.teamId && user.teamId !== teamId)
    throw new Error("Already joined a team");
  // Prevent duplicate/pending
  const dup = joinRequests.find(j => j.teamId === teamId && j.userId === userId && j.status === "pending")
  if (dup) throw new Error("Request already pending")
  // Prevent if already a member
  if (team.members.some(m => m.id === userId)) throw new Error("Already a team member")
  const req: JoinRequest = { id: `jr${newid()}`, teamId, userId, status: "pending", createdAt: new Date().toISOString() }
  joinRequests.push(req)
  log(userId, "join_request", `Requested to join team ${teamId}`)
  notify(team.managerId, {
    type: "action",
    message: `New join request from user ${user.email} for team ${team.name}`,
    teamId,
    requestId: req.id,
  });
  return req
}

export function listTeamJoinRequests(teamId: string) {
  return joinRequests.filter(j => j.teamId === teamId)
}

export function approveTeamJoinRequest(teamId: string, requestId: string) {
  const team = getTeam(teamId);
  if (!team) throw new Error("Team not found");
  const req = joinRequests.find(
    (j) => j.id === requestId && j.teamId === teamId
  );
  if (!req) throw new Error("Request not found");
  if (req.status !== "pending") throw new Error("Request already processed");
  const user = users.find((u) => u.id === req.userId);
  if (!user) throw new Error("User not found");
  if (!team.members.some((m) => m.id === user.id)) {
    team.members.push(user);
  }
  req.status = "approved";
  // Set user's team affiliation
  if (!user.teamId) user.teamId = teamId;
  // Close any other pending requests for same user/team
  joinRequests.forEach((j) => {
    if (
      j !== req &&
      j.teamId === teamId &&
      j.userId === req.userId &&
      j.status === "pending"
    )
      j.status = "declined";
  });
  log(
    team.managerId,
    "approve_join",
    `Approved user ${user.id} to team ${teamId}`
  );
  notify(user.id, {
    type: "success",
    message: `You were approved to join team ${team.name}`,
    teamId,
  });
  return req;
}

export function listManagerPendingRequests(managerId: string) {
  const managedTeams = teams.filter(t => t.managerId === managerId).map(t => t.id)
  const pending = joinRequests.filter(r => r.status === "pending" && managedTeams.includes(r.teamId))
  return pending.map(r => ({
    ...r,
    user: users.find(u => u.id === r.userId),
    team: teams.find(t => t.id === r.teamId),
  }))
}

export function declineTeamJoinRequest(teamId: string, requestId: string) {
  const team = getTeam(teamId)
  if (!team) throw new Error("Team not found")
  const req = joinRequests.find(j => j.id === requestId && j.teamId === teamId)
  if (!req) throw new Error("Request not found")
  if (req.status !== "pending") throw new Error("Request already processed")
  req.status = "declined"
  log(team.managerId, "decline_join", `Declined user ${req.userId} to team ${teamId}`)
  notify(req.userId, {
    type: "info",
    message: `Your request to join team ${team.name} was declined`,
    teamId,
  });
  return req
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
  // initialize status
  bracket.rounds.winners.forEach(r => r.matches.forEach(m => { if (!m.winnerId) m.status = "pending"; else m.status = "completed" }))
  broadcastBracket(tournamentId)
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
  bracket.rounds.winners.forEach(r => r.matches.forEach(m => { if (!m.winnerId) m.status = "pending"; else m.status = "completed" }))
  bracket.rounds.losers.forEach(r => r.matches.forEach(m => { m.status = "pending" }))
  bracket.rounds.grand.forEach(r => r.matches.forEach(m => { m.status = "pending" }))
  broadcastBracket(tournamentId)
  return bracket
}

export function getBracket(tournamentId: string) {
  return brackets[tournamentId] || null
}

// Helper to find match
function findMatch(tournamentId: string, matchId: string): Match | null {
  const b = brackets[tournamentId]
  if (!b) return null
  for (const side of ["winners","losers","grand"] as BracketSide[]) {
    for (const round of b.rounds[side]) {
      const m = round.matches.find(x => x.id === matchId)
      if (m) return m
    }
  }
  return null
}

// Propagate winner in single or winners side of double
function propagateWinnerWinners(bracket: Bracket, match: Match) {
  if (!match.winnerId) return
  if (match.side !== "winners") return
  // last round? then may populate grand final for double
  const winnersRounds = bracket.rounds.winners
  const round = winnersRounds.find(r => r.round === match.round)
  if (!round) return
  const isLastRound = match.round === winnersRounds[winnersRounds.length - 1].round
  if (isLastRound) {
    if (bracket.kind === "double") {
      // put winner into grand final match team1 if empty
      const grand = bracket.rounds.grand[0]?.matches[0]
      if (grand && !grand.team1Id) { grand.team1Id = match.winnerId }
    }
    return
  }
  const nextRound = winnersRounds.find(r => r.round === match.round + 1)
  if (!nextRound) return
  const targetIndex = Math.floor(match.index / 2)
  const targetMatch = nextRound.matches[targetIndex]
  if (!targetMatch) return
  if (match.index % 2 === 0) {
    if (!targetMatch.team1Id) targetMatch.team1Id = match.winnerId
  } else {
    if (!targetMatch.team2Id) targetMatch.team2Id = match.winnerId
  }
}

// Place loser into losers bracket (simplified)
function propagateLoser(bracket: Bracket, match: Match) {
  if (bracket.kind !== "double") return
  if (!match.winnerId) return
  if (match.side !== "winners") return // only from winners side for now
  const loserId = match.team1Id && match.team2Id ? (match.winnerId === match.team1Id ? match.team2Id : match.team1Id) : null
  if (!loserId) return
  // find first losers match with free slot
  for (const round of bracket.rounds.losers) {
    for (const m of round.matches) {
      if (!m.team1Id) { m.team1Id = loserId; return }
      if (!m.team2Id) { m.team2Id = loserId; return }
    }
  }
}

export function reportMatch(
  tournamentId: string,
  matchId: string,
  score1?: number,
  score2?: number,
  winnerOverride?: string,
  actorId: string = "system"
) {
  const b = brackets[tournamentId];
  if (!b) throw new Error("Bracket not found");
  const m = findMatch(tournamentId, matchId);
  if (!m) throw new Error("Match not found");
  if (m.status === "completed") throw new Error("Match already completed");
  if (!m.team1Id && !m.team2Id) throw new Error("Match has no participants");
  if (typeof winnerOverride === "string") {
    m.winnerId = winnerOverride;
  } else if (typeof score1 === "number" && typeof score2 === "number") {
    m.score1 = score1;
    m.score2 = score2;
    if (m.team1Id && m.team2Id) {
      m.winnerId =
        score1 === score2
          ? m.team1Id
          : score1 > score2
          ? m.team1Id!
          : m.team2Id!;
    } else {
      // bye scenario
      m.winnerId = m.team1Id || m.team2Id || undefined;
    }
  } else {
    throw new Error("Provide scores or a winner override");
  }
  m.status = "completed";
  m.completedAt = new Date().toISOString();
  propagateWinnerWinners(b, m);
  propagateLoser(b, m);
  // If losers bracket champion just finished, feed into grand final team2
  if (b.kind === "double" && m.side === "losers") {
    const losersRounds = b.rounds.losers;
    const lastLosersRound = losersRounds[losersRounds.length - 1];
    if (lastLosersRound && lastLosersRound.round === m.round) {
      const grand = b.rounds.grand[0]?.matches[0];
      if (grand && !grand.team2Id && m.winnerId) grand.team2Id = m.winnerId;
    }
  }
  // If grand final completed, mark tournament completed
  if (m.side === "grand" && m.status === "completed") {
    const t = getTournament(tournamentId);
    if (t && t.status !== "completed") {
      t.status = "completed";
      log(
        actorId,
        "complete_tournament",
        `Tournament ${t.title} (${t.id}) completed by grand final`
      );
    }
  }
  log(
    actorId,
    "report_match",
    `Match ${m.id} reported: ${m.team1Id ?? "TBD"} ${m.score1 ?? ""} - ${
      m.score2 ?? ""
    } ${m.team2Id ?? "TBD"}; winner ${m.winnerId}`
  );
  broadcastBracket(tournamentId);
  return m;
}

export function resetMatch(
  tournamentId: string,
  matchId: string,
  actorId: string = "system"
) {
  const b = brackets[tournamentId];
  if (!b) throw new Error("Bracket not found");
  const m = findMatch(tournamentId, matchId);
  if (!m) throw new Error("Match not found");
  // removing downstream propagation is complex – for senior project we disallow reset if propagated
  if (m.status === "completed") {
    // naive check: if its winner appears in later round slot, block reset
    const winnerId = m.winnerId;
    if (winnerId) {
      for (const side of ["winners", "losers", "grand"] as BracketSide[]) {
        for (const round of b.rounds[side]) {
          for (const child of round.matches) {
            if (
              child !== m &&
              (child.team1Id === winnerId || child.team2Id === winnerId)
            ) {
              throw new Error("Cannot reset: winner already propagated");
            }
          }
        }
      }
    }
  }
  m.score1 = undefined;
  m.score2 = undefined;
  m.winnerId = undefined;
  m.status = "pending";
  m.completedAt = undefined;
  log(actorId, "reset_match", `Match ${m.id} reset`);
  broadcastBracket(tournamentId);
  return m;
}

export function editMatchScore(
  tournamentId: string,
  matchId: string,
  score1: number,
  score2: number,
  actorId: string = "system"
) {
  const b = brackets[tournamentId];
  if (!b) throw new Error("Bracket not found");
  const m = findMatch(tournamentId, matchId);
  if (!m) throw new Error("Match not found");
  if (m.status !== "completed") throw new Error("Match is not completed yet");
  if (!m.team1Id && !m.team2Id) throw new Error("Match has no participants");

  // Compute what winner would be with the new scores
  let newWinner: string | undefined = m.winnerId;
  if (typeof score1 === "number" && typeof score2 === "number") {
    if (m.team1Id && m.team2Id) {
      if (score1 === score2) {
        // Keep existing winner on tie to avoid changing propagation
        newWinner = m.winnerId;
      } else {
        newWinner = score1 > score2 ? m.team1Id! : m.team2Id!;
      }
    } else {
      // bye scenario: keep existing winner
      newWinner = m.winnerId;
    }
  }

  if (newWinner !== m.winnerId) {
    // For simplicity and safety, disallow changing winner via edit to avoid re-propagation complexity
    throw new Error("Cannot edit scores to change winner after completion");
  }

  m.score1 = score1;
  m.score2 = score2;
  // Keep existing winnerId and completedAt
  log(
    actorId,
    "edit_match_score",
    `Match ${m.id} scores edited to ${score1}-${score2} (winner remains ${m.winnerId})`
  );
  broadcastBracket(tournamentId);
  return m;
}

// Utility for tests to clear mock state
export function resetState() {
  registrations.splice(0, registrations.length)
  for (const k of Object.keys(brackets)) delete brackets[k]
  for (const k of Object.keys(bracketSubscribers)) delete bracketSubscribers[k]
  auditLogs.splice(0, auditLogs.length)
}
