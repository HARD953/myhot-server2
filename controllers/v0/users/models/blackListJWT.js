import { DataTypes } from "sequelize";

import { sequelize } from "../../../../sequelize.js";

export const BlacklistJWT = sequelize.define("BlacklistJWT", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  expirationDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});
