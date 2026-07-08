from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Colocataire(Base):
    __tablename__ = "colocataires"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(100), nullable=False)
    image_path = Column(String(255), nullable=True)
    date_ajout = Column(DateTime(timezone=True), server_default=func.now())

    riz_contributions = relationship("RizContribution", back_populates="colocataire", cascade="all, delete-orphan")
    depenses = relationship("Depense", back_populates="colocataire", cascade="all, delete-orphan")


class RizContribution(Base):
    __tablename__ = "riz_contributions"

    id = Column(Integer, primary_key=True, index=True)
    colocataire_id = Column(Integer, ForeignKey("colocataires.id"), nullable=False)
    kg = Column(Float, nullable=False)
    date_ajout = Column(DateTime(timezone=True), server_default=func.now())

    colocataire = relationship("Colocataire", back_populates="riz_contributions")


class Depense(Base):
    __tablename__ = "depenses"

    id = Column(Integer, primary_key=True, index=True)
    colocataire_id = Column(Integer, ForeignKey("colocataires.id"), nullable=False)
    nom_produit = Column(String(150), nullable=False)
    prix = Column(Float, nullable=False)
    description = Column(Text, nullable=True)
    date_ajout = Column(DateTime(timezone=True), server_default=func.now())

    colocataire = relationship("Colocataire", back_populates="depenses")
