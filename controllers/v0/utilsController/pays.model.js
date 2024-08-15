import { DataTypes } from "sequelize";
import { sequelize } from "../../../sequelize.js";



export const PaysList = sequelize.define("PaysList", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  titre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});


export const RegionList = sequelize.define("RegionList", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  titre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pays_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: PaysList,
      key: "id",
    },
  },
});



export const VilleList = sequelize.define("VilleList", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  titre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  latitude: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  longitude: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  pays_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: PaysList,
      key: "id",
    },
  },
  region_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: RegionList,
      key: "id",
    },
  },
});


export const CommuneList = sequelize.define("CommuneList", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  titre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ville_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: VilleList,
      key: "id",
    },
  },
});
