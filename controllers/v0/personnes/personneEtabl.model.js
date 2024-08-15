import { DataTypes } from "sequelize";
import { sequelize } from "../../../sequelize.js";


export const PersonneEtablissement = sequelize.define("PersonneEtablissement", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  personne_id: {
    type: DataTypes.UUID,
    references: {
      model: "Personnes",
      key: "id",
    },
    onDelete: "CASCADE",
  },
  etablissement_id: {
    type: DataTypes.UUID,
    references: {
      model: "Etablissements",
      key: "id",
    },
    onDelete: "CASCADE",
  },
});


