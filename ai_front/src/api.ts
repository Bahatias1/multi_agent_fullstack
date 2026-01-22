/// <reference types="vite/client" />

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

const TOKEN_KEY = "ai_token";
const SESSION_KEY = "ai_session_id";

async function parseError(res: Response) {
  const txt = await res.text();
  try {
    const j = JSON.parse(txt);
    return j.detail || j.message || txt;
  } catch {
    return txt || `Erreur HTTP ${res.status}`;
  }
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, options);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getSessionId() {
  return localStorage.getItem(SESSION_KEY) || "";
}

export function setSessionId(sessionId: string) {
  localStorage.setItem(SESSION_KEY, sessionId);
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);
}

export type LoginResponse = {
  access_token: string;
  token_type: string;
  session_id?: string;
};

export type GenerateResponse = {
  result: string;
  truncated: boolean;
  session_id: string;
};

export type SessionsListResponse = {
  sessions: string[];
};

export type SessionDetailResponse = {
  session_id: string;
  messages: string[];
};

export async function login(email: string, password: string): Promise<LoginResponse> {
  return apiFetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

export async function generateText(
  token: string,
  prompt: string,
  language: string,
  max_tokens: number,
  session_id?: string | null
): Promise<GenerateResponse> {
  return apiFetch("/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ prompt, language, max_tokens, session_id }),
  });
}

export async function continueText(
  token: string,
  last_output: string,
  language: string,
  max_tokens: number,
  session_id?: string | null
): Promise<GenerateResponse> {
  return apiFetch("/continue", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ last_output, language, max_tokens, session_id }),
  });
}

/* =========================
   ✅ SESSIONS ACTIONS
   ========================= */

export async function createNewSession(token: string): Promise<{ session_id: string }> {
  return apiFetch("/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getSessions(token: string): Promise<SessionsListResponse> {
  return apiFetch("/sessions", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getSessionDetail(
  token: string,
  sessionId: string
): Promise<SessionDetailResponse> {
  return apiFetch(`/sessions/${sessionId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/* =========================
   ✅ ORCHESTRATE (AGENTS)
   ========================= */

export type AgentName = "auto" | "backend" | "frontend" | "devops" | "writer";

export type OrchestrateResponse = {
  agent: string;
  result: string;
  truncated: boolean;
  session_id: string;
};

export async function orchestrate(
  token: string,
  prompt: string,
  agent: AgentName,
  language: string,
  max_tokens: number,
  session_id?: string | null
): Promise<OrchestrateResponse> {
  return apiFetch("/orchestrate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ prompt, agent, language, max_tokens, session_id }),
  });
}

/* =========================
   ✅ TOOLS
   ========================= */

export type Tool = {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
};

export async function getTools(token: string): Promise<{ tools: Tool[] }> {
  return apiFetch("/tools", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/* =========================
   ✅ FILES ACTIONS
   ========================= */

export type CreateFileResponse = {
  ok: boolean;
  path: string;
};

export type ListFilesResponse = {
  files: string[];
};

export async function createFile(
  token: string,
  path: string,
  content: string
): Promise<CreateFileResponse> {
  return apiFetch("/files/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ path, content }),
  });
}

export async function listFiles(token: string): Promise<ListFilesResponse> {
  return apiFetch("/files", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
