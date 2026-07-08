import React, { useState, useCallback } from "react";
import Sidebar from "./components/Sidebar.jsx";
import Ajout from "./pages/Ajout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Historique from "./pages/Historique.jsx";

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [refreshTick, setRefreshTick] = useState(0);

  // Déclenche un rafraîchissement global des données après un ajout
  const triggerRefresh = useCallback(() => setRefreshTick((t) => t + 1), []);

  return (
    <div className="min-h-screen bg-canvas text-ink font-body flex flex-col md:flex-row">
      <Sidebar page={page} setPage={setPage} />

      <main className="flex-1 pb-24 md:pb-0 md:ml-64">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-10">
          {page === "ajout" && <Ajout onChanged={triggerRefresh} />}
          {page === "dashboard" && <Dashboard refreshTick={refreshTick} />}
          {page === "historique" && <Historique refreshTick={refreshTick} onChanged={triggerRefresh} />}
        </div>
      </main>
    </div>
  );
}
