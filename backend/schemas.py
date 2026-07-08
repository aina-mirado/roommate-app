from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ColocataireOut(BaseModel):
    id: int
    nom: str
    image_path: Optional[str] = None
    date_ajout: datetime

    class Config:
        from_attributes = True


class RizCreate(BaseModel):
    colocataire_id: int
    kg: float


class RizOut(BaseModel):
    id: int
    colocataire_id: int
    kg: float
    date_ajout: datetime

    class Config:
        from_attributes = True


class DepenseCreate(BaseModel):
    colocataire_id: int
    nom_produit: str
    prix: float
    description: Optional[str] = None


class DepenseOut(BaseModel):
    id: int
    colocataire_id: int
    nom_produit: str
    prix: float
    description: Optional[str] = None
    date_ajout: datetime

    class Config:
        from_attributes = True


class SoldeColocataire(BaseModel):
    colocataire_id: int
    nom: str
    image_path: Optional[str] = None
    total_riz_kg: float
    total_argent: float
    solde_riz: float
    solde_argent: float
    message_riz: str
    message_argent: str
