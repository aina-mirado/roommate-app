import React from "react";
import { PlusCircle, LayoutGrid, History, Wheat } from "lucide-react";

const NAV_ITEMS = [
  { key: "dashboard", label: "Tableau de bord", icon: LayoutGrid },
  { key: "ajout", label: "Ajouter", icon: PlusCircle },
  { key: "historique", label: "Historique", icon: History },
];

export default function Sidebar({ page, setPage }) {
  return (
    <>
      {/* Sidebar desktop */}
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-64 bg-forest-700 text-white px-6 py-8">
        <div className="flex items-center gap-2 mb-12">
          <div className="w-10 h-10 rounded-full bg-grain-500 flex items-center justify-center shadow-soft">
            <Wheat size={20} className="text-forest-700" />
          </div>
          <div>
            <p className="font-display text-lg leading-tight">Coloc Manager</p>
            <p className="text-[11px] uppercase tracking-wider text-forest-100/70">Foyer partagé</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setPage(key)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl2 text-sm font-medium transition-all
                ${page === key
                  ? "bg-forest-500 text-white shadow-soft"
                  : "text-forest-100/80 hover:bg-forest-600 hover:text-white"}`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-white/10">
          <p className="text-xs text-forest-100/60 leading-relaxed">
            Chaque grain compte. Suivez le riz et les dépenses de la colocation en toute transparence.
          </p>
        </div>
      </aside>

      {/* Header mobile */}
      <header className="md:hidden flex items-center gap-2 bg-forest-700 text-white px-5 py-4 sticky top-0 z-20 shadow-soft">
        <div className="w-8 h-8 rounded-full bg-grain-500 flex items-center justify-center">
          <Wheat size={16} className="text-forest-700" />
        </div>
        <p className="font-display text-base">Coloc Manager</p>
      </header>

      {/* Bottom nav mobile */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-forest-700 border-t border-white/10 flex justify-around px-2 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setPage(key)}
            className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl2 text-[11px] font-medium transition-colors
              ${page === key ? "text-grain-400" : "text-forest-100/70"}`}
          >
            <Icon size={20} />
            {label}
          </button>
        ))}
      </nav>
    </>
  );
}
