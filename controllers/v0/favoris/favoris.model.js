import { DataTypes } from "sequelize";
import { sequelize } from "../../../sequelize.js";

export const Favoris = sequelize.define("Favoris", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  chambre_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  personne_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false,
  },
});
