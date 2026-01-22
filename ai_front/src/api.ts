const API_URL = "http://127.0.0.1:8000";

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function generateText(
  token: string,
  prompt: string,
  language: string,
  max_tokens: number,
  session_id?: string | null
) {
  const res = await fetch(`${API_URL}/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ prompt, language, max_tokens, session_id }),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function continueText(
  token: string,
  last_output: string,
  language: string,
  max_tokens: number,
  session_id?: string | null
) {
  const res = await fetch(`${API_URL}/continue`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ last_output, language, max_tokens, session_id }),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
