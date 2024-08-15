import { User } from "./users/models/User.js";
import { Personne } from "./personnes/personnes.model.js";
import { Etablissement } from "./etablissements/etabl.model.js";
import { Reservation } from "./reservations/reservation.model.js";
import { TypeEtablissement } from "./etablissements/TypeEtablissement.model.js";
import { Chambre } from "./chambres/chambre.model.js";
import { TypeChambre } from "./chambres/TypeChambre.model.js";
import { Image } from "./images/images.model.js";
import { ModePaiement } from "./factures/modePaiement.model.js";
import { Facture } from "./factures/facture.model.js";
import { PersonneEtablissement } from "./personnes/personneEtabl.model.js";
import { Favoris } from "./favoris/favoris.model.js";
import {
  CommuneList,
  PaysList,
  RegionList,
  VilleList,
} from "./utilsController/pays.model.js";
import { Evaluation } from "./Evaluations/Evaluation.model.js";
import { Equipement } from "./equipements/equipement.model.js";
import { ChambreEquipement } from "./equipements/chambreEquipements.js";

export function defineAssociations() {
  //  USER MODEL
  User.belongsTo(Personne, {
    foreignKey: "personne_id",
    as: "personne",
  });

  // Ajoutez l'association pour enregistrer l'utilisateur qui a créé ce user
  User.belongsTo(User, {
    foreignKey: "created_by", // Clé étrangère dans le modèle User qui fait référence à User (créateur)
  });

  // PERSONNE MODEL
  Personne.hasMany(User, {
    foreignKey: "personne_id",
    as: "compte",
  });

  // Ajoutez l'association pour enregistrer l'utilisateur qui a créé cette personne
  Personne.belongsTo(User, {
    foreignKey: "created_by",
  });

  // Définir la relation avec les établissements en tant que gérant
  Personne.belongsToMany(Etablissement, {
    through: PersonneEtablissement,
    as: "etablissements_geres",
    foreignKey: "personne_id",
  });

  Personne.hasMany(Reservation, {
    foreignKey: "personne_id",
    as: "reservations",
  });

  Personne.belongsToMany(Chambre, {
    through: Favoris,
    foreignKey: "personne_id",
    as: "favoris",
  });

  // CHAMBRE MODEL
  Chambre.belongsTo(User, {
    foreignKey: "created_by",
  });

  Chambre.belongsTo(TypeChambre, { foreignKey: "type_id", as: "type_chambre" });

  Chambre.belongsTo(Etablissement, {
    foreignKey: "etablissement_id",
    as: "etablissement",
  });

  Chambre.hasMany(Image, {
    foreignKey: "chambre_id",
    as: "images",
  });

  Chambre.hasMany(Reservation, {
    foreignKey: "chambre_id",
    as: "reservations",
  });

  Chambre.belongsToMany(Personne, {
    through: Favoris,
    foreignKey: "chambre_id",
    as: "favoris",
  });

  // TYPE CHAMBRE MODEL

  TypeChambre.belongsTo(User, {
    foreignKey: "created_by",
  });

  // EQUIPEMENTS MODEL
  Equipement.belongsTo(User, {
    foreignKey: "created_by",
  });

  Chambre.belongsToMany(Equipement, {
    through: ChambreEquipement,
    foreignKey: "chambre_id",
    as: "equipements",
  });

  Equipement.belongsToMany(Chambre, {
    through: ChambreEquipement,
    foreignKey: "equipement_id",
    as: "chambres",
  });

  // ETABLISSEMENT MODEL
  // Définir la relation avec les gérants (utilisateurs)
  Etablissement.belongsToMany(Personne, {
    through: PersonneEtablissement,
    as: "gerants",
    foreignKey: "etablissement_id",
  });

  Etablissement.belongsTo(User, {
    foreignKey: "created_by",
  });

  Etablissement.belongsTo(PaysList, {
    foreignKey: "pays_id",
    as: "pays",
  });

  Etablissement.belongsTo(VilleList, {
    foreignKey: "ville_id",
    as: "ville",
  });

  Etablissement.belongsTo(TypeEtablissement, {
    foreignKey: "type_id",
    as: "type_etablissement",
  });

  Etablissement.hasMany(Chambre, {
    foreignKey: "etablissement_id",
    as: "chambres",
  });

  Etablissement.hasMany(Facture, {
    foreignKey: "etablissement_id",
    as: "factures",
  });

  // TYPE ETABLISSEMENT MODEL
  TypeEtablissement.belongsTo(User, {
    foreignKey: "created_by",
  });

  // FACTURE MODEL
  // Ajoutez une relation entre Facture et ModePaiement
  Facture.belongsTo(ModePaiement, {
    foreignKey: "mode_paiement_id",
    as: "mode_paiement",
  });

  Facture.belongsTo(User, {
    foreignKey: "created_by",
  });

  Facture.belongsTo(Reservation, {
    foreignKey: "reservation_id",
    as: "reservation",
  });
  Facture.belongsTo(Etablissement, {
    foreignKey: "etablissement_id",
    as: "etablissement",
  });

  // MODE PAIEMENT FACTURE MODEL
  Etablissement.belongsTo(User, {
    foreignKey: "created_by",
  });

  // IMAGES MODEL
  Image.belongsTo(Chambre, {
    foreignKey: "chambre_id",
    as: "chambre",
  });

  Image.belongsTo(Chambre, { foreignKey: "chambre_id" });

  // RESERVATION MODEL
  Reservation.belongsTo(User, {
    foreignKey: "created_by",
  });

  Reservation.hasMany(Facture, {
    foreignKey: "reservation_id",
    as: "factures",
  });

  Reservation.belongsTo(Etablissement, {
    foreignKey: "etablissement_id",
    as: "etablissement",
  });

  Reservation.belongsTo(Personne, { foreignKey: "personne_id", as: "client" });
  Reservation.belongsTo(Chambre, { foreignKey: "chambre_id", as: "chambre" });
  Reservation.belongsTo(User, {
    foreignKey: "confirmed_by",
    as: "confirmedByUser",
  });
  Reservation.belongsTo(User, {
    foreignKey: "cancelled_by",
    as: "cancelledByUser",
  });
  Reservation.belongsTo(User, {
    foreignKey: "completed_by",
    as: "completedByUser",
  });
}

//FAVORIS
Favoris.belongsTo(Personne, { foreignKey: "personne_id", as: "personne" });
Favoris.belongsTo(Chambre, { foreignKey: "chambre_id", as: "chambre" });

//REGIONS ET PAYS ET VILLE ET COMMUNE
PaysList.hasMany(RegionList, { foreignKey: "pays_id" });
RegionList.belongsTo(PaysList, { foreignKey: "pays_id" });

RegionList.hasMany(VilleList, { foreignKey: "region_id" });
VilleList.belongsTo(RegionList, { foreignKey: "region_id" });
PaysList.hasMany(VilleList, { foreignKey: "pays_id" });
VilleList.belongsTo(PaysList, { foreignKey: "pays_id" });

VilleList.hasMany(CommuneList, { foreignKey: "ville_id" });
CommuneList.belongsTo(VilleList, { foreignKey: "ville_id" });

//COMMENTAIRES
Evaluation.belongsTo(Personne, { foreignKey: "personne_id", as: "client" });
Evaluation.belongsTo(Chambre, { foreignKey: "chambre_id", as: "chambre" });
Evaluation.belongsTo(Personne, { foreignKey: "approuve_by", as: "approuveur" });
