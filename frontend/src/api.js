import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE,
});

export const imageUrl = (path) => {
  if (!path) return null;
  return `${API_BASE}${path}`;
};

export const getColocataires = () => api.get("/api/colocataires").then((r) => r.data);

export const addColocataire = (nom, imageFile) => {
  const formData = new FormData();
  formData.append("nom", nom);
  formData.append("image", imageFile);
  return api.post("/api/colocataires", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);
};

export const deleteColocataire = (id) => api.delete(`/api/colocataires/${id}`).then((r) => r.data);

export const addRiz = (colocataire_id, kg) =>
  api.post("/api/riz", { colocataire_id, kg }).then((r) => r.data);

export const addDepense = (colocataire_id, nom_produit, prix, description) =>
  api.post("/api/depenses", { colocataire_id, nom_produit, prix, description }).then((r) => r.data);

export const getDashboard = () => api.get("/api/dashboard").then((r) => r.data);

export const getHistorique = () => api.get("/api/historique").then((r) => r.data);
