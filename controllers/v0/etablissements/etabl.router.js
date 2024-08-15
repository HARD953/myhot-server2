import express from 'express';
import * as Sequelize from "sequelize"
import { Etablissement } from './etabl.model.js';
import { getUserIdFromToken, requireAuthorization } from '../users/routes/auth.router.js';
import multer from 'multer';
import { User } from '../users/models/User.js';
import { TypeEtablissement } from './TypeEtablissement.model.js';
import { PersonneEtablissement } from '../personnes/personneEtabl.model.js';
import { Personne } from '../personnes/personnes.model.js';
import { paginateResponse } from '../../../utils/utils.js';
import { PaysList, VilleList } from '../utilsController/pays.model.js';
import { param } from 'express-validator';

const router = express.Router();
const Op = Sequelize.Op

const upload = multer();

// Endpoint pour récupérer les établissements dont l'utilisateur connecté fait partie des gérants
router.get("/",requireAuthorization, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
    
  try {
    const userID = getUserIdFromToken(req);

    const user = await User.findByPk(userID);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    const queries = {
      include: [
        {
          model: Personne,
          as: "gerants",
          where: { id: user.personne_id },
          through: { attributes: [] },
        },
        {
          model: TypeEtablissement,
          as: "type_etablissement",
        },
        {
          model: PaysList,
          as: "pays",
        },
        {
          model: VilleList,
          as: "ville",
        },
      ],
    };

    // Récupérer les établissements dont l'utilisateur connecté fait partie des gérants
    const { results, pagination } = await paginateResponse(
      Etablissement,
      page,
      pageSize,
      queries
    );

    res.json({ results, pagination });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur serveur lors de la récupération des établissements.",
    });
  }
});

// Endpoint pour récupérer les établissements par type dont l'utilisateur connecté fait partie des gérants
router.get("/type/:typeId/",param("typeId").isUUID(),requireAuthorization, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const typeId = req.params.typeId;
    
  try {
    const userID = getUserIdFromToken(req);

    const user = await User.findByPk(userID);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }



    //verifier si le type existe
    const type = await TypeEtablissement.findByPk(typeId);
    if(!type){
      return res.status(404).json({message : "le type fourni n'existe pas"});
    }

    const queries = {
      where: {
        type_id: type.id,
      },
      include: [
        {
          model: Personne,
          as: "gerants",
          where: { id: user.personne_id },
          through: { attributes: [] },
        },
        {
          model: TypeEtablissement,
          as: "type_etablissement",
        },
        {
          model: PaysList,
          as: "pays",
        },
        {
          model: VilleList,
          as: "ville",
        },
      ],
    };

    // Récupérer les établissements dont l'utilisateur connecté fait partie des gérants
    const { results, pagination } = await paginateResponse(
      Etablissement,
      page,
      pageSize,
      queries
    );

    res.json({ results, pagination });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur serveur lors de la récupération des établissements.",
    });
  }
});

// Route pour créer un nouvel établissement
router.post("/",requireAuthorization, async (req, res) => {
  try {
    // Récupérer les données de la requête
    const {
      titre,
      description,
      email,
      latitude,
      longitude,
      telephone,
      type_id,
      pays_id,
      ville_id,
      commune,
    } = req.body;

    const created_by = getUserIdFromToken(req); 

    // Vérifier si le type d'établissement existe
    const typeEtablissement = await TypeEtablissement.findByPk(type_id);
    if (!typeEtablissement) {
      return res
        .status(404)
        .json({ message: "Type d'établissement non trouvé." });
    }

    const user = await User.findByPk(created_by);
    if(!user){
      return res
        .status(404)
        .json({ message: "Utilisateur non trouvé." });
    }
    // Créer un nouvel établissement dans la base de données
    const etablissement = await Etablissement.create({
      titre,
      description,
      email,
      latitude,
      longitude,
      telephone,
      type_id,
      pays_id,
      ville_id,
      commune,
      created_by,
    });

    // Ajouter l'utilisateur créateur comme gérant de l'établissement
    await etablissement.addGerants(user.personne_id);

    // Envoyer une réponse avec le nouvel établissement créé
    res.status(201).json(etablissement);
  } catch (error) {
    // Gérer les erreurs en cas de problème lors de la création de l'établissement
    console.error(error);
    res.status(500).json({
      message: "Erreur serveur lors de la création de l'établissement.",
    });
  }
});


