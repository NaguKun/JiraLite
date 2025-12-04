// Frontend API client for connecting to the backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

export const apiClient = {
  // Auth endpoints
  signup: async (email: string, password: string, name: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    })
    return response.json()
  },

  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    return response.json()
  },

  // Teams
  getTeams: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/teams`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.json()
  },

  createTeam: async (token: string, name: string) => {
    const response = await fetch(`${API_BASE_URL}/teams`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    })
    return response.json()
  },

  // Projects
  getProjects: async (token: string, teamId: string) => {
    const response = await fetch(`${API_BASE_URL}/projects/teams/${teamId}/projects`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.json()
  },

  // Issues
  getIssues: async (token: string, projectId: string) => {
    const response = await fetch(`${API_BASE_URL}/issues/projects/${projectId}/issues`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.json()
  },

  createIssue: async (token: string, projectId: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/issues/projects/${projectId}/issues`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    return response.json()
  },
}
