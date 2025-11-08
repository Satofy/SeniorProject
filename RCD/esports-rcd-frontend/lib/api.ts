// API client for RCD backend
const DEV_DEFAULT = 'http://localhost:3002'

export interface User {
  id: string
  email: string
  username?: string
  role: "guest" | "player" | "team_manager" | "admin"
  teamId?: string
}

export type Team = {
  id: string
  name: string
  tag?: string
  managerId: string
  members?: Array<{ id: string; email?: string; role?: User["role"] } | string>
  games?: string[]
  social?: { discord?: string; twitter?: string; twitch?: string }
  gamesPlayed?: number
  balance?: number
  createdAt?: string
  pendingRequests?: Array<{ id: string; userId: string; user?: { id: string; email?: string; username?: string }; message?: string; createdAt: string }>
}

export type JoinRequest = {
  id: string
  user?: { id: string; email?: string; username?: string }
  createdAt: string
}

export type Tournament = {
  id: string;
  title: string;
  description?: string;
  date: string;
  status: "upcoming" | "ongoing" | "completed" | string;
  prizePool?: string;
  game?: string; // optional, used by UI when available
  type?: "solo" | "team" | string;
  maxParticipants?: number;
  currentParticipants?: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || DEV_DEFAULT;

function authHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const token = localStorage.getItem('rcd_token') || ''
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_URL) throw new Error("API URL not configured");
  const baseHeaders: Record<string, string> = { 'Content-Type': 'application/json', ...authHeader() }
  // Merge any incoming headers (string key/value only)
  if (init?.headers && typeof init.headers === 'object' && !Array.isArray(init.headers)) {
    Object.entries(init.headers as Record<string, string>).forEach(([k, v]) => {
      baseHeaders[k] = v as string
    })
  }
  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    ...init,
    headers: baseHeaders,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }>
  {
    const data = await request<{ token: string; user: User }>("/api/auth/login", {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
    if (typeof window !== 'undefined') {
      localStorage.setItem('rcd_token', data.token)
    }
    return data
  },
  async register(email: string, password: string, username?: string): Promise<{ token: string; user: User }>
  {
    const data = await request<{ token: string; user: User }>("/api/auth/register", {
      method: 'POST',
      body: JSON.stringify({ email, password, username })
    })
    if (typeof window !== 'undefined') {
      localStorage.setItem('rcd_token', data.token)
    }
    return data
  },
  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('rcd_token')
    }
  },
  async getCurrentUser(): Promise<User> {
    return request<User>("/api/auth/me")
  },
  async changePassword(oldPassword: string, newPassword: string): Promise<{ message: string }>{
    return request("/api/auth/change-password", {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword })
    })
  },
  async updateUser(userId: string, body: Partial<Pick<User, 'email' | 'username'>>): Promise<User> {
    try {
      return await request<User>(`/api/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(body)
      })
    } catch (e: any) {
      throw new Error(e?.message || 'User update not available')
    }
  },
  async getTournaments(): Promise<Tournament[]> {
    try {
      const items = await request<any[]>("/api/tournaments");
      return items.map((t: any) => ({
        id: String(t.id || t._id),
        title: t.title,
        date: t.date,
        status: (t.status || (new Date(t.date) > new Date() ? 'upcoming' : 'ongoing')) as Tournament['status'],
        prizePool: t.prizePool,
        game: t.game,
        type: t.type,
        maxParticipants: t.maxParticipants,
        currentParticipants: Array.isArray(t.participants) ? t.participants.length : t.currentParticipants,
      }));
    } catch {
      return [];
    }
  },
  async getTournament(id: string): Promise<Tournament> {
    // Backend does not expose single GET currently; fall back to list
    const list = await this.getTournaments();
    const found = list.find(t => t.id === id);
    if (!found) throw new Error('Tournament not found');
    return found;
  },
  async createTournament(body: {
    title: string;
    description?: string;
    date: string;
    type?: Tournament['type'];
    status?: Tournament['status'];
    maxParticipants?: number;
    prizePool?: string;
    game?: string;
  }): Promise<Tournament> {
    const t = await request<any>("/api/tournaments", { method: 'POST', body: JSON.stringify(body) });
    return { id: String(t.id || t._id), title: t.title, date: t.date, status: t.status || 'upcoming', prizePool: t.prizePool, game: t.game, type: t.type, maxParticipants: t.maxParticipants, currentParticipants: (t.participants?.length)||0 };
  },
  async registerForTournament(tournamentId: string, teamId?: string): Promise<{ message: string }> {
    return request(`/api/tournaments/${tournamentId}/register`, { method: 'POST', body: JSON.stringify({ teamId }) });
  },
  async updateTournament(id: string, body: Partial<{ title: string; date: string; type: Tournament['type']; status: Tournament['status']; maxParticipants: number; prizePool: string; game: string }>): Promise<Tournament> {
    const t = await request<any>(`/api/tournaments/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
    return { id: String(t.id || t._id), title: t.title, date: t.date, status: t.status || 'upcoming', prizePool: t.prizePool, game: t.game, type: t.type, maxParticipants: t.maxParticipants, currentParticipants: (t.participants?.length)||0 };
  },
  async deleteTournament(id: string): Promise<{ message: string }> {
    return request(`/api/tournaments/${id}`, { method: 'DELETE' });
  },
  // Teams
  async getTeams(): Promise<Team[]> {
    try {
      const items = await request<any[]>("/api/teams");
      // normalize: ensure id field exists
      return items.map((t: any) => ({
        id: String(t.id || t._id),
        name: t.name,
        tag: t.tag,
        managerId: String(t.managerId || t.manager || ""),
        members: t.members,
        gamesPlayed: t.gamesPlayed,
        balance: t.balance,
        createdAt: t.createdAt,
        games: t.games,
        social: t.social,
      })) as Team[];
    } catch (e) {
      return [];
    }
  },
  async createTeam(name: string, tag?: string, games?: string[], social?: { discord?: string; twitter?: string; twitch?: string }): Promise<Team> {
    const body: Record<string, any> = { name };
    if (tag) body.tag = tag;
    if (games?.length) body.games = games;
    if (social) body.social = social;
    const t = await request<any>("/api/teams", { method: 'POST', body: JSON.stringify(body) });
    return {
      id: String(t.id || t._id),
      name: t.name,
      tag: t.tag,
      managerId: String(t.managerId || t.manager || ""),
      members: t.members,
      games: t.games,
      social: t.social,
      gamesPlayed: t.gamesPlayed,
      balance: t.balance,
      createdAt: t.createdAt,
    };
  },
  async getTeam(id: string): Promise<Team> {
    // Try direct endpoint first; if not available, fall back to list
    try {
      const t = await request<any>(`/api/teams/${id}`);
      return {
        id: String(t.id || t._id),
        name: t.name,
        tag: t.tag,
        managerId: String(t.managerId || t.manager || ""),
        members: t.members,
        games: t.games,
        social: t.social,
        gamesPlayed: t.gamesPlayed,
        balance: t.balance,
        createdAt: t.createdAt,
        pendingRequests: t.pendingRequests?.map((r: any) => ({
          id: String(r._id || r.id),
          userId: String(r.userId?._id || r.userId),
          user: r.userId && typeof r.userId === 'object' ? { id: String(r.userId._id), email: r.userId.email, username: r.userId.username } : undefined,
          message: r.message,
          createdAt: r.createdAt,
        })),
      };
    } catch {
      const list = await this.getTeams();
      const found = list.find((x) => x.id === id);
      if (!found) throw new Error('Team not found');
      return found;
    }
  },
  async getTeamRequests(teamId: string): Promise<Array<{ id: string; userId: string; user?: { id: string; email?: string; username?: string }; message?: string; createdAt: string }>> {
    const data = await request<any>(`/api/teams/${teamId}/requests`);
    return (data.requests || []).map((r: any) => ({
      id: String(r._id || r.id),
      userId: String(r.userId?._id || r.userId),
      user: r.userId && typeof r.userId === 'object' ? { id: String(r.userId._id), email: r.userId.email, username: r.userId.username } : undefined,
      message: r.message,
      createdAt: r.createdAt,
    }));
  },
  async requestToJoinTeam(teamId: string, message?: string): Promise<{ message: string }> {
    // Primary endpoint uses /requests; fall back to legacy /join if 404
    try {
      const res = await request<{ message: string }>(`/api/teams/${teamId}/requests`, { method: 'POST', body: JSON.stringify({ message }) });
      if (typeof window !== 'undefined') {
        localStorage.setItem('rcd_last_join_req', JSON.stringify({ teamId, ts: Date.now() }));
        window.dispatchEvent(new Event('rcd-notifications-refresh'))
      }
      return res;
    } catch (e: any) {
      if (/(404)/.test(e.message)) {
        // try legacy path
        const res = await request<{ message: string }>(`/api/teams/${teamId}/join`, { method: 'POST', body: JSON.stringify({ message }) });
        if (typeof window !== 'undefined') {
          localStorage.setItem('rcd_last_join_req', JSON.stringify({ teamId, ts: Date.now() }));
          window.dispatchEvent(new Event('rcd-notifications-refresh'))
        }
        return res;
      }
      throw e;
    }
  },
  async getUsers(): Promise<User[]> {
    const users = await request<any[]>(`/api/users`);
    return users.map((u) => ({ id: String(u.id || u._id), email: u.email, username: u.username, role: (u.role || 'player') as User['role'], teamId: u.teamId ? String(u.teamId) : undefined }));
  },
  async changeUserRole(userId: string, role: User['role']): Promise<User> {
    const u = await request<any>(`/api/users/${userId}/role`, { method: 'PATCH', body: JSON.stringify({ role }) });
    return { id: String(u.id || u._id), email: u.email, username: u.username, role: (u.role || 'player') as User['role'], teamId: u.teamId ? String(u.teamId) : undefined };
  },
  async deleteUser(userId: string): Promise<{ message: string }> {
    return request(`/api/users/${userId}`, { method: 'DELETE' });
  },
  async deleteTeam(teamId: string): Promise<{ message: string }> {
    return request(`/api/teams/${teamId}`, { method: 'DELETE' });
  },
  async getAuditLogs(): Promise<Array<{ timestamp: string; user: string; action: string; details?: string }>> {
    return request(`/api/audit-logs`);
  },
  async approveJoinRequest(teamId: string, reqId: string): Promise<{ message: string }> {
    return request(`/api/teams/${teamId}/requests/${reqId}/approve`, { method: 'POST' });
  },
  async declineJoinRequest(teamId: string, reqId: string): Promise<{ message: string }> {
    return request(`/api/teams/${teamId}/requests/${reqId}/decline`, { method: 'POST' });
  },
  async updateTeamMemberRole(teamId: string, memberId: string, role: User['role']): Promise<{ message: string }> {
    try {
      return await request(`/api/teams/${teamId}/members/${memberId}/role`, { method: 'PATCH', body: JSON.stringify({ role }) })
    } catch (e: any) {
      throw new Error(e?.message || 'Failed to update member role')
    }
  },
  async removeTeamMember(teamId: string, memberId: string): Promise<{ message: string }> {
    try {
      return await request(`/api/teams/${teamId}/members/${memberId}`, { method: 'DELETE' })
    } catch (e: any) {
      throw new Error(e?.message || 'Failed to remove member')
    }
  },
  async leaveTeam(teamId: string): Promise<{ message: string }> {
    try {
      return await request(`/api/teams/${teamId}/leave`, { method: 'POST' })
    } catch (e: any) {
      throw new Error(e?.message || 'Failed to leave team')
    }
  },
  // Client-side fetch to our own Next.js API route that proxies PandaScore
  async getPandaTournaments(params?: { game?: string; page?: number; perPage?: number }): Promise<Tournament[]> {
    const game = params?.game ?? "valorant";
    const page = params?.page ?? 1;
    const perPage = params?.perPage ?? 25;

    try {
      const res = await fetch(`/api/pandascore/tournaments?game=${encodeURIComponent(game)}&page=${page}&perPage=${perPage}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: { ok: boolean; data?: any[] } = await res.json();
      const items = json.data ?? [];
      const now = new Date();
      return items.map((t: any) => {
        const begin = t.begin_at ? new Date(t.begin_at) : undefined;
        const end = t.end_at ? new Date(t.end_at) : undefined;
        let status: Tournament["status"] = "upcoming";
        if (begin && now < begin) status = "upcoming";
        else if (end && now > end) status = "completed";
        else status = "ongoing";

        return {
          id: String(t.id),
          title: t.name ?? "Untitled",
          description: t.series?.full_name || t.league?.name || undefined,
          date: (t.begin_at || t.end_at || new Date().toISOString()) as string,
          status,
          prizePool: t.prizepool ?? undefined,
          game: t.videogame?.name ?? game,
        } satisfies Tournament;
      });
    } catch {
      return [];
    }
  },
  async me(): Promise<{ id: string; email: string; role: string }> {
    return request("/api/auth/me");
  },
};
