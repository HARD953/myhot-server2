import {DataTypes} from 'sequelize'
import { sequelize } from '../../../sequelize.js';


export const Etablissement = sequelize.define("Etablissement", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  titre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  email: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: "email@test.ci",
    validate: {
      isEmail: true,
    },
  },
  latitude: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  longitude: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  telephone: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  pays_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  ville_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  commune: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  type_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
});

