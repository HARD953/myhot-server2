import {DataTypes} from 'sequelize'
import { sequelize } from '../../../sequelize.js';

export const Permission = sequelize.define("Permission", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  titre: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
  },
});
