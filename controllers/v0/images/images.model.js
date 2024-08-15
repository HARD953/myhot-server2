import { DataTypes } from "sequelize";
import { sequelize } from "../../../sequelize.js";

export const Image = sequelize.define("Image", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  chambre_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true,
  },
});

