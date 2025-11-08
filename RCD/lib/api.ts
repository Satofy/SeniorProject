// API client for RCD backend
const API_BASE = process.env.NEXT_PUBLIC_API_URL || ""

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
}

export interface Team {
  id: string
  name: string
  tag?: string
  managerId: string
  members?: User[]
  balance?: number
  gamesPlayed?: number
  createdAt?: string
}

export interface JoinRequest {
  id: string
  userId: string
  teamId: string
  status: "pending" | "approved" | "declined"
  createdAt: string
  user?: User
}

class ApiClient {
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    if (typeof window !== "undefined") {
      const token = localStorage.getItem("rcd_token")
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }
    }

    return headers
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Request failed" }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const data = await this.request<{ token: string; user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
    if (typeof window !== "undefined") {
      localStorage.setItem("rcd_token", data.token)
    }
    return data
  }

  async register(email: string, password: string, username?: string) {
    const data = await this.request<{ token: string; user: User }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, username }),
    })
    if (typeof window !== "undefined") {
      localStorage.setItem("rcd_token", data.token)
    }
    return data
  }

  async getCurrentUser() {
    return this.request<User>("/api/auth/me")
  }

  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("rcd_token")
    }
  }

  // Tournament endpoints
  async getTournaments() {
    return this.request<Tournament[]>("/api/tournaments")
  }

  async getTournament(id: string) {
    return this.request<Tournament>(`/api/tournaments/${id}`)
  }

  async registerForTournament(id: string, teamId?: string) {
    return this.request(`/api/tournaments/${id}/register`, {
      method: "POST",
      body: JSON.stringify(teamId ? { teamId } : {}),
    })
  }

  async createTournament(data: Partial<Tournament>) {
    return this.request<Tournament>("/api/tournaments", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateTournament(id: string, data: Partial<Tournament>) {
    return this.request<Tournament>(`/api/tournaments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteTournament(id: string) {
    return this.request(`/api/tournaments/${id}`, {
      method: "DELETE",
    })
  }

  // Team endpoints
  async getTeams() {
    return this.request<Team[]>("/api/teams")
  }

  async getTeam(id: string) {
    return this.request<Team>(`/api/teams/${id}`)
  }

  async createTeam(name: string, tag?: string) {
    return this.request<Team>("/api/teams", {
      method: "POST",
      body: JSON.stringify({ name, tag }),
    })
  }

  async getTeamJoinRequests(teamId: string) {
    return this.request<JoinRequest[]>(`/api/teams/${teamId}/requests`)
  }

  async requestToJoinTeam(teamId: string) {
    return this.request(`/api/teams/${teamId}/join`, {
      method: "POST",
    })
  }

  async approveJoinRequest(teamId: string, requestId: string) {
    return this.request(`/api/teams/${teamId}/requests/${requestId}/approve`, {
      method: "POST",
    })
  }

  async declineJoinRequest(teamId: string, requestId: string) {
    return this.request(`/api/teams/${teamId}/requests/${requestId}/decline`, {
      method: "POST",
    })
  }

  async removeTeamMember(teamId: string, userId: string) {
    return this.request(`/api/teams/${teamId}/members/${userId}`, {
      method: "DELETE",
    })
  }

  async deleteTeam(teamId: string) {
    return this.request(`/api/teams/${teamId}`, {
      method: "DELETE",
    })
  }

  // User endpoints
  async getUser(id: string) {
    return this.request<User>(`/api/users/${id}`)
  }

  async updateUser(id: string, data: Partial<User>) {
    return this.request<User>(`/api/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async changePassword(oldPassword: string, newPassword: string) {
    return this.request(`/api/users/change-password`, {
      method: "POST",
      body: JSON.stringify({ oldPassword, newPassword }),
    })
  }

  // Admin endpoints
  async getUsers() {
    return this.request<User[]>("/api/users")
  }

  async changeUserRole(userId: string, role: User["role"]) {
    return this.request(`/api/users/${userId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    })
  }

  async deleteUser(userId: string) {
    return this.request(`/api/users/${userId}`, {
      method: "DELETE",
    })
  }

  async getAuditLogs() {
    return this.request<any[]>("/api/admin/logs")
  }
}

export const api = new ApiClient()
