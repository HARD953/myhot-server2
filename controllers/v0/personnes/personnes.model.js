import {DataTypes} from 'sequelize'
import { sequelize } from '../../../sequelize.js';

export const Personne = sequelize.define("Personne", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  is_gerant: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  is_client: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  prenom: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  email: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true,
  },
  telephone: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  pays: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  ville: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  commune: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  date_naissance: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true,
  },
});

