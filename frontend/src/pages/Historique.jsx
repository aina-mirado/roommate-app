import React, { useEffect, useMemo, useState } from "react";
import { Wheat, ShoppingBasket, User, Loader2, Trash2, Check, X, Filter, RotateCcw } from "lucide-react";
import { getHistorique, getColocataires, deleteRiz, deleteDepense, imageUrl } from "../api.js";

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

// Vérifie si une date ISO tombe dans l'intervalle [from, to] (bornes incluses, jour entier)
function dansIntervalle(iso, from, to) {
  const date = new Date(iso);
  if (from) {
    const start = new Date(from);
    start.setHours(0, 0, 0, 0);
    if (date < start) return false;
  }
  if (to) {
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    if (date > end) return false;
  }
  return true;
}

// Petit bouton de suppression avec confirmation en deux temps (pas de popup native)
function DeleteButton({ onConfirm }) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <span className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={onConfirm}
          className="w-7 h-7 rounded-full bg-berry-500 hover:bg-berry-600 text-white flex items-center justify-center"
          title="Confirmer la suppression"
        >
          <Check size={14} />
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="w-7 h-7 rounded-full bg-forest-50 hover:bg-forest-100 text-forest-700 flex items-center justify-center"
          title="Annuler"
        >
          <X size={14} />
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="w-7 h-7 rounded-full text-forest-700/30 hover:text-berry-500 hover:bg-berry-500/10 flex items-center justify-center transition-colors shrink-0"
      title="Annuler cet ajout"
    >
      <Trash2 size={14} />
    </button>
  );
}

export default function Historique({ refreshTick, onChanged }) {
  const [data, setData] = useState({ riz: [], depenses: [] });
  const [colocataires, setColocataires] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- filtres ---
  const [filtreColoc, setFiltreColoc] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const charger = async () => {
    setLoading(true);
    try {
      const [hist, colocs] = await Promise.all([getHistorique(), getColocataires()]);
      setData(hist);
      setColocataires(colocs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    charger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTick]);

  const rizFiltre = useMemo(() => {
    return data.riz.filter((r) => {
      if (filtreColoc !== "all" && String(r.colocataire_id) !== String(filtreColoc)) return false;
      return dansIntervalle(r.date_ajout, dateFrom, dateTo);
    });
  }, [data.riz, filtreColoc, dateFrom, dateTo]);

  const depensesFiltrees = useMemo(() => {
    return data.depenses.filter((d) => {
      if (filtreColoc !== "all" && String(d.colocataire_id) !== String(filtreColoc)) return false;
      return dansIntervalle(d.date_ajout, dateFrom, dateTo);
    });
  }, [data.depenses, filtreColoc, dateFrom, dateTo]);

  const reinitialiserFiltres = () => {
    setFiltreColoc("all");
    setDateFrom("");
    setDateTo("");
  };

  const filtresActifs = filtreColoc !== "all" || dateFrom || dateTo;

  const annulerRiz = async (id) => {
    await deleteRiz(id);
    await charger();
    onChanged?.();
  };

  const annulerDepense = async (id) => {
    await deleteDepense(id);
    await charger();
    onChanged?.();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-forest-700">Historique d'activité</h1>
        <p className="text-forest-700/60 text-sm mt-1">Toutes les participations, classées par date, les plus récentes en premier.</p>
      </div>

      {/* Barre de filtres */}
      <div className="bg-panel rounded-xl2 shadow-card border border-forest-50 p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={15} className="text-forest-500" />
          <span className="text-sm font-medium text-forest-700">Filtrer l'historique</span>
          {filtresActifs && (
            <button
              onClick={reinitialiserFiltres}
              className="ml-auto flex items-center gap-1 text-xs text-forest-700/50 hover:text-forest-700"
            >
              <RotateCcw size={13} /> Réinitialiser
            </button>
          )}
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-forest-700/70 mb-1">Colocataire</label>
            <select
              value={filtreColoc}
              onChange={(e) => setFiltreColoc(e.target.value)}
              className="w-full rounded-xl border border-forest-100 bg-canvas px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
            >
              <option value="all">Tous les colocataires</option>
              {colocataires.map((c) => (
                <option key={c.id} value={c.id}>{c.nom}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-forest-700/70 mb-1">Du</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full rounded-xl border border-forest-100 bg-canvas px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-forest-700/70 mb-1">Au</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full rounded-xl border border-forest-100 bg-canvas px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
            />
          </div>
        </div>
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
              <span className="ml-auto text-xs text-forest-700/40 font-medium">{rizFiltre.length} entrée(s)</span>
            </div>

            {rizFiltre.length === 0 ? (
              <p className="text-sm text-forest-700/50 text-center py-8">
                {data.riz.length === 0 ? "Aucun apport de riz enregistré." : "Aucun résultat pour ces filtres."}
              </p>
            ) : (
              <ul className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {rizFiltre.map((r) => (
                  <li key={r.id} className="flex items-center gap-3 border-b border-forest-50 pb-3 last:border-0">
                    <Avatar image_path={r.image_path} nom={r.nom} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-forest-700">{r.nom}</p>
                      <p className="text-xs text-forest-700/50">{formatDate(r.date_ajout)}</p>
                    </div>
                    <span className="text-sm font-semibold text-grain-600 shrink-0">{r.kg} kp</span>
                    <DeleteButton onConfirm={() => annulerRiz(r.id)} />
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
              <span className="ml-auto text-xs text-forest-700/40 font-medium">{depensesFiltrees.length} entrée(s)</span>
            </div>

            {depensesFiltrees.length === 0 ? (
              <p className="text-sm text-forest-700/50 text-center py-8">
                {data.depenses.length === 0 ? "Aucune dépense enregistrée." : "Aucun résultat pour ces filtres."}
              </p>
            ) : (
              <ul className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {depensesFiltrees.map((d) => (
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
                    <DeleteButton onConfirm={() => annulerDepense(d.id)} />
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