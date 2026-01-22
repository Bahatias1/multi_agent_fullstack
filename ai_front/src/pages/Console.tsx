import React, { useMemo, useState } from "react";
import {
  AgentName,
  clearAuth,
  continueText,
  createNewSession,
  generateText,
  getSessionDetail,
  getSessionId,
  getSessions,
  getToken,
  login,
  orchestrate,
  setSessionId,
  setToken,
} from "../api";

type Props = {
  onBack: () => void;
};

type Role = "user" | "ai";

type ChatMessage = {
  role: Role;
  text: string;
  agent?: string; // ✅ pour afficher quel agent a répondu
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    width: "100%",
    padding: "22px 18px 40px",
  },
  shell: {
    maxWidth: 1200,
    margin: "0 auto",
  },
  topbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 16px",
    borderRadius: 18,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.10)",
    boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
    backdropFilter: "blur(10px)",
  },
  left: { display: "flex", alignItems: "center", gap: 12 },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    background:
      "linear-gradient(135deg, rgba(109,124,255,0.9), rgba(43,212,255,0.45))",
    border: "1px solid rgba(255,255,255,0.16)",
  },
  title: { fontWeight: 900 },
  sub: { color: "rgba(255,255,255,0.65)", fontSize: 13 },

  btnGhost: {
    padding: "10px 14px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.15)",
    color: "rgba(255,255,255,0.88)",
    cursor: "pointer",
  },

  grid: {
    width: "100%",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
    gap: 16,
    marginTop: 18,
  },

  panel: {
    padding: 16,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    boxShadow: "0 20px 70px rgba(0,0,0,0.45)",
    backdropFilter: "blur(10px)",
    minHeight: 520,
  },

  panelTitle: { fontWeight: 900, fontSize: 18, marginBottom: 6 },
  panelSub: { color: "rgba(255,255,255,0.65)", fontSize: 13, marginBottom: 14 },

  input: {
    width: "100%",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.20)",
    padding: "10px 12px",
    color: "rgba(255,255,255,0.92)",
    outline: "none",
    marginBottom: 10,
  },

  row: { display: "flex", gap: 10, flexWrap: "wrap" },

  btnPrimary: {
    padding: "10px 14px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.14)",
    background:
      "linear-gradient(135deg, rgba(109,124,255,0.95), rgba(109,124,255,0.55))",
    color: "white",
    fontWeight: 800,
    cursor: "pointer",
  },

  btnDanger: {
    padding: "10px 14px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255, 75, 75, 0.14)",
    color: "rgba(255,255,255,0.92)",
    fontWeight: 800,
    cursor: "pointer",
  },

  badgeOk: {
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(46, 204, 113, 0.12)",
    border: "1px solid rgba(46, 204, 113, 0.20)",
    color: "rgba(46, 204, 113, 0.95)",
    fontSize: 12,
    fontWeight: 900,
  },
  badgeNo: {
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(255, 75, 75, 0.12)",
    border: "1px solid rgba(255, 75, 75, 0.20)",
    color: "rgba(255, 75, 75, 0.95)",
    fontSize: 12,
    fontWeight: 900,
  },

  pill: {
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.18)",
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    fontWeight: 800,
  },

  select: {
    padding: "10px 12px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.20)",
    color: "rgba(255,255,255,0.92)",
    outline: "none",
    cursor: "pointer",
  },

  chatBox: {
    height: 340,
    overflowY: "auto",
    padding: 12,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.18)",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  bubbleUser: {
    alignSelf: "flex-end",
    maxWidth: "85%",
    padding: "10px 12px",
    borderRadius: 16,
    borderTopRightRadius: 6,
    background: "rgba(109,124,255,0.16)",
    border: "1px solid rgba(109,124,255,0.25)",
  },

  bubbleAI: {
    alignSelf: "flex-start",
    maxWidth: "85%",
    padding: "10px 12px",
    borderRadius: 16,
    borderTopLeftRadius: 6,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
  },

  agentTag: {
    display: "inline-block",
    marginBottom: 6,
    fontSize: 11,
    fontWeight: 900,
    padding: "4px 8px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.18)",
    color: "rgba(255,255,255,0.75)",
  },

  meta: {
    marginTop: 10,
    color: "rgba(255,255,255,0.65)",
    fontSize: 12,
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
  },

  textarea: {
    width: "100%",
    minHeight: 120,
    resize: "vertical",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.20)",
    padding: "10px 12px",
    color: "rgba(255,255,255,0.92)",
    outline: "none",
  },

  error: {
    marginTop: 10,
    padding: 12,
    borderRadius: 16,
    border: "1px solid rgba(255, 75, 75, 0.22)",
    background: "rgba(255, 75, 75, 0.10)",
    color: "rgba(255,255,255,0.92)",
  },

  sessionsBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.18)",
    maxHeight: 180,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  sessionItem: {
    padding: "8px 10px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    cursor: "pointer",
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    wordBreak: "break-all",
  },

  sessionItemActive: {
    padding: "8px 10px",
    borderRadius: 14,
    border: "1px solid rgba(109,124,255,0.25)",
    background: "rgba(109,124,255,0.12)",
    cursor: "pointer",
    fontSize: 12,
    color: "rgba(255,255,255,0.92)",
    wordBreak: "break-all",
    fontWeight: 900,
  },
};

