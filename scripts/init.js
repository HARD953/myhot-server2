import { defineAssociations } from "../controllers/v0/associationModel.js";
import { sequelize } from "../sequelize.js";
import {
  addCitiesForCountry,
  addRegionsForCountry,
  addPays,
  addTypeEtablissements,
  addDefaultUser,
} from "./list_scrips.js";



export async function initializeDatabase() {
  try {  
    await sequelize.authenticate();;
    defineAssociations();

    await addDefaultUser();
    await addPays();
    await addRegionsForCountry("Côte d'Ivoire");
    await addCitiesForCountry()
    await addTypeEtablissements();

    console.log("Base de données initialisée avec succès.");
  } catch (error) {
    console.error(
      "Erreur lors de l'initialisation de la base de données :",
      error
    );
    throw error;
  }
}
