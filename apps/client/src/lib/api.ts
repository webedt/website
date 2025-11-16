const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

interface ApiOptions extends RequestInit {
  body?: any;
}

async function fetchApi<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { body, ...restOptions } = options;

  const config: RequestInit = {
    ...restOptions,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...restOptions.headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// Auth API
export const authApi = {
  register: (email: string, password: string) =>
    fetchApi('/api/auth/register', {
      method: 'POST',
      body: { email, password },
    }),

  login: (email: string, password: string, rememberMe: boolean = false) =>
    fetchApi('/api/auth/login', {
      method: 'POST',
      body: { email, password, rememberMe },
    }),

  logout: () =>
    fetchApi('/api/auth/logout', {
      method: 'POST',
    }),

  getSession: () => fetchApi('/api/auth/session'),
};

// GitHub API
export const githubApi = {
  connect: () => {
    window.location.href = `${API_BASE_URL}/api/github/oauth`;
  },

  getRepos: () => fetchApi('/api/github/repos'),

  getBranches: (owner: string, repo: string) =>
    fetchApi(`/api/github/repos/${owner}/${repo}/branches`),

  disconnect: () =>
    fetchApi('/api/github/disconnect', {
      method: 'POST',
    }),
};

// User API
export const userApi = {
  updateClaudeAuth: (claudeAuth: any) =>
    fetchApi('/api/user/claude-auth', {
      method: 'POST',
      body: { claudeAuth },
    }),

  removeClaudeAuth: () =>
    fetchApi('/api/user/claude-auth', {
      method: 'DELETE',
    }),
};

// Sessions API
export const sessionsApi = {
  list: () => fetchApi('/api/sessions'),

  get: (id: number) => fetchApi(`/api/sessions/${id}`),

  getMessages: (id: number) => fetchApi(`/api/sessions/${id}/messages`),

  delete: (id: number) =>
    fetchApi(`/api/sessions/${id}`, {
      method: 'DELETE',
    }),
};

// Execute API (SSE)
export function createExecuteEventSource(data: {
  userRequest: string;
  repositoryUrl?: string;
  branch?: string;
  autoCommit?: boolean;
  resumeSessionId?: string;
}) {
  const params = new URLSearchParams();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });

  return new EventSource(`${API_BASE_URL}/api/execute?${params}`, {
    withCredentials: true,
  });
}
