# Coloc Manager — Gestion des participations entre colocataires

Application web complète (React + FastAPI + MySQL) pour suivre le riz apporté et les
dépenses courantes d'une colocation, avec un tableau de bord par colocataire et un
historique détaillé.

## Structure du projet

```
roommate-app/
├── backend/          # API FastAPI + SQLAlchemy (MySQL)
├── frontend/          # Application React (Vite + Tailwind)
└── docker-compose.yml # Lance MySQL + backend + frontend en une commande
```

## Fonctionnalités

- **Page 1 — Ajouter** : enregistrer un apport de riz (kg / "kp") ou une dépense
  courante (produit, prix, note) pour un colocataire, avec bouton d'ajout de colocataire
  (nom + photo obligatoire).
- **Page 2 — Tableau de bord** : une carte par colocataire affichant son total de riz,
  son total de dépenses, et son solde par rapport aux autres. Le colocataire ayant le
  moins contribué est toujours à zéro ; les autres affichent leur avance
  (ex. si Mahefa=3000 Ar, Mirado=2000 Ar, Maminiaina=1000 Ar → affichés
  Mahefa=2000 Ar, Mirado=1000 Ar, Maminiaina=0 Ar).
- **Page 3 — Historique** : deux listes séparées (riz / dépenses) avec date précise,
  nom du colocataire et détails de chaque entrée.

> Le calcul de solde est une comparaison relative (total de chacun − minimum du
> groupe), et non une répartition de dette pair-à-pair : elle indique qui a le plus
> contribué et de combien, dans chaque catégorie (riz et argent).

## Option 1 : lancer avec Docker (le plus simple)

Prérequis : Docker et Docker Compose installés.

```bash
cd roommate-app
docker compose up --build
```

- Frontend : http://localhost:5173
- Backend / API : http://localhost:8000
- Documentation interactive de l'API : http://localhost:8000/docs
- MySQL : localhost:3306 (utilisateur `root`, mot de passe `root`, base `coloc_app`)

Les tables sont créées automatiquement au démarrage du backend.

## Option 2 : lancer manuellement (sans Docker)

### 1. Base de données MySQL

Installez MySQL localement, puis créez la base :

```bash
mysql -u root -p < backend/init_db.sql
```

### 2. Backend (Python)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows : venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # ajustez les identifiants MySQL si besoin
uvicorn main:app --reload --port 8000
```

Les tables sont créées automatiquement au premier lancement.

### 3. Frontend (React)

Dans un autre terminal :

```bash
cd frontend
npm install
npm run dev
```

L'application est accessible sur http://localhost:5173. Elle appelle l'API sur
`http://localhost:8000` par défaut (modifiable via un fichier `.env` avec
`VITE_API_URL=http://votre-backend`).

## Notes techniques

- Les photos de colocataires sont stockées dans `backend/uploads/` et servies via
  `/uploads/...`.
- Le solde est recalculé côté backend à chaque appel à `/api/dashboard`, à partir de
  la somme du riz et des dépenses de chaque colocataire.
- L'unité de riz par défaut est le **kp** (kilo), modifiable côté saisie
  (ex. `3.5`).
- La devise est l'**Ariary (Ar)**.

## Prochaines évolutions possibles

- Authentification par colocataire.
- Export de l'historique en PDF/Excel.
- Notifications lorsqu'un solde dépasse un certain seuil.
