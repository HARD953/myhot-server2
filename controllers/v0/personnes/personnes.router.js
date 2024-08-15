import express from "express";

import { Personne } from "./personnes.model.js";
import {
  getUserIdFromToken,
  requireAuthorization,
} from "../users/routes/auth.router.js";
import { User } from "../users/models/User.js";
import { paginateResponse } from "../../../utils/utils.js";
import { Etablissement } from "../etablissements/etabl.model.js";
import { sequelize } from "../../../sequelize.js";

const router = express.Router();

// Middleware pour parser le JSON
// router.use(express.json());

// // Middleware de validation pour l'ID
// router.param('id', [
//   param('id').isUUID('all')
//   custom(id => {
//     if (id) {
//       throw new Error('Invalid ID format');
//     }
//     return true;
//   })
// ]);

// Route pour récupérer toutes les personnes
router.get("/", requireAuthorization, async (req, res) => {
  try {
    const personnes = await Personne.findAll();
    res.json(personnes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Route pour créer une nouvelle personne
router.post("/", requireAuthorization, async (req, res) => {
  const transaction = await sequelize.transaction();
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
      type,
      etablissements_geres,
    } = req.body;

    const userID = getUserIdFromToken(req);

    let isGerant = false;
    let isClient = false;

    if (type === "gérant") {
      isClient = false;
      isGerant = true;
    }

    if (type === "client") {
      isClient = true;
      isGerant = false;
    }
    const personne = await Personne.create(
      {
        nom,
        prenom,
        email,
        telephone,
        pays,
        ville,
        commune,
        date_naissance,
        is_client: isClient,
        is_gerant: isGerant,
        created_by: userID,
      },
      { transaction }
    );

    if (isGerant && etablissements_geres && etablissements_geres.length > 0) {
      const etablissementsData = await Etablissement.findAll(
        {
          where: {
            id: etablissements_geres,
          },
        },
        { transaction }
      );
      await personne.setEtablissements_geres(etablissementsData, {
        transaction,
      });
    }
    await transaction.commit();
    res.status(201).json(personne);
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Route pour récupérer une personne par son ID
router.get("/:id",requireAuthorization, async (req, res) => {
  try {
    const personne = await Personne.findByPk(req.params.id, {
      include: {
        model: Etablissement,
        as: "etablissements_geres",
        through: {
          attributes: [],
        },
      },
    });

    if (!personne) {
      return res.status(404).json({ message: "Personne non trouvée" });
    }

    res.json(personne);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Route pour mettre à jour une personne
router.put("/:id", requireAuthorization, async (req, res) => {
  const transaction = await sequelize.transaction();
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
      type,
      etablissements_geres,
    } = req.body;

    const personId = req.params.id;
    const userID = getUserIdFromToken(req);

    const person = await Personne.findByPk(personId, { transaction });
    if (!person) {
      await transaction.rollback();
      return res.status(404).json({ message: "Personne not found" });
    }

    let isGerant = person.is_gerant;
    let isClient = person.is_client;

    if (type === "gérant") {
      isClient = false;
      isGerant = true;
    }

    if (type === "client") {
      isClient = true;
      isGerant = false;
    }

    await person.update(
      {
        nom,
        prenom,
        email,
        telephone,
        pays,
        ville,
        commune,
        date_naissance,
        is_client: isClient,
        is_gerant: isGerant,
        created_by: userID,
      },
      { transaction }
    );

    if (isGerant && etablissements_geres && etablissements_geres.length > 0) {
      const etablissementsData = await Etablissement.findAll(
        {
          where: {
            id: etablissements_geres,
          },
        },
        { transaction }
      );
      await person.setEtablissements_geres(etablissementsData, { transaction });
    }

    await transaction.commit();
    res.status(200).json(person);
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


// Route pour supprimer une personne
router.delete("/:id", requireAuthorization, async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const personne = await Personne.findByPk(req.params.id, { transaction });
    if (!personne) {
      await transaction.rollback();
      return res.status(404).json({ message: "Personne non trouvée" });
    }

    // Remove associations with etablissements
    await personne.setEtablissements_geres([], { transaction });

    // Delete the person
    await personne.destroy({ transaction });

    await transaction.commit();
    res.json({ message: "Personne supprimée avec succès" });
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


// récupérer tous les gérants
router.get("/utilisateurs/gerants", requireAuthorization, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const userID = getUserIdFromToken(req);

    const user = await User.findByPk(userID);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    const queries = { where: { is_gerant: true } };

    const { results, pagination } = await paginateResponse(
      Personne,
      page,
      pageSize,
      queries
    );

    res.json({ results, pagination });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la récupération des gérants." });
  }
});

// récupérer tous les clients
router.get("/utilisateurs/clients", requireAuthorization, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const userID = getUserIdFromToken(req);

    const user = await User.findByPk(userID);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    const queries = { where: { is_client: true } };

    const { results, pagination } = await paginateResponse(
      Personne,
      page,
      pageSize,
      queries
    );

    res.json({ results, pagination });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la récupération des gérants." });
  }
});

export const PersonneRouter = router;
