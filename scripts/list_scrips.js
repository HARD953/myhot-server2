import { TypeChambre } from "../controllers/v0/chambres/TypeChambre.model.js";
import { TypeEtablissement } from "../controllers/v0/etablissements/TypeEtablissement.model.js";
import { Personne } from "../controllers/v0/personnes/personnes.model.js";
import { User } from "../controllers/v0/users/models/User.js";
import { generatePassword } from "../controllers/v0/users/routes/auth.router.js";
import {
  PaysList,
  RegionList,
  VilleList,
} from "../controllers/v0/utilsController/pays.model.js";
import {
  default_user_data,
  hotel_chambre_type_data,
  pays_data,
  regions_civ_data,
  type_etabl_data,
  ville_civ_data,
} from "../data/data.js";
import { sequelize } from "../sequelize.js";

//ajouter utilisateur pad deefault
export async function addDefaultUser() {
  try {
    const {
      nom,
      prenom,
      email,
      telephone,
      pays,
      ville,
      commune,
      date_naissance,
      is_client,
      is_gerant,
      password,
    } = default_user_data;

    const [personneInstance, created] = await Personne.findOrCreate({
      where: { email: email },
      defaults: {
        nom,
        prenom,
        email,
        telephone,
        pays,
        ville,
        commune,
        date_naissance,
        is_client,
        is_gerant,
      },
    });

    if (created) {
      console.log(`Personne ajouté email: ${email}`);
    } else {
      console.log(` Personne email ${email} existe déjà.`);
    }

    const generatedHash = await generatePassword(password);
    const [userInstance, userCreated] = await User.findOrCreate({
      where: { email: email },
      defaults: {
        email,
        password: generatedHash,
        is_admin: true,
        is_gerant: true,
        is_client: true,
        personne_id: personneInstance.id,
        created_by: personneInstance.id,
      },
    });

    if (userCreated) {
      console.log(`Utilisateur ajouté email:  ${email}`);
    } else {
      console.log(`Utilisateur email ${email} existe déjà.`);
    }
  } catch (error) {
    console.error(
      "Erreur lors de la création de l'utilisateur par default :",
      error
    );
    return null;
  }
}

// ajouter la liste des pays
export async function addPays() {
  for (const titre of pays_data) {
    const lowerCaseName = titre?.toLowerCase();
    const [paysInstance, created] = await PaysList.findOrCreate({
      where: sequelize.where(
        sequelize.fn("LOWER", sequelize.col("titre")),
        lowerCaseName
      ),
      defaults: {
        titre: titre,
      },
    });

    if (created) {
      console.log(`Pays ajouté : ${titre}`);
    } else {
      console.log(`Le pays ${titre} existe déjà.`);
    }
  }
}

// ajouter les regions en fonction du pays
async function getCountryIdByName(name) {
  try {
    const lowerCaseName = name?.toLowerCase();
    const country = await PaysList.findOne({
      where: sequelize.where(
        sequelize.fn("LOWER", sequelize.col("titre")),
        lowerCaseName
      ),
    });
    return country ? country.id : null;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'ID du pays :", error);
    return null;
  }
}

async function getRegionIdByName(name, countryName) {
  try {
    const region = await RegionList.findOne({ where: { titre: name } });

    if (region) {
      return region.id;
    } else {
      const countryId = await getCountryIdByName(countryName);
      const regionCreated = await RegionList.create({
        titre: name,
        pays_id: countryId,
      });

      return regionCreated ? regionCreated?.id : null;
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de l'ID du pays :", error);
    return null;
  }
}

export async function addRegionsForCountry(countryName) {
  try {
    const countryId = await getCountryIdByName(countryName);

    if (!countryId) {
      console.error("ID du pays non trouvé pour:", countryName);
      return;
    }

    const uniqueRegions = Array.from(
      new Set(regions_civ_data.map((r) => JSON.stringify(r))).map((e) =>
        JSON.parse(e)
      )
    );

    for (const region of uniqueRegions) {
      const [regionInstance, created] = await RegionList.findOrCreate({
        where: {
          titre: region.titre,
          pays_id: countryId,
        },
      });

      if (created) {
        console.log(`Région ajoutée : ${region.titre} .......`);
      } else {
        console.log(`La région ${region.titre} existe déjà.`);
      }
    }

    console.log("Ajout des régions terminé.");
  } catch (error) {
    console.error("Erreur lors de l'ajout des régions :", error);
  }
}

//ajouter des villes

export async function addCitiesForCountry() {
  try {
    for (const ville of ville_civ_data) {
      const countryId = await getCountryIdByName(ville.country);

      const regionId = await getRegionIdByName(ville.admin_name, ville.country);

      const [villeInstance, created] = await VilleList.findOrCreate({
        where: {
          titre: ville.city,
          // pays_id: countryId,
        },
        defaults: {
          titre: ville.city,
          pays_id: countryId,
          region_id: regionId,
          longitude: ville.lng,
          latitude: ville.lat,
        },
      });

      if (created) {
        console.log(`Ville ajoutée : ${ville.city} ..........`);
      } else {
        console.log(`La ville ${ville.city} existe déjà.`);
      }
    }

    console.log("Ajout des villes terminé.");
  } catch (error) {
    console.error("Erreur lors de l'ajout des villes :", error);
  }
}

//ajouter type de chambre
export async function addHotelRoomsTypes() {
  try {
    for (const type of hotel_chambre_type_data) {
      const [typechambre, created] = await TypeChambre.findOrCreate({
        where: {
          titre: type.type,
        },
        defaults: { titre: type.type, description: type.description },
      });

      if (created) {
        console.log(`Type Chambre ajouté : ${region.titre} .......`);
      } else {
        console.log(`Le type de chambre ajouté ${region.titre} existe déjà.`);
      }
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout des types de chambres :", error);
  }
}

// ajouter liste type etablissement
export async function addTypeEtablissements() {
  for (const type of type_etabl_data) {
    const [etablInstance, created] = await TypeEtablissement.findOrCreate({
      where: { type },
    });

    if (created) {
      console.log(`Type établissement ajouté : ${type}`);
    } else {
      console.log(`Le Type établissement ${type} existe déjà.`);
    }
  }
}
