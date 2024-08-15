import {DataTypes} from 'sequelize'
import { sequelize } from '../../../sequelize.js';

export const Chambre = sequelize.define("Chambre", {
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
  prix_nuit: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  nombre_lits: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  nombre_personne: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  occupee: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  equipements_mobilier: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
  },
  equipements_electronique: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
  },
  equipements_salle_bains: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
  },
  equipements_suplementaires: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
  },
  equipements_securite: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
  },
  equipements_autres: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
  },
  type_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  etablissement_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
});
