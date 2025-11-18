// API client for RCD backend
const API_BASE = process.env.NEXT_PUBLIC_API_URL || ""
const DATA_MODE = (
  process.env.NEXT_PUBLIC_DATA_MODE || (API_BASE ? "real" : "mock")
).toLowerCase() as "mock" | "real";

export interface User {
  id: string
  email: string
  username?: string
  role: "guest" | "player" | "team_manager" | "admin"
  teamId?: string
}

export interface Tournament {
  id: string
  title: string
  description?: string
  date: string
  type: string
  status: "upcoming" | "ongoing" | "completed"
  maxParticipants?: number
  currentParticipants?: number
  prizePool?: string
  game?: string
  payout?: {
    total: number
    awards: Array<{ place: number; teamId: string; amount: number }>
    timestamp: string
  }
}

export type BracketSide = "winners" | "losers" | "grand";
export type BracketKind = "single" | "double";

export interface Match {
  id: string;
  tournamentId: string;
  side: BracketSide;
  round: number;
  index: number;
  team1Id?: string | null;
  team2Id?: string | null;
  score1?: number;
  score2?: number;
  winnerId?: string;
  scheduledAt?: string;
  completedAt?: string;
  status?: "pending" | "completed";
}

export interface Bracket {
  tournamentId: string;
  kind: BracketKind;
  rounds: Record<BracketSide, Array<{ round: number; matches: Match[] }>>;
}

export interface Registration {
  id: string;
  tournamentId: string;
  teamId: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  tag?: string;
  managerId: string;
  members?: User[];
  balance?: number;
  gamesPlayed?: number;
  createdAt?: string;
  games?: string[];
  captainIds?: string[];
  // Unify shape with esports-rcd-frontend: store full request objects instead of just a count
  pendingRequests?: Array<{
    id: string;
    userId: string;
    user?: { id: string; email?: string; username?: string };
    message?: string;
    createdAt: string;
  }>;
}

export interface JoinRequest {
  id: string;
  userId: string;
  teamId: string;
  status: "pending" | "approved" | "declined";
  createdAt: string;
  user?: User;
}

