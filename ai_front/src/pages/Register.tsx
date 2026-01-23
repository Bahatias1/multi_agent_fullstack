// ai_front/src/pages/Register.tsx
import React, { useState } from "react";
import { login, register, setToken, updateProfile } from "../api";

type Props = {
  onBack: () => void;
  onGoLogin: () => void;
  onRegistered: () => void;
};

export default function Register({ onBack, onGoLogin, onRegistered }: Props) {
  const [email, setEmail] = useState("test@mail.com");
  const [password, setPassword] = useState("12345");
  const [confirmPassword, setConfirmPassword] = useState("12345");

  const [service, setService] = useState<"auto" | "backend" | "frontend" | "devops" | "writer">(
    "auto"
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setError("");

    if (!email.trim()) return setError("Email obligatoire.");
    if (!password.trim()) return setError("Mot de passe obligatoire.");
    if (password.length < 4) return setError("Mot de passe trop court (min 4).");
    if (password !== confirmPassword) return setError("Les mots de passe ne correspondent pas.");

    setLoading(true);
    try {
      // 1) register
      await register(email.trim(), password, service);

      // 2) auto-login
      const data = await login(email.trim(), password);
      setToken(data.access_token);

      // ✅ PHASE 4 : sauvegarder le service par défaut dans le profil
      await updateProfile(data.access_token, service);

      onRegistered();
    } catch (e: any) {
      setError(e?.message || "Erreur inscription");
    } finally {
      setLoading(false);
    }
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
            <div style={styles.brandTag}>Multi-Agent Platform</div>
          </div>
        </div>

        <div style={styles.navActions}>
          <button style={styles.btnGhost} onClick={onGoLogin} disabled={loading}>
            J’ai déjà un compte
          </button>
          <button style={styles.btnGhost} onClick={onBack} disabled={loading}>
            ← Retour
          </button>
        </div>
      </header>

      {/* Content */}
      <main style={styles.shell}>
        <div style={styles.grid}>
          <div style={styles.left}>
            <div style={styles.pill}>
              <span style={styles.pillDot} />
              Inscription • Profil • Multi-Agent
            </div>

            <h1 style={styles.h1}>
              Crée ton espace <span style={styles.gradText}>Multi-Agent</span>.
            </h1>

            <p style={styles.lead}>
              Inscris-toi pour accéder au dashboard, garder ton historique, et changer d’agent à tout
              moment sans perdre tes conversations.
            </p>

            <div style={styles.miniStats}>
              <div style={styles.statCard}>
                <div style={styles.statValue}>Profil</div>
                <div style={styles.statLabel}>Préférence agent</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statValue}>Sessions</div>
                <div style={styles.statLabel}>Historique sauvegardé</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statValue}>Agents</div>
                <div style={styles.statLabel}>Backend • Frontend • DevOps</div>
              </div>
            </div>
          </div>

          <div style={styles.right}>
            <div style={styles.card}>
              <div style={styles.cardTop}>
                <div>
                  <div style={styles.cardTitle}>Créer un compte</div>
                  <div style={styles.cardSub}>
                    Inscription réelle (backend) + login automatique
                  </div>
                </div>
                <div style={styles.liveChip}>LIVE</div>
              </div>

              <div style={{ height: 12 }} />

              <label style={styles.label}>Email</label>
              <input
                style={styles.input}
                placeholder="ex: test@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />

              <label style={styles.label}>Mot de passe</label>
              <input
                style={styles.input}
                placeholder="********"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />

              <label style={styles.label}>Confirmer mot de passe</label>
              <input
                style={styles.input}
                placeholder="********"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />

              <label style={styles.label}>Service (agent par défaut)</label>
              <select
                style={styles.select}
                value={service}
                onChange={(e) =>
                  setService(e.target.value as "auto" | "backend" | "frontend" | "devops" | "writer")
                }
                disabled={loading}
              >
                <option value="auto">auto</option>
                <option value="backend">backend</option>
                <option value="frontend">frontend</option>
                <option value="devops">devops</option>
                <option value="writer">writer</option>
              </select>

              {error ? <div style={styles.errorBox}>Erreur: {error}</div> : null}

              <div style={{ height: 14 }} />

              <div style={styles.row}>
                <button style={styles.btnPrimaryBig} onClick={handleSubmit} disabled={loading}>
                  {loading ? "Création..." : "Créer mon compte"}
                </button>
                <button style={styles.btnSoft} onClick={onGoLogin} disabled={loading}>
                  Se connecter
                </button>
              </div>

              <div style={styles.cardFooter}>
                Après inscription, tu arrives directement dans le dashboard.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* Styles (Landing-like) */
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

  btnGhost: {
    padding: "10px 12px",
    borderRadius: 14,
    border: "1px solid rgba(148,163,184,0.18)",
    background: "transparent",
    color: "#E5E7EB",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 12,
  },

  shell: {
    width: "min(1200px, calc(100% - 32px))",
    margin: "22px auto 0 auto",
    paddingBottom: 30,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
    gap: 18,
    alignItems: "start",
  },

  left: { padding: "10px 6px" },

  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 999,
    border: "1px solid rgba(148,163,184,0.18)",
    background: "rgba(2,6,23,0.55)",
    fontSize: 12,
    color: "rgba(229,231,235,0.78)",
    marginBottom: 14,
  },
  pillDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    background: "rgba(34,211,238,0.9)",
    boxShadow: "0 0 18px rgba(34,211,238,0.35)",
  },

  h1: {
    fontSize: 40,
    lineHeight: 1.05,
    margin: 0,
    letterSpacing: -1,
    fontWeight: 950,
  },
  gradText: {
    background: "linear-gradient(90deg, rgba(99,102,241,1), rgba(34,211,238,1))",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  lead: {
    marginTop: 14,
    marginBottom: 18,
    color: "rgba(229,231,235,0.68)",
    fontSize: 14,
    lineHeight: 1.6,
    maxWidth: 560,
  },

  miniStats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: 12,
  },
  statCard: {
    borderRadius: 18,
    border: "1px solid rgba(148,163,184,0.16)",
    background: "rgba(2,6,23,0.55)",
    padding: 14,
  },
  statValue: { fontWeight: 950, marginBottom: 6 },
  statLabel: { fontSize: 12, color: "rgba(229,231,235,0.65)" },

  right: { display: "flex", justifyContent: "center" },

  card: {
    width: "100%",
    maxWidth: 520,
    borderRadius: 22,
    border: "1px solid rgba(148,163,184,0.18)",
    background: "rgba(2,6,23,0.55)",
    boxShadow: "0 30px 90px rgba(0,0,0,0.55)",
    padding: 16,
  },

  cardTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    paddingBottom: 12,
    borderBottom: "1px solid rgba(148,163,184,0.14)",
  },

  cardTitle: { fontSize: 16, fontWeight: 950 },
  cardSub: { marginTop: 6, fontSize: 12, color: "rgba(229,231,235,0.65)" },

  liveChip: {
    fontSize: 11,
    fontWeight: 900,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(34,211,238,0.25)",
    background: "rgba(34,211,238,0.10)",
    color: "rgba(34,211,238,0.95)",
    height: "fit-content",
  },

  label: {
    display: "block",
    marginTop: 12,
    marginBottom: 6,
    fontSize: 12,
    color: "rgba(229,231,235,0.72)",
    fontWeight: 800,
  },

  input: {
    width: "100%",
    borderRadius: 14,
    border: "1px solid rgba(148,163,184,0.14)",
    background: "rgba(2,6,23,0.55)",
    padding: "12px 12px",
    color: "rgba(229,231,235,0.92)",
    outline: "none",
    fontSize: 13,
  },

  select: {
    width: "100%",
    borderRadius: 14,
    border: "1px solid rgba(148,163,184,0.14)",
    background: "rgba(2,6,23,0.55)",
    padding: "12px 12px",
    color: "rgba(229,231,235,0.92)",
    outline: "none",
    fontSize: 13,
    cursor: "pointer",
  },

  row: { display: "flex", gap: 12, flexWrap: "wrap", marginTop: 14 },

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

  btnSoft: {
    padding: "12px 16px",
    borderRadius: 16,
    border: "1px solid rgba(148,163,184,0.18)",
    background: "rgba(2,6,23,0.55)",
    color: "#E5E7EB",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 13,
  },

  cardFooter: {
    marginTop: 14,
    paddingTop: 12,
    borderTop: "1px solid rgba(148,163,184,0.12)",
    fontSize: 12,
    color: "rgba(229,231,235,0.60)",
    lineHeight: 1.5,
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
};
