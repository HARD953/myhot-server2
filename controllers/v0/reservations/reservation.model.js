import {DataTypes} from 'sequelize'
import { sequelize } from '../../../sequelize.js';

export const Reservation = sequelize.define("Reservation", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  is_waitting: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  is_confirmed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  is_cancelled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  is_completed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  date_debut: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: new Date(),
  },
  date_fin: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: new Date(),
  },
  date_arrivee: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  heure_arrivee: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  date_depart: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  heure_depart: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  nombre_personne: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  montant_total: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  montant_regle: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  soldee: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },

  personne_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  chambre_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  etablissement_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true,
  },

  confirmed_by: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  cancelled_by: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  completed_by: {
    type: DataTypes.UUID,
    allowNull: true,
  },
});
