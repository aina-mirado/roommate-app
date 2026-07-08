import os
import shutil
import uuid
from datetime import datetime
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import func

import models
import schemas
from database import engine, get_db, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Coloc Manager API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


# ---------- COLOCATAIRES ----------

@app.get("/api/colocataires", response_model=List[schemas.ColocataireOut])
def liste_colocataires(db: Session = Depends(get_db)):
    return db.query(models.Colocataire).order_by(models.Colocataire.nom).all()


@app.post("/api/colocataires", response_model=schemas.ColocataireOut)
def ajouter_colocataire(
    nom: str = Form(...),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if not nom.strip():
        raise HTTPException(status_code=400, detail="Le nom est requis.")

    ext = os.path.splitext(image.filename)[1] or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    coloc = models.Colocataire(nom=nom.strip(), image_path=f"/uploads/{filename}")
    db.add(coloc)
    db.commit()
    db.refresh(coloc)
    return coloc


@app.delete("/api/colocataires/{coloc_id}")
def supprimer_colocataire(coloc_id: int, db: Session = Depends(get_db)):
    coloc = db.query(models.Colocataire).get(coloc_id)
    if not coloc:
        raise HTTPException(status_code=404, detail="Colocataire introuvable.")
    if coloc.image_path:
        path = coloc.image_path.lstrip("/")
        if os.path.exists(path):
            os.remove(path)
    db.delete(coloc)
    db.commit()
    return {"ok": True}


# ---------- RIZ ----------

@app.post("/api/riz", response_model=schemas.RizOut)
def ajouter_riz(payload: schemas.RizCreate, db: Session = Depends(get_db)):
    coloc = db.query(models.Colocataire).get(payload.colocataire_id)
    if not coloc:
        raise HTTPException(status_code=404, detail="Colocataire introuvable.")
    if payload.kg <= 0:
        raise HTTPException(status_code=400, detail="La quantité doit être positive.")
    riz = models.RizContribution(colocataire_id=payload.colocataire_id, kg=payload.kg)
    db.add(riz)
    db.commit()
    db.refresh(riz)
    return riz


@app.get("/api/riz", response_model=List[schemas.RizOut])
def liste_riz(db: Session = Depends(get_db)):
    return db.query(models.RizContribution).order_by(models.RizContribution.date_ajout.desc()).all()


# ---------- DEPENSES ----------

@app.post("/api/depenses", response_model=schemas.DepenseOut)
def ajouter_depense(payload: schemas.DepenseCreate, db: Session = Depends(get_db)):
    coloc = db.query(models.Colocataire).get(payload.colocataire_id)
    if not coloc:
        raise HTTPException(status_code=404, detail="Colocataire introuvable.")
    if payload.prix <= 0:
        raise HTTPException(status_code=400, detail="Le prix doit être positif.")
    depense = models.Depense(
        colocataire_id=payload.colocataire_id,
        nom_produit=payload.nom_produit.strip(),
        prix=payload.prix,
        description=payload.description,
    )
    db.add(depense)
    db.commit()
    db.refresh(depense)
    return depense


@app.get("/api/depenses", response_model=List[schemas.DepenseOut])
def liste_depenses(db: Session = Depends(get_db)):
    return db.query(models.Depense).order_by(models.Depense.date_ajout.desc()).all()


# ---------- DASHBOARD / SOLDES ----------

@app.get("/api/dashboard", response_model=List[schemas.SoldeColocataire])
def dashboard(db: Session = Depends(get_db)):
    colocataires = db.query(models.Colocataire).order_by(models.Colocataire.nom).all()
    if not colocataires:
        return []

    totaux_riz = {}
    totaux_argent = {}

    for c in colocataires:
        total_riz = db.query(func.coalesce(func.sum(models.RizContribution.kg), 0.0)).filter(
            models.RizContribution.colocataire_id == c.id
        ).scalar()
        total_argent = db.query(func.coalesce(func.sum(models.Depense.prix), 0.0)).filter(
            models.Depense.colocataire_id == c.id
        ).scalar()
        totaux_riz[c.id] = float(total_riz)
        totaux_argent[c.id] = float(total_argent)

    min_riz = min(totaux_riz.values())
    min_argent = min(totaux_argent.values())

    print("Valeur de min_riz:", min_riz)
    print("Valeur de min_argent:", min_argent)    

    resultats = []
    for c in colocataires:
        solde_riz = round(totaux_riz[c.id] - min_riz, 2)
        solde_argent = round(totaux_argent[c.id] - min_argent, 2)

        if solde_riz > 0:
            msg_riz = f"{c.nom} a {solde_riz} kg d'avance sur le riz par rapport aux autres."
        else:
            msg_riz = f"{c.nom} est à jour pour le riz."

        if solde_argent > 0:
            msg_argent = f"{c.nom} doit recevoir {solde_argent:,.0f} Ar des autres colocataires.".replace(",", " ")
        else:
            msg_argent = f"{c.nom} est à jour pour les dépenses."

        resultats.append(schemas.SoldeColocataire(
            colocataire_id=c.id,
            nom=c.nom,
            image_path=c.image_path,
            total_riz_kg=round(totaux_riz[c.id], 2),
            total_argent=round(totaux_argent[c.id], 2),
            solde_riz=solde_riz,
            solde_argent=solde_argent,
            message_riz=msg_riz,
            message_argent=msg_argent,
        ))

    return resultats


# ---------- HISTORIQUE ----------

@app.get("/api/historique")
def historique(db: Session = Depends(get_db)):
    riz_items = db.query(models.RizContribution).order_by(models.RizContribution.date_ajout.desc()).all()
    dep_items = db.query(models.Depense).order_by(models.Depense.date_ajout.desc()).all()

    riz_history = [
        {
            "id": r.id,
            "nom": r.colocataire.nom if r.colocataire else "Inconnu",
            "image_path": r.colocataire.image_path if r.colocataire else None,
            "kg": r.kg,
            "date_ajout": r.date_ajout,
        }
        for r in riz_items
    ]

    dep_history = [
        {
            "id": d.id,
            "nom": d.colocataire.nom if d.colocataire else "Inconnu",
            "image_path": d.colocataire.image_path if d.colocataire else None,
            "nom_produit": d.nom_produit,
            "prix": d.prix,
            "description": d.description,
            "date_ajout": d.date_ajout,
        }
        for d in dep_items
    ]

    return {"riz": riz_history, "depenses": dep_history}


@app.get("/api/health")
def health():
    return {"status": "ok", "time": datetime.utcnow().isoformat()}
