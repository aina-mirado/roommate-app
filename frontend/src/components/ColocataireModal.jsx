import React, { useState, useRef } from "react";
import { X, Camera, Loader2 } from "lucide-react";
import { addColocataire } from "../api.js";

export default function ColocataireModal({ open, onClose, onCreated }) {
  const [nom, setNom] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  if (!open) return null;

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const reset = () => {
    setNom("");
    setFile(null);
    setPreview(null);
    setError("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!nom.trim()) {
      setError("Le nom du colocataire est requis.");
      return;
    }
    if (!file) {
      setError("Une photo est requise pour ajouter un colocataire.");
      return;
    }
    setLoading(true);
    try {
      const created = await addColocataire(nom.trim(), file);
      onCreated(created);
      reset();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.detail || "Une erreur est survenue. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-forest-700/40 backdrop-blur-sm px-0 sm:px-4">
      <div className="bg-panel w-full sm:max-w-md rounded-t-3xl sm:rounded-xl2 shadow-soft p-6 sm:p-8 animate-rise">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-xl text-forest-700">Nouveau colocataire</h3>
          <button onClick={handleClose} className="text-forest-500/60 hover:text-forest-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 rounded-full bg-forest-50 border-2 border-dashed border-forest-300 flex items-center justify-center overflow-hidden hover:border-forest-500 transition-colors"
            >
              {preview ? (
                <img src={preview} alt="Aperçu" className="w-full h-full object-cover" />
              ) : (
                <Camera size={24} className="text-forest-300" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <span className="text-xs text-forest-500/70">Photo obligatoire</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-forest-700 mb-1.5">Nom du colocataire</label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="ex. Mahefa"
              className="w-full rounded-xl border border-forest-100 bg-canvas px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
            />
          </div>

          {error && <p className="text-sm text-berry-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-forest-500 hover:bg-forest-600 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-60"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Ajouter le colocataire
          </button>
        </form>
      </div>
    </div>
  );
}
