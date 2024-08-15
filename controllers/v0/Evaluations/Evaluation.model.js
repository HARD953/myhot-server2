import {DataTypes} from 'sequelize'
import { sequelize } from '../../../sequelize.js';



export const Evaluation = sequelize.define("Evaluation", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  note_proprete: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 5,
    },
  },
  note_service_client: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 5,
    },
  },
  note_confort: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 5,
    },
  },
  note_equipements: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 5,
    },
  },
  note_localisation: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 5,
    },
  },
  note_valeur_argent: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 5,
    },
  },
  note_securite: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 5,
    },
  },
  commentaire: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  chambre_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  personne_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  approuve: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  approuve: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  approuve_by: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  approuve_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});
