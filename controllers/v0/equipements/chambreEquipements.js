import { DataTypes } from "sequelize";
import { sequelize } from "../../../sequelize.js";
import { Chambre } from "../chambres/chambre.model.js";
import { Equipement } from "./equipement.model.js";



export const ChambreEquipement = sequelize.define(
  "ChambreEquipement",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    chambre_id: {
      type: DataTypes.UUID,
      references: {
        model: Chambre,
        key: "id",
      },
      allowNull: false,
    },
    equipement_id: {
      type: DataTypes.UUID,
      references: {
        model: Equipement,
        key: "id",
      },
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);
