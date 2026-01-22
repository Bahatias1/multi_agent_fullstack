// ai_front/src/App.tsx
import React, { useState } from "react";
import Landing from "./pages/Landing";
import Console from "./pages/Console";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

type Page = "landing" | "register" | "login" | "dashboard" | "console";

export default function App() {
  const [page, setPage] = useState<Page>("landing");

  if (page === "landing") {
    return (
      <Landing
        onOpenConsole={() => setPage("console")}
        onGetStarted={() => setPage("register")}
      />
    );
  }

  if (page === "console") {
    return <Console onBack={() => setPage("landing")} />;
  }

  if (page === "register") {
    return (
      <Register
        onBack={() => setPage("landing")}
        onGoLogin={() => setPage("login")}
        onRegistered={() => setPage("dashboard")}
      />
    );
  }

  if (page === "login") {
    return (
      <Login
        onBack={() => setPage("landing")}
        onGoRegister={() => setPage("register")}
        onLoggedIn={() => setPage("dashboard")}
      />
    );
  }

  // ✅ Dashboard réel
  if (page === "dashboard") {
    return <Dashboard onLogout={() => setPage("landing")} />;
  }

  return null;
}
