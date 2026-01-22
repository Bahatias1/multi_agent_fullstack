import React, { useEffect, useState } from "react";
import { login, generateText, continueText } from "./api";

type LoginResponse = {
  access_token: string;
  token_type?: string;
};

type GenerateResponse = {
  result: string;
  truncated: boolean;
  session_id: string;
};

export default function App() {
  const [email, setEmail] = useState<string>("test@mail.com");
  const [password, setPassword] = useState<string>("123456");

  const [token, setToken] = useState<string>(localStorage.getItem("token") || "");
  const [prompt, setPrompt] = useState<string>("Dis bonjour en une phrase");
  const [result, setResult] = useState<string>("");

  const [sessionId, setSessionId] = useState<string | null>(
    localStorage.getItem("session_id") || null
  );

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  useEffect(() => {
    if (sessionId) localStorage.setItem("session_id", sessionId);
    else localStorage.removeItem("session_id");
  }, [sessionId]);

  function extractErrorMessage(e: unknown): string {
    if (!e) return "Erreur inconnue";
    if (typeof e === "string") return e;
    if (e instanceof Error) return e.message;

    try {
      return JSON.stringify(e);
    } catch {
      return "Erreur inconnue";
    }
  }

  async function handleLogin() {
    setError("");
    setLoading(true);
    try {
      const data = (await login(email, password)) as LoginResponse;
      setToken(data.access_token);
    } catch (e) {
      setError(extractErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    setError("");
    setLoading(true);
    try {
      const data = (await generateText(
        token,
        prompt,
        "fr",
        80,
        sessionId ?? undefined
      )) as GenerateResponse;

      setResult(data.result);
      setSessionId(data.session_id);
    } catch (e) {
      setError(extractErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleContinue() {
    setError("");
    setLoading(true);
    try {
      const data = (await continueText(
        token,
        result,
        "fr",
        80,
        sessionId ?? undefined
      )) as GenerateResponse;

      setResult((prev) => prev + "\n" + data.result);
      setSessionId(data.session_id);
    } catch (e) {
      setError(extractErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    setToken("");
    setResult("");
    setSessionId(null);
    setError("");
    localStorage.removeItem("token");
    localStorage.removeItem("session_id");
  }

  return (
    <div style={{ padding: 20, fontFamily: "Arial", maxWidth: 800, margin: "0 auto" }}>
      <h2>Patrick AI</h2>

      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />

        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
          type="password"
        />

        <button onClick={handleLogin} disabled={loading}>
          Login
        </button>

        <button onClick={handleLogout} disabled={loading}>
          Logout
        </button>
      </div>

      <div style={{ marginBottom: 10 }}>
        <div>Token: {token ? "✅ OK" : "❌ none"}</div>
        <div>Session ID: {sessionId || "-"}</div>
      </div>

      <textarea
        rows={3}
        style={{ width: "100%", marginBottom: 10 }}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={handleGenerate} disabled={!token || loading}>
          Generate
        </button>

        <button onClick={handleContinue} disabled={!token || loading || !result}>
          Continue
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <pre style={{ marginTop: 15, background: "#111", color: "#0f0", padding: 15, borderRadius: 8 }}>
        {result}
      </pre>
    </div>
  );
}