function parseSessionLine(line: string): ChatMessage {
  const t = (line || "").trim();

  if (t.startsWith("USER:")) {
    return { role: "user", text: t.replace("USER:", "").trim() };
  }

  // Exemple: AI(backend): ....
  const aiMatch = t.match(/^AI\((.*?)\):\s*(.*)$/i);
  if (aiMatch) {
    return { role: "ai", agent: aiMatch[1], text: aiMatch[2] };
  }

  if (t.startsWith("AI:")) {
    return { role: "ai", text: t.replace("AI:", "").trim() };
  }

  return { role: "ai", text: t };
}

export default function Console({ onBack }: Props) {
  const [email, setEmail] = useState("test@mail.com");
  const [password, setPassword] = useState("12345");

  const [token, setTokenState] = useState<string>(() => getToken());
  const [sessionId, setSessionIdState] = useState<string>(() => getSessionId());

  const [language] = useState("français");
  const [maxTokens] = useState(512);

  const [agent, setAgent] = useState<AgentName>("auto");

  const [prompt, setPrompt] = useState("Dis bonjour en une phrase");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const [sessions, setSessions] = useState<string[]>([]);
  const [error, setError] = useState<string>("");

  const tokenOk = useMemo(() => Boolean(token), [token]);

  async function handleLogin() {
    setError("");
    setLoading(true);
    try {
      const data = await login(email, password);

      setToken(data.access_token);
      setTokenState(data.access_token);

      const sid = data.session_id || "";
      setSessionId(sid);
      setSessionIdState(sid);

      const list = await getSessions(data.access_token);
      setSessions(list.sessions || []);
    } catch (e: any) {
      setError(e?.message || "Erreur login");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    clearAuth();
    setTokenState("");
    setSessionIdState("");
    setMessages([]);
    setSessions([]);
    setError("");
  }

  async function handleGenerate() {
    if (!token) {
      setError("Connecte-toi d’abord (token manquant).");
      return;
    }
    if (!prompt.trim()) {
      setError("Prompt vide.");
      return;
    }

    setError("");
    setLoading(true);

    const userMsg: ChatMessage = { role: "user", text: prompt.trim() };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const data = await generateText(
        token,
        prompt.trim(),
        language,
        maxTokens,
        sessionId || null
      );

      setSessionId(data.session_id);
      setSessionIdState(data.session_id);

      const aiMsg: ChatMessage = { role: "ai", text: data.result };
      setMessages((prev) => [...prev, aiMsg]);

      const list = await getSessions(token);
      setSessions(list.sessions || []);
    } catch (e: any) {
      setError(e?.message || "Erreur génération");
    } finally {
      setLoading(false);
    }
  }

  async function handleOrchestrate() {
    if (!token) {
      setError("Connecte-toi d’abord (token manquant).");
      return;
    }
    if (!prompt.trim()) {
      setError("Prompt vide.");
      return;
    }

    setError("");
    setLoading(true);

    const userMsg: ChatMessage = { role: "user", text: prompt.trim() };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const data = await orchestrate(
        token,
        prompt.trim(),
        agent,
        language,
        maxTokens,
        sessionId || null
      );

      setSessionId(data.session_id);
      setSessionIdState(data.session_id);

      const aiMsg: ChatMessage = {
        role: "ai",
        text: data.result,
        agent: data.agent,
      };
      setMessages((prev) => [...prev, aiMsg]);

      const list = await getSessions(token);
      setSessions(list.sessions || []);
    } catch (e: any) {
      setError(e?.message || "Erreur orchestrate");
    } finally {
      setLoading(false);
    }
  }

  async function handleContinue() {
    if (!token) {
      setError("Connecte-toi d’abord (token manquant).");
      return;
    }

    const lastAI = [...messages].reverse().find((m) => m.role === "ai");
    if (!lastAI?.text) {
      setError("Aucun texte IA à continuer.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const data = await continueText(
        token,
        lastAI.text,
        language,
        maxTokens,
        sessionId || null
      );

      setSessionId(data.session_id);
      setSessionIdState(data.session_id);

      const aiMsg: ChatMessage = { role: "ai", text: data.result };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e: any) {
      setError(e?.message || "Erreur continue");
    } finally {
      setLoading(false);
    }
  }

  async function handleRefreshSessions() {
    if (!token) return;
    setError("");
    setLoading(true);
    try {
      const list = await getSessions(token);
      setSessions(list.sessions || []);
    } catch (e: any) {
      setError(e?.message || "Erreur sessions");
    } finally {
      setLoading(false);
    }
  }

  async function handleNewSession() {
    if (!token) {
      setError("Connecte-toi d’abord.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const data = await createNewSession(token);

      setSessionId(data.session_id);
      setSessionIdState(data.session_id);

      setMessages([]);

      const list = await getSessions(token);
      setSessions(list.sessions || []);
    } catch (e: any) {
      setError(e?.message || "Erreur new session");
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadSession(id: string) {
    if (!token) return;

    setError("");
    setLoading(true);
    try {
      const data = await getSessionDetail(token, id);

      setSessionId(data.session_id);
      setSessionIdState(data.session_id);

      const chat: ChatMessage[] = (data.messages || [])
        .map(parseSessionLine)
        .filter((m) => Boolean(m.text));

      setMessages(chat);
    } catch (e: any) {
      setError(e?.message || "Erreur load session");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.topbar}>
          <div style={styles.left}>
            <div style={styles.logo}>🧠</div>
            <div>
              <div style={styles.title}>Patrick AI Console</div>
              <div style={styles.sub}>
                Auth • Generate • Orchestrate • Sessions
              </div>
            </div>
          </div>

          <button style={styles.btnGhost} onClick={onBack}>
            ← Back to Landing
          </button>
        </div>

        <div style={styles.grid}>
          {/* LOGIN + SESSIONS PANEL */}
          <div style={styles.panel}>
            <div style={styles.panelTitle}>Connexion</div>
            <div style={styles.panelSub}>
              Connecte-toi pour obtenir ton token et utiliser l’API.
            </div>

            <input
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              disabled={loading}
            />

            <input
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              type="password"
              disabled={loading}
            />

            <div style={styles.row}>
              <button
                style={styles.btnPrimary}
                onClick={handleLogin}
                disabled={loading}
              >
                Login
              </button>
              <button
                style={styles.btnDanger}
                onClick={handleLogout}
                disabled={loading}
              >
                Logout
              </button>
            </div>

            <div style={styles.meta}>
              <span>Token:</span>
              <span style={tokenOk ? styles.badgeOk : styles.badgeNo}>
                {tokenOk ? "✅ OK" : "❌ NO"}
              </span>

              <span>Session:</span>
              <span style={styles.pill}>{sessionId ? sessionId : "—"}</span>
            </div>

            <div style={{ height: 10 }} />

            <div style={styles.row}>
              <button
                style={styles.btnPrimary}
                onClick={handleNewSession}
                disabled={loading || !tokenOk}
              >
                + New Session
              </button>
              <button
                style={styles.btnGhost}
                onClick={handleRefreshSessions}
                disabled={loading || !tokenOk}
              >
                Refresh Sessions
              </button>
            </div>

            <div style={{ height: 10 }} />

            <div style={styles.panelTitle}>Sessions</div>
            <div style={styles.panelSub}>
              Clique sur une session pour charger l’historique.
            </div>

            <div style={styles.sessionsBox}>
              {sessions.length === 0 ? (
                <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>
                  Aucune session pour le moment.
                </div>
              ) : (
                sessions.map((id) => (
                  <div
                    key={id}
                    style={
                      id === sessionId
                        ? styles.sessionItemActive
                        : styles.sessionItem
                    }
                    onClick={() => handleLoadSession(id)}
                  >
                    {id}
                  </div>
                ))
              )}
            </div>

            {error && <div style={styles.error}>Erreur: {error}</div>}
          </div>

          {/* CHAT PANEL */}
          <div style={styles.panel}>
            <div style={styles.panelTitle}>Génération</div>
            <div style={styles.panelSub}>
              Écris un prompt, choisis un agent, puis lance <b>Orchestrate</b>.
            </div>

            <div style={styles.meta}>
              <span style={styles.pill}>Langue: {language}</span>
              <span style={styles.pill}>Max tokens: {maxTokens}</span>
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 12 }}>
                Agent:
              </span>
              <select
                style={styles.select}
                value={agent}
                onChange={(e) => setAgent(e.target.value as AgentName)}
                disabled={loading}
              >
                <option value="auto">auto</option>
                <option value="backend">backend</option>
                <option value="frontend">frontend</option>
                <option value="devops">devops</option>
                <option value="writer">writer</option>
              </select>
            </div>

            <textarea
              style={styles.textarea}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                  handleOrchestrate();
                }
              }}
            />

            <div style={{ height: 10 }} />

            <div style={styles.row}>
              <button
                style={styles.btnPrimary}
                onClick={handleOrchestrate}
                disabled={loading}
              >
                Orchestrate
              </button>
              <button
                style={styles.btnGhost}
                onClick={handleGenerate}
                disabled={loading}
              >
                Generate (classic)
              </button>
              <button
                style={styles.btnGhost}
                onClick={handleContinue}
                disabled={loading}
              >
                Continue
              </button>
              <button
                style={styles.btnDanger}
                onClick={() => setMessages([])}
                disabled={loading}
              >
                Clear
              </button>
            </div>

            <div style={{ height: 14 }} />

            <div style={styles.chatBox}>
              {messages.length === 0 ? (
                <div style={{ color: "rgba(255,255,255,0.55)" }}>
                  Aucun résultat pour le moment.
                </div>
              ) : (
                messages.map((m, idx) => (
                  <div
                    key={idx}
                    style={m.role === "user" ? styles.bubbleUser : styles.bubbleAI}
                  >
                    {m.role === "ai" && m.agent ? (
                      <div style={styles.agentTag}>Agent: {m.agent}</div>
                    ) : null}
                    {m.text}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
