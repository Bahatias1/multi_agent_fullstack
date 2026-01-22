// ai_front/src/pages/Dashboard.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  AgentName,
  clearAuth,
  continueText,
  createNewSession,
  getSessionDetail,
  getSessions,
  getToken,
  getTools,
  orchestrate,
  setSessionId,
  getSessionId,
} from "../api";

type Props = {
  onLogout: () => void;
};

type Role = "user" | "ai";

type ChatMessage = {
  role: Role;
  text: string;
  agent?: string;
};

function parseSessionLine(line: string): ChatMessage {
  const t = (line || "").trim();

  if (t.startsWith("USER:")) {
    return { role: "user", text: t.replace("USER:", "").trim() };
  }

  const aiMatch = t.match(/^AI\((.*?)\):\s*(.*)$/i);
  if (aiMatch) {
    return { role: "ai", agent: aiMatch[1], text: aiMatch[2] };
  }

  if (t.startsWith("AI:")) {
    return { role: "ai", text: t.replace("AI:", "").trim() };
  }

  return { role: "ai", text: t };
}

export default function Dashboard({ onLogout }: Props) {
  const [token] = useState<string>(() => getToken());
  const [sessionId, setSessionIdState] = useState<string>(() => getSessionId());

  const [agent, setAgent] = useState<AgentName>("auto");
  const [language] = useState("français");
  const [maxTokens] = useState(512);

  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<string[]>([]);
  const [tools, setTools] = useState<
    { id: string; name: string; description: string; capabilities: string[] }[]
  >([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const tokenOk = useMemo(() => Boolean(token), [token]);

  useEffect(() => {
    if (!tokenOk) return;

    (async () => {
      setError("");
      setLoading(true);
      try {
        const t = await getTools(token);
        setTools(t.tools || []);

        const list = await getSessions(token);
        setSessions(list.sessions || []);

        // si pas de session existante => en créer une
        if (!sessionId) {
          const s = await createNewSession(token);
          setSessionIdState(s.session_id);
          setSessionId(s.session_id);
        }
      } catch (e: any) {
        setError(e?.message || "Erreur chargement dashboard");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenOk]);

  async function handleNewSession() {
    if (!tokenOk) return;

    setError("");
    setLoading(true);
    try {
      const s = await createNewSession(token);
      setSessionIdState(s.session_id);
      setSessionId(s.session_id);

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
    if (!tokenOk) return;

    setError("");
    setLoading(true);
    try {
      const data = await getSessionDetail(token, id);

      setSessionIdState(data.session_id);
      setSessionId(data.session_id);

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

  async function handleSend() {
    if (!tokenOk) return setError("Token manquant. Reconnecte-toi.");
    if (!prompt.trim()) return setError("Prompt vide.");

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

      setSessionIdState(data.session_id);
      setSessionId(data.session_id);

      const aiMsg: ChatMessage = { role: "ai", text: data.result, agent: data.agent };
      setMessages((prev) => [...prev, aiMsg]);

      const list = await getSessions(token);
      setSessions(list.sessions || []);

      setPrompt("");
    } catch (e: any) {
      setError(e?.message || "Erreur orchestrate");
    } finally {
      setLoading(false);
    }
  }

  async function handleContinue() {
    if (!tokenOk) return setError("Token manquant. Reconnecte-toi.");

    const lastAI = [...messages].reverse().find((m) => m.role === "ai");
    if (!lastAI?.text) return setError("Aucun texte IA à continuer.");

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

      setSessionIdState(data.session_id);
      setSessionId(data.session_id);

      const aiMsg: ChatMessage = { role: "ai", text: data.result };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e: any) {
      setError(e?.message || "Erreur continue");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    clearAuth();
    onLogout();
  }

  return (
    <div style={styles.page}>
      <div style={styles.bgGlow1} />
      <div style={styles.bgGlow2} />

      {/* Navbar */}
      <header style={styles.nav}>
        <div style={styles.brand}>
          <div style={styles.logo}>🧠</div>
          <div>
            <div style={styles.brandName}>Patrick AI</div>
            <div style={styles.brandTag}>Dashboard • Multi-Agent</div>
          </div>
        </div>

        <div style={styles.navActions}>
          <span style={styles.pill}>Session: {sessionId ? sessionId : "—"}</span>
          <button style={styles.btnGhost} onClick={handleNewSession} disabled={loading}>
            + New Session
          </button>
          <button style={styles.btnDanger} onClick={handleLogout} disabled={loading}>
            Logout
          </button>
        </div>
      </header>

      <main style={styles.shell}>
        <div style={styles.grid}>
          {/* LEFT: Agent + Sessions */}
          <div style={styles.panel}>
            <div style={styles.panelTitle}>Agents</div>
            <div style={styles.panelSub}>
              Tu peux changer d’agent quand tu veux, sans perdre l’historique.
            </div>

            <div style={styles.row}>
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

              <span style={styles.pillSmall}>Langue: {language}</span>
              <span style={styles.pillSmall}>Max: {maxTokens}</span>
            </div>

            <div style={{ height: 12 }} />

            <div style={styles.toolsBox}>
              {tools.length === 0 ? (
                <div style={styles.muted}>Aucun tool chargé.</div>
              ) : (
                tools.map((t) => (
                  <div key={t.id} style={styles.toolCard}>
                    <div style={styles.toolTop}>
                      <div style={styles.toolName}>{t.name}</div>
                      <span style={styles.toolId}>{t.id}</span>
                    </div>
                    <div style={styles.toolDesc}>{t.description}</div>
                    <div style={styles.toolCaps}>
                      {(t.capabilities || []).slice(0, 6).map((c) => (
                        <span key={c} style={styles.capPill}>
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ height: 14 }} />

            <div style={styles.panelTitle}>Sessions</div>
            <div style={styles.panelSub}>Clique pour recharger l’historique.</div>

            <div style={styles.sessionsBox}>
              {sessions.length === 0 ? (
                <div style={styles.muted}>Aucune session.</div>
              ) : (
                sessions.map((id) => (
                  <div
                    key={id}
                    style={id === sessionId ? styles.sessionItemActive : styles.sessionItem}
                    onClick={() => handleLoadSession(id)}
                  >
                    {id}
                  </div>
                ))
              )}
            </div>

            {error ? <div style={styles.errorBox}>Erreur: {error}</div> : null}
          </div>

          {/* RIGHT: Chat */}
          <div style={styles.panel}>
            <div style={styles.panelTitle}>Chat</div>
            <div style={styles.panelSub}>Envoie un prompt, l’agent répond dans la même session.</div>

            <div style={styles.chatBox}>
              {messages.length === 0 ? (
                <div style={styles.muted}>Aucun message.</div>
              ) : (
                messages.map((m, idx) => (
                  <div key={idx} style={m.role === "user" ? styles.bubbleUser : styles.bubbleAI}>
                    {m.role === "ai" && m.agent ? (
                      <div style={styles.agentTag}>Agent: {m.agent}</div>
                    ) : null}
                    {m.text}
                  </div>
                ))
              )}
            </div>

            <div style={{ height: 12 }} />

            <textarea
              style={styles.textarea}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
              placeholder="Écris ton prompt ici..."
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleSend();
              }}
            />

            <div style={{ height: 10 }} />

            <div style={styles.row}>
              <button style={styles.btnPrimaryBig} onClick={handleSend} disabled={loading}>
                {loading ? "Envoi..." : "Send"}
              </button>
              <button style={styles.btnGhost} onClick={handleContinue} disabled={loading}>
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
          </div>
        </div>
      </main>
    </div>
  );
}

/* Styles Landing-like */
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    width: "100%",
    background:
      "radial-gradient(900px 500px at 20% 0%, rgba(99,102,241,0.22) 0%, transparent 60%)," +
      "radial-gradient(900px 500px at 80% 10%, rgba(34,211,238,0.12) 0%, transparent 60%)," +
      "linear-gradient(180deg, #060814 0%, #070a12 60%, #05060f 100%)",
    color: "#E5E7EB",
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial",
    position: "relative",
    overflowX: "hidden",
  },

  bgGlow1: {
    position: "absolute",
    top: -120,
    left: -120,
    width: 420,
    height: 420,
    background: "rgba(124,58,237,0.20)",
    filter: "blur(70px)",
    borderRadius: 999,
    pointerEvents: "none",
  },
  bgGlow2: {
    position: "absolute",
    bottom: -140,
    right: -120,
    width: 520,
    height: 520,
    background: "rgba(34,211,238,0.14)",
    filter: "blur(80px)",
    borderRadius: 999,
    pointerEvents: "none",
  },

  nav: {
    width: "min(1200px, calc(100% - 32px))",
    margin: "18px auto 0 auto",
    padding: "14px 16px",
    borderRadius: 18,
    border: "1px solid rgba(148,163,184,0.18)",
    background: "rgba(2,6,23,0.55)",
    backdropFilter: "blur(14px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    position: "sticky",
    top: 12,
    zIndex: 50,
  },

  brand: { display: "flex", alignItems: "center", gap: 12 },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    background: "rgba(99,102,241,0.18)",
    border: "1px solid rgba(99,102,241,0.25)",
  },
  brandName: { fontWeight: 900, fontSize: 14, letterSpacing: 0.2 },
  brandTag: { fontSize: 12, color: "rgba(229,231,235,0.65)" },

  navActions: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" },

  shell: {
    width: "min(1200px, calc(100% - 32px))",
    margin: "22px auto 0 auto",
    paddingBottom: 30,
  },

  grid: {
    width: "100%",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
    gap: 16,
  },

  panel: {
    padding: 16,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    boxShadow: "0 20px 70px rgba(0,0,0,0.45)",
    backdropFilter: "blur(10px)",
    minHeight: 560,
  },

  panelTitle: { fontWeight: 900, fontSize: 18, marginBottom: 6 },
  panelSub: { color: "rgba(255,255,255,0.65)", fontSize: 13, marginBottom: 14 },

  row: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" },

  select: {
    padding: "10px 12px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.20)",
    color: "rgba(255,255,255,0.92)",
    outline: "none",
    cursor: "pointer",
  },

  btnGhost: {
    padding: "10px 14px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.15)",
    color: "rgba(255,255,255,0.88)",
    cursor: "pointer",
    fontWeight: 800,
  },

  btnPrimaryBig: {
    padding: "12px 16px",
    borderRadius: 16,
    border: "1px solid rgba(99,102,241,0.35)",
    background: "rgba(99,102,241,0.95)",
    color: "white",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 13,
  },

  btnDanger: {
    padding: "10px 14px",
    borderRadius: 999,
    border: "1px solid rgba(255, 75, 75, 0.25)",
    background: "rgba(255, 75, 75, 0.12)",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
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

  pillSmall: {
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.18)",
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    fontWeight: 800,
  },

  toolsBox: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    maxHeight: 260,
    overflowY: "auto",
    paddingRight: 6,
  },

  toolCard: {
    padding: 12,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.16)",
  },

  toolTop: { display: "flex", justifyContent: "space-between", gap: 10 },
  toolName: { fontWeight: 900, fontSize: 13 },
  toolId: {
    fontSize: 11,
    fontWeight: 900,
    padding: "4px 8px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.18)",
    color: "rgba(255,255,255,0.70)",
    height: "fit-content",
  },

  toolDesc: { marginTop: 6, fontSize: 12, color: "rgba(255,255,255,0.70)", lineHeight: 1.5 },

  toolCaps: { marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 },

  capPill: {
    fontSize: 11,
    fontWeight: 800,
    padding: "5px 8px",
    borderRadius: 999,
    border: "1px solid rgba(34,211,238,0.20)",
    background: "rgba(34,211,238,0.08)",
    color: "rgba(34,211,238,0.95)",
  },

  sessionsBox: {
    marginTop: 10,
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

  textarea: {
    width: "100%",
    minHeight: 110,
    resize: "vertical",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.20)",
    padding: "10px 12px",
    color: "rgba(255,255,255,0.92)",
    outline: "none",
  },

  errorBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 16,
    border: "1px solid rgba(255, 75, 75, 0.22)",
    background: "rgba(255, 75, 75, 0.10)",
    color: "rgba(255,255,255,0.92)",
    fontSize: 12,
  },

  muted: { color: "rgba(255,255,255,0.55)", fontSize: 12 },
};