// Route pour récupérer un établissement par son ID
router.get("/:id",requireAuthorization, async (req, res) => {
  try {
    // Trouver l'établissement dans la base de données par son ID
    const etablissement = await Etablissement.findByPk(req.params.id);
    if (!etablissement) {
      // Si aucun établissement n'est trouvé, renvoyer une réponse avec un statut 404
      return res.status(404).json({ message: "Établissement non trouvé." });
    }
    // Envoyer une réponse avec l'établissement trouvé
    res.json(etablissement);
  } catch (error) {
    // Gérer les erreurs en cas de problème lors de la recherche de l'établissement
    console.error(error);
    res.status(500).json({
      message: "Erreur serveur lors de la recherche de l'établissement.",
    });
  }
});


// Route pour mettre à jour un établissement par son ID
router.put("/:id",requireAuthorization, async (req, res) => {
  try {
    // Trouver l'établissement dans la base de données par son ID
    const etablissement = await Etablissement.findByPk(req.params.id);
    if (!etablissement) {
      // Si aucun établissement n'est trouvé, renvoyer une réponse avec un statut 404
      return res.status(404).json({ message: "Établissement non trouvé." });
    }

    // Récupérer les nouvelles données de l'établissement à partir de la requête
    const {
      titre,
      description,
      email,
      latitude,
      longitude,
      telephone,
      type_id,
      pays_id,
      ville_id,
      commune,
    } = req.body;

    // Mettre à jour les données de l'établissement
    await etablissement.update({
      titre,
      description,
      email,
      latitude,
      longitude,
      telephone,
      type_id,
      pays_id,
      ville_id,
      commune,
    });

    // Envoyer une réponse de succès
    res.json({ message: "Établissement mis à jour avec succès." });
  } catch (error) {
    // Gérer les erreurs en cas de problème lors de la mise à jour de l'établissement
    console.error(error);
    res.status(500).json({
      message: "Erreur serveur lors de la mise à jour de l'établissement.",
    });
  }
});

// Route pour supprimer un établissement par son ID
router.delete("/:id",requireAuthorization, async (req, res) => {
  try {

    const etablissementId = req.params.id;
    const userID = getUserIdFromToken(req);
    const user = await User.findByPk(userID);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    // Vérifiez que l'utilisateur est bien un gérant de cet établissement
    const etablissement = await Etablissement.findOne({
      where: { id: etablissementId },
      include: [
        {
          model: Personne,
          as: "gerants",
          where: { id: user?.personne_id },
          through: { attributes: [] },
        },
      ],
    });
 
    if (!etablissement) {
      return res.status(404).json({
            message:
              "Établissement non trouvé ou vous n'êtes pas autorisé à le supprimer.",
      });
    }


    await Etablissement.destroy({ where: { id: etablissementId } });

    res.json({ message: "Établissement supprimé avec succès." });

  } catch (error) {
    // Gérer les erreurs en cas de problème lors de la suppression de l'établissement
    console.error(error);
    res.status(500).json({
      message: "Erreur serveur lors de la suppression de l'établissement.",
    });
  }
});


// Endpoint pour ajouter des gérants à un établissement
router.post("/:etablissementId/gerants",requireAuthorization, async (req, res) => {
  try {
    const { etablissementId } = req.params;
    const { gerants } = req.body; // Liste d'IDs des gérants à ajouter

    // Vérifier si l'établissement existe
    const etablissement = await Etablissement.findByPk(etablissementId);
    if (!etablissement) {
      return res.status(404).json({ message: "Établissement non trouvé." });
    }

    // Vérifier si les gérants existent
    const gerantsExistent = await Personne.findAll({
      where: {
        id: gerants
      }
    });
    if (gerantsExistent.length !== gerants.length) {
      return res.status(404).json({ message: "Certains gérants n'existent pas." });
    }

    // Associer les gérants à l'établissement
    await etablissement.addGerants(gerants);

    res.status(200).json({ message: "Gérants ajoutés avec succès à l'établissement." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur lors de l'ajout des gérants à l'établissement." });
  }
});


export const EtablissementRouter= router;
