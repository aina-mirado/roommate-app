import React from "react";
import { imageUrl } from "../api.js";
import { User } from "lucide-react";

export default function ColocataireSelect({ colocataires, value, onChange }) {
  if (colocataires.length === 0) {
    return (
      <p className="text-sm text-berry-500 bg-berry-500/5 border border-berry-500/20 rounded-xl px-4 py-3">
        Ajoutez d'abord un colocataire pour pouvoir enregistrer une participation.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2.5">
      {colocataires.map((c) => {
        const active = value === c.id;
        return (
          <button
            type="button"
            key={c.id}
            onClick={() => onChange(c.id)}
            className={`flex items-center gap-2 pl-1.5 pr-4 py-1.5 rounded-full border transition-all text-sm font-medium
              ${active
                ? "bg-forest-500 border-forest-500 text-white shadow-card"
                : "bg-canvas border-forest-100 text-forest-700 hover:border-forest-300"}`}
          >
            <span className="w-7 h-7 rounded-full overflow-hidden bg-forest-100 flex items-center justify-center shrink-0">
              {c.image_path ? (
                <img src={imageUrl(c.image_path)} alt={c.nom} className="w-full h-full object-cover" />
              ) : (
                <User size={14} />
              )}
            </span>
            {c.nom}
          </button>
        );
      })}
    </div>
  );
}
