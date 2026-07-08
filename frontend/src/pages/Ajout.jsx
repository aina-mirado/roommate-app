import React, { useEffect, useState } from "react";
import { UserPlus, Wheat, ShoppingBasket, Loader2, CheckCircle2 } from "lucide-react";
import { getColocataires, addRiz, addDepense } from "../api.js";
import ColocataireSelect from "../components/ColocataireSelect.jsx";
import ColocataireModal from "../components/ColocataireModal.jsx";

export default function Ajout({ onChanged }) {
  const [colocataires, setColocataires] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- état formulaire riz ---
  const [rizColocId, setRizColocId] = useState(null);
  const [rizKg, setRizKg] = useState("");
  const [rizLoading, setRizLoading] = useState(false);
  const [rizSuccess, setRizSuccess] = useState(false);
  const [rizError, setRizError] = useState("");

  // --- état formulaire dépense ---
  const [depColocId, setDepColocId] = useState(null);
  const [depNom, setDepNom] = useState("");
  const [depPrix, setDepPrix] = useState("");
  const [depDescription, setDepDescription] = useState("");
  const [depLoading, setDepLoading] = useState(false);
  const [depSuccess, setDepSuccess] = useState(false);
  const [depError, setDepError] = useState("");

  const chargerColocataires = async () => {
    setLoading(true);
    try {
      const data = await getColocataires();
      setColocataires(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chargerColocataires();
  }, []);

  const handleCreated = (created) => {
    setColocataires((prev) => [...prev, created].sort((a, b) => a.nom.localeCompare(b.nom)));
  };

  const submitRiz = async (e) => {
    e.preventDefault();
    setRizError("");
    setRizSuccess(false);
    if (!rizColocId) return setRizError("Choisissez un colocataire.");
    const kg = parseFloat(rizKg);
    if (!kg || kg <= 0) return setRizError("Entrez une quantité valide (ex. 3.5 kp).");

    setRizLoading(true);
    try {
      await addRiz(rizColocId, kg);
      setRizKg("");
      setRizSuccess(true);
      onChanged();
      setTimeout(() => setRizSuccess(false), 2500);
    } catch (err) {
      setRizError(err?.response?.data?.detail || "Erreur lors de l'ajout du riz.");
    } finally {
      setRizLoading(false);
    }
  };

  const submitDepense = async (e) => {
    e.preventDefault();
    setDepError("");
    setDepSuccess(false);
    if (!depColocId) return setDepError("Choisissez un colocataire.");
    if (!depNom.trim()) return setDepError("Le nom du produit est requis.");
    const prix = parseFloat(depPrix);
    if (!prix || prix <= 0) return setDepError("Entrez un prix valide.");

    setDepLoading(true);
    try {
      await addDepense(depColocId, depNom.trim(), prix, depDescription.trim() || null);
      setDepNom("");
      setDepPrix("");
      setDepDescription("");
      setDepSuccess(true);
      onChanged();
      setTimeout(() => setDepSuccess(false), 2500);
    } catch (err) {
      setDepError(err?.response?.data?.detail || "Erreur lors de l'ajout de la dépense.");
    } finally {
      setDepLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-grain-600 font-semibold mb-1">Page 1</p>
          <h1 className="font-display text-3xl text-forest-700">Ajouter une participation</h1>
          <p className="text-forest-700/60 text-sm mt-1">Enregistrez le riz apporté ou une dépense courante du foyer.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="hidden sm:flex items-center gap-2 bg-forest-700 hover:bg-forest-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-card shrink-0"
        >
          <UserPlus size={16} /> Colocataire
        </button>
      </div>

      <button
        onClick={() => setModalOpen(true)}
        className="sm:hidden w-full flex items-center justify-center gap-2 bg-forest-700 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-card"
      >
        <UserPlus size={16} /> Ajouter un colocataire
      </button>

      {!loading && colocataires.length === 0 && (
        <div className="bg-grain-200/40 border border-grain-500/30 rounded-xl2 p-6 text-center">
          <p className="text-forest-700 font-medium">Aucun colocataire pour le moment.</p>
          <p className="text-forest-700/60 text-sm mt-1">Commencez par en ajouter un pour pouvoir enregistrer des participations.</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Carte Riz */}
        <form onSubmit={submitRiz} className="bg-panel rounded-xl2 shadow-card p-6 space-y-5 border border-forest-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-grain-200 flex items-center justify-center">
              <Wheat size={18} className="text-grain-600" />
            </div>
            <div>
              <h2 className="font-display text-lg text-forest-700">Apport de riz</h2>
              <p className="text-xs text-forest-700/50">Quantité en kilos (kp)</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-forest-700 mb-2">Colocataire</label>
            <ColocataireSelect colocataires={colocataires} value={rizColocId} onChange={setRizColocId} />
          </div>

          <div>
            <label className="block text-sm font-medium text-forest-700 mb-1.5">Quantité (kp)</label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                value={rizKg}
                onChange={(e) => setRizKg(e.target.value)}
                placeholder="ex. 3.5"
                className="w-full rounded-xl border border-forest-100 bg-canvas px-4 py-2.5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-forest-700/40 font-medium">kp</span>
            </div>
          </div>

          {rizError && <p className="text-sm text-berry-500">{rizError}</p>}
          {rizSuccess && (
            <p className="text-sm text-forest-500 flex items-center gap-1.5"><CheckCircle2 size={16} /> Riz ajouté avec succès.</p>
          )}

          <button
            type="submit"
            disabled={rizLoading || colocataires.length === 0}
            className="w-full flex items-center justify-center gap-2 bg-grain-500 hover:bg-grain-600 text-forest-700 font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {rizLoading && <Loader2 size={16} className="animate-spin" />}
            Enregistrer le riz
          </button>
        </form>

        {/* Carte Dépense */}
        <form onSubmit={submitDepense} className="bg-panel rounded-xl2 shadow-card p-6 space-y-5 border border-forest-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-forest-50 flex items-center justify-center">
              <ShoppingBasket size={18} className="text-forest-500" />
            </div>
            <div>
              <h2 className="font-display text-lg text-forest-700">Dépense courante</h2>
              <p className="text-xs text-forest-700/50">Produit acheté pour le foyer</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-forest-700 mb-2">Colocataire</label>
            <ColocataireSelect colocataires={colocataires} value={depColocId} onChange={setDepColocId} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-forest-700 mb-1.5">Produit</label>
              <input
                type="text"
                value={depNom}
                onChange={(e) => setDepNom(e.target.value)}
                placeholder="ex. Huile, savon, légumes..."
                className="w-full rounded-xl border border-forest-100 bg-canvas px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-forest-700 mb-1.5">Prix (Ar)</label>
              <input
                type="number"
                step="1"
                min="0"
                value={depPrix}
                onChange={(e) => setDepPrix(e.target.value)}
                placeholder="ex. 5000"
                className="w-full rounded-xl border border-forest-100 bg-canvas px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-forest-700 mb-1.5">Note / description (optionnel)</label>
            <textarea
              value={depDescription}
              onChange={(e) => setDepDescription(e.target.value)}
              rows={2}
              placeholder="Détail utile sur cet achat"
              className="w-full rounded-xl border border-forest-100 bg-canvas px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 resize-none"
            />
          </div>

          {depError && <p className="text-sm text-berry-500">{depError}</p>}
          {depSuccess && (
            <p className="text-sm text-forest-500 flex items-center gap-1.5"><CheckCircle2 size={16} /> Dépense ajoutée avec succès.</p>
          )}

          <button
            type="submit"
            disabled={depLoading || colocataires.length === 0}
            className="w-full flex items-center justify-center gap-2 bg-forest-500 hover:bg-forest-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {depLoading && <Loader2 size={16} className="animate-spin" />}
            Enregistrer la dépense
          </button>
        </form>
      </div>

      <ColocataireModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={handleCreated} />
    </div>
  );
}
