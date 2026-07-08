import React, { useEffect, useState } from "react";
import { UserPlus, Wheat, Coins, User, Loader2 } from "lucide-react";
import { getDashboard } from "../api.js";
import { imageUrl } from "../api.js";
import ColocataireModal from "../components/ColocataireModal.jsx";

function formatAr(n) {
  return `${Math.round(n).toLocaleString("fr-FR").replace(/,/g, " ")} Ar`;
}

export default function Dashboard({ refreshTick }) {
  const [soldes, setSoldes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const charger = async () => {
    setLoading(true);
    try {
      const data = await getDashboard();
      setSoldes(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    charger();
  }, [refreshTick]);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-grain-600 font-semibold mb-1">Page 2</p>
          <h1 className="font-display text-3xl text-forest-700">Tableau de bord</h1>
          <p className="text-forest-700/60 text-sm mt-1">
            Le solde le plus bas de chaque catégorie est ramené à zéro ; les autres montrent leur avance.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-forest-700 hover:bg-forest-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-card shrink-0"
        >
          <UserPlus size={16} />
          <span className="hidden sm:inline">Colocataire</span>
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-forest-700/60 text-sm py-10 justify-center">
          <Loader2 size={18} className="animate-spin" /> Chargement...
        </div>
      )}

      {!loading && soldes.length === 0 && (
        <div className="bg-grain-200/40 border border-grain-500/30 rounded-xl2 p-8 text-center">
          <p className="text-forest-700 font-medium">Aucun colocataire enregistré.</p>
          <p className="text-forest-700/60 text-sm mt-1">Ajoutez votre premier colocataire pour démarrer le suivi.</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {soldes.map((s) => (
          <div key={s.colocataire_id} className="bg-panel rounded-xl2 shadow-card border border-forest-50 p-6 animate-rise">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-14 h-14 rounded-full overflow-hidden bg-forest-100 flex items-center justify-center shrink-0 ring-2 ring-forest-50">
                {s.image_path ? (
                  <img src={imageUrl(s.image_path)} alt={s.nom} className="w-full h-full object-cover" />
                ) : (
                  <User size={22} className="text-forest-400" />
                )}
              </span>
              <div>
                <h3 className="font-display text-lg text-forest-700 leading-tight">{s.nom}</h3>
                <p className="text-xs text-forest-700/50">Colocataire</p>
              </div>
            </div>

            <div className="grain-divider rounded-full mb-5" />

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-grain-200 flex items-center justify-center shrink-0 mt-0.5">
                  <Wheat size={16} className="text-grain-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-forest-700/70">Total riz</span>
                    <span className="text-sm font-semibold text-forest-700">{s.total_riz_kg} kp</span>
                  </div>
                  <p className={`text-xs mt-0.5 ${s.solde_riz > 0 ? "text-grain-600 font-medium" : "text-forest-700/40"}`}>
                    {s.message_riz}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-forest-50 flex items-center justify-center shrink-0 mt-0.5">
                  <Coins size={16} className="text-forest-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-forest-700/70">Total dépenses</span>
                    <span className="text-sm font-semibold text-forest-700">{formatAr(s.total_argent)}</span>
                  </div>
                  <p className={`text-xs mt-0.5 ${s.solde_argent > 0 ? "text-berry-500 font-medium" : "text-forest-700/40"}`}>
                    {s.message_argent}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ColocataireModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={charger} />
    </div>
  );
}
