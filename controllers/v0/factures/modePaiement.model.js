// Importer les dépendances nécessaires
import { DataTypes } from "sequelize";
import { sequelize } from "../../../sequelize.js";

// Définir le modèle ModePaiement
export const ModePaiement = sequelize.define("ModePaiement", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false,
  },
});