class ApiClient {
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (typeof window !== "undefined") {
      const token = localStorage.getItem("rcd_token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const base = DATA_MODE === "real" ? API_BASE : "";
    const url = `${base}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      // Try JSON; if fails, capture raw text for diagnostics
      let error: any;
      try {
        error = await response.json();
      } catch {
        const text = await response.text().catch(() => "");
        error = { message: text || "Request failed" };
      }
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    // Successful path – attempt JSON parse with diagnostics fallback
    try {
      return await response.json();
    } catch (e: any) {
      const raw = await response.text().catch(() => "");
      console.error("Failed to parse JSON for", endpoint, "Raw:", raw.slice(0, 200));
      throw new Error("Malformed JSON response: " + (e?.message || "parse error"));
    }
  }

  private normalizeTournament(raw: any): Tournament {
    // Works for both mock and real
    const id = String(raw.id || raw._id);
    const dateStr =
      typeof raw.date === "string"
        ? raw.date
        : raw.date
        ? new Date(raw.date).toISOString()
        : new Date().toISOString();
    const max = raw.maxParticipants ?? raw.max_participants;
    const current =
      raw.currentParticipants ??
      raw.current_participants ??
      (Array.isArray(raw.participants) ? raw.participants.length : undefined);
    let status: Tournament["status"] = (raw.status as any) || "upcoming";
    if (!raw.status && dateStr) {
      const d = new Date(dateStr).getTime();
      const now = Date.now();
      status = d > now ? "upcoming" : "completed";
    }
    return {
      id,
      title: raw.title || raw.name || "Untitled",
      description: raw.description || undefined,
      date: dateStr,
      type: raw.type || "single-elimination",
      status,
      maxParticipants: typeof max === "number" ? max : undefined,
      currentParticipants: typeof current === "number" ? current : undefined,
      prizePool: raw.prizePool || raw.prize_pool || undefined,
      game: raw.game || undefined,
      // Pass through payout if present
      ...(raw.payout
        ? {
            payout: {
              total: raw.payout.total,
              awards: raw.payout.awards,
              timestamp: raw.payout.timestamp,
            },
          }
        : {}),
    };
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const data = await this.request<{ token: string; user: User }>(
      "/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }
    );
    if (typeof window !== "undefined") {
      localStorage.setItem("rcd_token", data.token);
    }
    return data;
  }

  async register(email: string, password: string, username?: string) {
    const data = await this.request<{ token: string; user: User }>(
      "/api/auth/register",
      {
        method: "POST",
        body: JSON.stringify({ email, password, username }),
      }
    );
    if (typeof window !== "undefined") {
      localStorage.setItem("rcd_token", data.token);
    }
    return data;
  }

  async getCurrentUser() {
    return this.request<User>("/api/auth/me");
  }

  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("rcd_token");
    }
  }

  // Tournament endpoints
  async getTournaments() {
    const res = await this.request<any[]>("/api/tournaments");
    return res.map((t) => this.normalizeTournament(t));
  }

  async getTournament(id: string) {
    const t = await this.request<any>(`/api/tournaments/${id}`);
    return this.normalizeTournament(t);
  }

  async registerForTournament(id: string, teamId?: string) {
    return this.request(`/api/tournaments/${id}/register`, {
      method: "POST",
      body: JSON.stringify(teamId ? { teamId } : {}),
    });
  }

  async createTournament(data: Partial<Tournament>) {
    const t = await this.request<any>("/api/tournaments", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return this.normalizeTournament(t);
  }

  async updateTournament(id: string, data: Partial<Tournament>) {
    const method = "PATCH";
    const t = await this.request<any>(`/api/tournaments/${id}`, {
      method,
      body: JSON.stringify(data),
    });
    return this.normalizeTournament(t);
  }

  async listRegistrations(tournamentId: string) {
    return this.request<Registration[]>(
      `/api/tournaments/${tournamentId}/registrations`
    );
  }

  async startTournament(tournamentId: string, format?: BracketKind) {
    return this.request<Bracket>(`/api/tournaments/${tournamentId}/start`, {
      method: "POST",
      body: JSON.stringify(format ? { format } : {}),
    });
  }

  async getBracket(tournamentId: string) {
    return this.request<Bracket>(`/api/tournaments/${tournamentId}/bracket`);
  }

  // Match endpoints
  async reportMatch(
    tournamentId: string,
    matchId: string,
    score1?: number,
    score2?: number,
    winnerIdOverride?: string
  ) {
    const body: Record<string, any> = {};
    if (typeof winnerIdOverride === "string") body.winnerId = winnerIdOverride;
    if (typeof score1 === "number") body.score1 = score1;
    if (typeof score2 === "number") body.score2 = score2;
    return this.request<Match>(
      `/api/tournaments/${tournamentId}/matches/${matchId}/report`,
      { method: "POST", body: JSON.stringify(body) }
    );
  }

  async resetMatch(tournamentId: string, matchId: string) {
    return this.request<Match>(
      `/api/tournaments/${tournamentId}/matches/${matchId}/reset`,
      { method: "POST" }
    );
  }

  async editMatch(
    tournamentId: string,
    matchId: string,
    score1: number,
    score2: number
  ) {
    return this.request<Match>(
      `/api/tournaments/${tournamentId}/matches/${matchId}/edit`,
      { method: "POST", body: JSON.stringify({ score1, score2 }) }
    );
  }

  async overrideMatch(
    tournamentId: string,
    matchId: string,
    winnerId: string,
    score1?: number,
    score2?: number
  ) {
    const body: Record<string, any> = { winnerId };
    if (typeof score1 === "number") body.score1 = score1;
    if (typeof score2 === "number") body.score2 = score2;
    return this.request<Match>(
      `/api/tournaments/${tournamentId}/matches/${matchId}/override`,
      { method: "POST", body: JSON.stringify(body) }
    );
  }

  subscribeBracket(
    tournamentId: string,
    onUpdate: (bracket: Bracket) => void
  ): EventSource {
    const es = new EventSource(
      `${DATA_MODE === "real" ? API_BASE : ""}/api/tournaments/${tournamentId}/bracket/stream`
    );
    const handler = (ev: MessageEvent) => {
      try {
        const data = JSON.parse(ev.data);
        onUpdate(data);
      } catch {}
    };
    es.addEventListener("bracket", handler);
    return es;
  }

  async deleteTournament(id: string) {
    return this.request(`/api/tournaments/${id}`, {
      method: "DELETE",
    });
  }

  async endTournament(id: string) {
    return this.request<{ total: number; awards: Array<{ place: number; teamId: string; amount: number }>; timestamp: string }>(
      `/api/tournaments/${id}/end`,
      { method: "POST" }
    );
  }

  // Team endpoints
  async getTeams() {
    return this.request<Team[]>("/api/teams");
  }

  async getTeam(id: string) {
    return this.request<Team>(`/api/teams/${id}`);
  }

  async createTeam(
    name: string,
    tag?: string,
    games?: string[],
    social?: { discord?: string; twitter?: string; twitch?: string }
  ) {
    const body: Record<string, any> = { name };
    if (tag) body.tag = tag;
    if (games && games.length) body.games = games;
    if (social) body.social = social;
    return this.request<Team>("/api/teams", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async getTeamJoinRequests(teamId: string) {
    return this.request<JoinRequest[]>(`/api/teams/${teamId}/requests`);
  }

  // Backward compatible alias for older callers
  async getTeamRequests(teamId: string) {
    return this.getTeamJoinRequests(teamId);
  }

  async requestToJoinTeam(teamId: string) {
    return this.request(`/api/teams/${teamId}/join`, {
      method: "POST",
    });
  }

  async getManagerJoinRequests() {
    return this.request<Array<JoinRequest & { team?: Team; user?: User }>>(
      `/api/teams/manager/requests`
    );
  }

  async approveJoinRequest(teamId: string, requestId: string) {
    return this.request(`/api/teams/${teamId}/requests/${requestId}/approve`, {
      method: "POST",
    });
  }

  async declineJoinRequest(teamId: string, requestId: string) {
    return this.request(`/api/teams/${teamId}/requests/${requestId}/decline`, {
      method: "POST",
    });
  }

  async removeTeamMember(teamId: string, userId: string) {
    return this.request(`/api/teams/${teamId}/members/${userId}`, {
      method: "DELETE",
    });
  }

  async setTeamCaptain(teamId: string, userId: string, enabled: boolean) {
    return this.request<Team>(`/api/teams/${teamId}/captains/${userId}`, {
      method: enabled ? "POST" : "DELETE",
    });
  }

  async updateTeamMemberRole(
    teamId: string,
    userId: string,
    role: User["role"]
  ) {
    // If a dedicated endpoint exists later, adjust here. For now, update user directly.
    return this.request(`/api/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
  }

  async deleteTeam(teamId: string) {
    return this.request(`/api/teams/${teamId}`, {
      method: "DELETE",
    });
  }

  async updateTeam(teamId: string, data: { name?: string; tag?: string }) {
    return this.request<Team>(`/api/teams/${teamId}`, {
      method: "PATCH",
      body: JSON.stringify(data || {}),
    });
  }

  async leaveTeam(teamId: string) {
    // Minimal placeholder: remove current user from team
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("rcd_token");
    if (!token) return;
    return this.request(`/api/teams/${teamId}/members/${token}`, {
      method: "DELETE",
    });
  }

  // User endpoints
  async getUser(id: string) {
    return this.request<User>(`/api/users/${id}`);
  }

  async updateUser(id: string, data: Partial<User>) {
    return this.request<User>(`/api/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async changePassword(oldPassword: string, newPassword: string) {
    // Real backend exposes change-password under /api/auth
    const path =
      DATA_MODE === "real"
        ? "/api/auth/change-password"
        : "/api/auth/change-password";
    return this.request(path, {
      method: "POST",
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  }

  // Admin endpoints
  async getUsers() {
    return this.request<User[]>("/api/users");
  }

  async changeUserRole(userId: string, role: User["role"]) {
    return this.request(`/api/users/${userId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
  }

  async deleteUser(userId: string) {
    return this.request(`/api/users/${userId}`, {
      method: "DELETE",
    });
  }

  async getAuditLogs() {
    const path = DATA_MODE === "real" ? "/api/audit-logs" : "/api/admin/logs";
    return this.request<any[]>(path);
  }

  // PandaScore passthrough (alias). Currently maps to our tournaments list.
  async getPandaTournaments(_opts?: any) {
    return this.getTournaments();
  }
}

export const api = new ApiClient()
