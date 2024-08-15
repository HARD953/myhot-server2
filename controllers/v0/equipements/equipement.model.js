import {DataTypes} from 'sequelize'
import { sequelize } from '../../../sequelize.js';

export const Equipement = sequelize.define("Equipement", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  titre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false,
  },
});

