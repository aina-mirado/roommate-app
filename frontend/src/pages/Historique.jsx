import React, { useEffect, useState } from "react";
import { Wheat, ShoppingBasket, User, Loader2 } from "lucide-react";
import { getHistorique, imageUrl } from "../api.js";

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAr(n) {
  return `${Math.round(n).toLocaleString("fr-FR").replace(/,/g, " ")} Ar`;
}

function Avatar({ image_path, nom }) {
  return (
    <span className="w-10 h-10 rounded-full overflow-hidden bg-forest-100 flex items-center justify-center shrink-0">
      {image_path ? (
        <img src={imageUrl(image_path)} alt={nom} className="w-full h-full object-cover" />
      ) : (
        <User size={16} className="text-forest-400" />
      )}
    </span>
  );
}

export default function Historique({ refreshTick }) {
  const [data, setData] = useState({ riz: [], depenses: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getHistorique()
      .then(setData)
      .finally(() => setLoading(false));
  }, [refreshTick]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-widest text-grain-600 font-semibold mb-1">Page 3</p>
        <h1 className="font-display text-3xl text-forest-700">Historique d'activité</h1>
        <p className="text-forest-700/60 text-sm mt-1">Toutes les participations, classées par date, les plus récentes en premier.</p>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-forest-700/60 text-sm py-10 justify-center">
          <Loader2 size={18} className="animate-spin" /> Chargement...
        </div>
      )}

      {!loading && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Historique riz */}
          <section className="bg-panel rounded-xl2 shadow-card border border-forest-50 p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-full bg-grain-200 flex items-center justify-center">
                <Wheat size={16} className="text-grain-600" />
              </div>
              <h2 className="font-display text-lg text-forest-700">Riz</h2>
              <span className="ml-auto text-xs text-forest-700/40 font-medium">{data.riz.length} entrée(s)</span>
            </div>

            {data.riz.length === 0 ? (
              <p className="text-sm text-forest-700/50 text-center py-8">Aucun apport de riz enregistré.</p>
            ) : (
              <ul className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {data.riz.map((r) => (
                  <li key={r.id} className="flex items-center gap-3 border-b border-forest-50 pb-3 last:border-0">
                    <Avatar image_path={r.image_path} nom={r.nom} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-forest-700">{r.nom}</p>
                      <p className="text-xs text-forest-700/50">{formatDate(r.date_ajout)}</p>
                    </div>
                    <span className="text-sm font-semibold text-grain-600 shrink-0">{r.kg} kp</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Historique dépenses */}
          <section className="bg-panel rounded-xl2 shadow-card border border-forest-50 p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-full bg-forest-50 flex items-center justify-center">
                <ShoppingBasket size={16} className="text-forest-500" />
              </div>
              <h2 className="font-display text-lg text-forest-700">Dépenses</h2>
              <span className="ml-auto text-xs text-forest-700/40 font-medium">{data.depenses.length} entrée(s)</span>
            </div>

            {data.depenses.length === 0 ? (
              <p className="text-sm text-forest-700/50 text-center py-8">Aucune dépense enregistrée.</p>
            ) : (
              <ul className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {data.depenses.map((d) => (
                  <li key={d.id} className="flex items-start gap-3 border-b border-forest-50 pb-3 last:border-0">
                    <Avatar image_path={d.image_path} nom={d.nom} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-forest-700">{d.nom_produit}</p>
                        <span className="text-sm font-semibold text-forest-500 shrink-0">{formatAr(d.prix)}</span>
                      </div>
                      <p className="text-xs text-forest-700/50">{d.nom} · {formatDate(d.date_ajout)}</p>
                      {d.description && <p className="text-xs text-forest-700/60 mt-0.5 italic">{d.description}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
