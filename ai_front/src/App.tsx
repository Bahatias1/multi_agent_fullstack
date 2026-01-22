import React, { useState } from "react";
import Landing from "./pages/Landing";
import Console from "./pages/Console";

export default function App() {
  const [page, setPage] = useState<"landing" | "console">("landing");

  if (page === "landing") {
    return <Landing onOpenConsole={() => setPage("console")} />;
  }

  return <Console onBack={() => setPage("landing")} />;
}
