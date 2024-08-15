import {DataTypes} from 'sequelize'
import { sequelize } from '../../../sequelize.js';

export const Facture = sequelize.define(
  "Facture",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    montant: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    montant_versee: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    monnaie_rendue: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    mode_paiement_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    reservation_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    etablissement_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    underscored: true,
  }
);
