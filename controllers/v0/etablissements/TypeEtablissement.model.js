import { DataTypes } from "sequelize";
import { sequelize } from "../../../sequelize.js";


export const TypeEtablissement = sequelize.define("TypeEtablissement", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true,
  },
});


