import express from "express";
import * as Sequelize from "sequelize";
import { Chambre } from "./chambre.model.js";
import { uploadImages } from "../images/images.router.js";
import { Etablissement } from "../etablissements/etabl.model.js";
import { TypeChambre } from "./TypeChambre.model.js";
import { User } from "../users/models/User.js";
import { Reservation } from "../reservations/reservation.model.js";
import { Personne } from "../personnes/personnes.model.js";
import { calculateMontant, paginateResponse } from "../../../utils/utils.js";
import { Image } from "../images/images.model.js";
import {
  getUserIdFromToken,
  requireAuthorization,
} from "../users/routes/auth.router.js";
import { sequelize } from "../../../sequelize.js";

const router = express.Router();
const Op = Sequelize.Op;

// Middleware pour parser le JSON
router.use(express.json());

// ajouter les images d'une chambre
router.post(
  "/:chambreId/images",
  requireAuthorization,
  uploadImages.array("images", 5),
  async (req, res) => {
    try {
      const { chambreId } = req.params;

      const created_by = getUserIdFromToken(req);
      const user = await User.findByPk(created_by);

      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé." });
      }

      const uploadedImages = req.files.map((file) => {
        // Générer l'URL de chaque image
        const imageUrl = file.path;
        return { url: imageUrl, chambre_id: chambreId, created_by };
      });

      // Vérifier si la chambre existe
      const chambre = await Chambre.findByPk(chambreId);
      if (!chambre) {
        return res.status(404).json({ message: "Chambre non trouvée." });
      }
      // Créer les entrées d'image dans la base de données
      const imagesSaved = await Image.bulkCreate(uploadedImages, {
        returning: [
          "id",
          "url",
          "chambre_id",
          "created_by",
          "createdAt",
          "updatedAt",
        ],
      });

      // Associer les images à la chambre
      await chambre.addImages(imagesSaved);

      res.json({ message: "Images téléchargées avec succès" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }
);

// CREATE - Créer une chambre
router.post("/", requireAuthorization, async (req, res) => {
  try {
    const {
      titre,
      description,
      prix_nuit,
      nombre_lits,
      nombre_personne,
      type_id,
      etablissement_id,
      equipements_mobilier,
      equipements_electronique,
      equipements_salle_bains,
      equipements_suplementaires,
      equipements_securite,
      equipements_autres,
    } = req.body;

    const created_by = getUserIdFromToken(req);
    const user = await User.findByPk(created_by);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    // Vérifier si l'établissement existe
    const etablissement = await Etablissement.findByPk(etablissement_id);
    if (!etablissement) {
      return res
        .status(400)
        .json({ message: "L'établissement spécifié n'existe pas." });
    }

    // Vérifier si le type de chambre existe
    const typeChambre = await TypeChambre.findByPk(type_id);
    if (!typeChambre) {
      return res
        .status(400)
        .json({ message: "Le type de chambre spécifié n'existe pas." });
    }

    // Créer la chambre
    const chambre = await Chambre.create({
      titre,
      description,
      prix_nuit,
      nombre_lits,
      nombre_personne,
      type_id,
      created_by,
      etablissement_id,
      equipements_mobilier,
      equipements_electronique,
      equipements_salle_bains,
      equipements_suplementaires,
      equipements_securite,
      equipements_autres,
    });

    res.status(201).json(chambre);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la création de la chambre." });
  }
});

// READ - Lire toutes les chambres
router.get("/", requireAuthorization, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;

  try {
    const userID = getUserIdFromToken(req);
    const user = await User.findByPk(userID);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    // Récupérer les IDs des établissements gérés par l'utilisateur connecté
    const etablissements = await Etablissement.findAll({
      attributes: ["id"],
      include: [
        {
          model: Personne,
          as: "gerants",
          where: { id: user.personne_id },
          through: { attributes: [] },
        },
      ],
    });

    const etablissementIds = etablissements.map((e) => e.id);

    if (etablissementIds.length === 0) {
      return res.status(404).json({
        message: "Aucun établissement trouvé pour l'utilisateur connecté.",
      });
    }

    const queries = {
      where: {
        etablissement_id: etablissementIds,
      },
      include: [
        {
          model: Image,
          as: "images",
        },
        {
          model: TypeChambre,
          as: "type_chambre",
        },
      ],
    };

    const { results, pagination } = await paginateResponse(
      Chambre,
      page,
      pageSize,
      queries
    );

    res.json({ results, pagination });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur serveur lors de la récupération des chambres.",
    });
  }
});

// Route pour récupérer un chambre par son ID
router.get("/:id", requireAuthorization, async (req, res) => {
  try {
    const chambre = await Chambre.findByPk(req.params.id, {
      include: [
        {
          model: Image,
          as: "images",
        },
        {
          model: TypeChambre,
          as: "type_chambre",
        },
      ],
    });
    if (!chambre) {
      return res.status(404).json({ message: "Chambre non trouvé." });
    }

    res.json(chambre);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur serveur lors de la recherche de l'établissement.",
    });
  }
});

// UPDATE - Mettre à jour une chambre
router.put("/:id", requireAuthorization, async (req, res) => {
  try {
    const {
      titre,
      description,
      prix_nuit,
      nombre_lits,
      nombre_personne,
      type_id,
      etablissement_id,
      equipements_mobilier,
      equipements_electronique,
      equipements_salle_bains,
      equipements_suplementaires,
      equipements_securite,
      equipements_autres,
    } = req.body;

    // Vérifier si l'établissement existe
    const etablissement = await Etablissement.findByPk(etablissement_id);
    if (!etablissement) {
      return res
        .status(400)
        .json({ message: "L'établissement spécifié n'existe pas." });
    }

    const chambre = await Chambre.findByPk(req.params.id);
    if (!chambre) {
      return res.status(404).json({ message: "Chambre non trouvée." });
    }

    // Vérifier si le type de chambre existe
    const typeChambre = await TypeChambre.findByPk(type_id);
    if (!typeChambre) {
      return res
        .status(400)
        .json({ message: "Le type de chambre spécifié n'existe pas." });
    }

    // Mettre à jour la chambre
    await chambre.update({
      titre,
      description,
      prix_nuit,
      nombre_lits,
      nombre_personne,
      type_id,
      etablissement_id,
      equipements_mobilier,
      equipements_electronique,
      equipements_salle_bains,
      equipements_suplementaires,
      equipements_securite,
      equipements_autres,
    });

    res.status(200).json(chambre);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur serveur lors de la mise à jour de la chambre.",
    });
  }
});

// DELETE - Supprimer une chambre
router.delete("/:id", requireAuthorization, async (req, res) => {
  try {
    const chambre = await Chambre.findByPk(req.params.id);
    if (!chambre) {
      return res.status(404).json({ message: "Chambre non trouvée." });
    }

    // Supprimer la chambre
    await chambre.destroy();

    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur serveur lors de la suppression de la chambre.",
    });
  }
});

// RESERVATIONS CHAMBRES

//  réserver une chambre
router.post(
  "/:chambreId/reservations",
  requireAuthorization,
  async (req, res) => {
    try {
      const { chambreId, personneId, dateDebut, dateFin, nombrePersonne } =
        req.body;

      const userID = getUserIdFromToken(req);
      const user = await User.findByPk(userID);
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé." });
      }

      // Vérifier si la personne existe
      const personne = await Personne.findByPk(personneId);
      if (!personne) {
        return res.status(404).json({ message: "La personne n'existe pas." });
      }

      // Vérifier si la chambre existe
      const chambre = await Chambre.findByPk(chambreId);
      if (!chambre) {
        return res.status(404).json({ message: "La chambre n'existe pas." });
      }

      const montantTotal = calculateMontant(
        dateDebut,
        dateFin,
        chambre.prix_nuit
      );

      // Créer la réservation
      const reservation = await Reservation.create({
        chambre_id: chambreId,
        personne_id: personneId,
        date_debut: dateDebut,
        date_fin: dateFin,
        nombre_personne: nombrePersonne,
        montant_total: montantTotal,
        is_waitting: true,
        is_confirmed: false,
        is_cancelled: false,
        is_completed: false,
        created_by: userID,
        etablissement_id: chambre.etablissement_id,
      });

      res.status(201).json(reservation);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Erreur serveur lors de la réservation." });
    }
  }
);

router.get(
  "/reservations/disponibles",
  requireAuthorization,
  async (req, res) => {
    try {
      const type_chambre = req.query.type_chambre;
      const date_debut = req.query.date_debut;
      const date_fin = req.query.date_fin;
      const userID = getUserIdFromToken(req);
      const user = await User.findByPk(userID);

      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé." });
      }

      //verifier si le type de chambre a été fourni
      if (!type_chambre) {
        return res.status(404).json({ message: "Type de chambre non fourni." });
      }

      //verifier si le type de chambre existe
      const typeChambre = await TypeChambre.findByPk(type_chambre);
      if (!typeChambre) {
        return res
          .status(404)
          .json({ message: "Type de chambre fournie n'existe pas." });
      }

      // Récupérer les IDs des établissements gérés par l'utilisateur connecté
      const etablissements = await Etablissement.findAll({
        attributes: ["id"],
        include: [
          {
            model: Personne,
            as: "gerants",
            where: { id: user.personne_id },
            through: { attributes: [] },
          },
        ],
      });

      const etablissementIds = etablissements.map((e) => e.id);

      if (etablissementIds.length === 0) {
        return res.status(404).json({
          message: "Aucun établissement trouvé pour l'utilisateur connecté.",
        });
      }

      const queries = {
        where: {
          etablissement_id: etablissementIds,
        },
        include: [
          {
            model: Image,
            as: "images",
          },
          {
            model: TypeChambre,
            as: "type_chambre",
            where: {
              id: typeChambre?.id,
            },
          },
        ],
      };

      const chambres = await Chambre.findAll(queries);

      res.json(chambres);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Erreur serveur lors de la récupération des chambres.",
      });
    }
  }
);

// Compter les réservations en attente, annulées, en cours et terminées pour une chambre spécifique
router.get(
  "/:id/reservations_count_by_status",
  requireAuthorization,
  async (req, res) => {
    const chambreId = req.params.id;

    try {
      const stats = await Reservation.findAll({
        attributes: [
          "is_waitting",
          [sequelize.fn("COUNT", sequelize.col("id")), "total"],
        ],
        where: {
          chambre_id: chambreId,
        },
        group: ["is_waitting"],
      });

      const statsAnnulees = await Reservation.findAll({
        attributes: [
          "is_cancelled",
          [sequelize.fn("COUNT", sequelize.col("id")), "total"],
        ],
        where: {
          chambre_id: chambreId,
        },
        group: ["is_cancelled"],
      });

      const statsEnCours = await Reservation.findAll({
        attributes: [
          "is_confirmed",
          [sequelize.fn("COUNT", sequelize.col("id")), "total"],
        ],
        where: {
          chambre_id: chambreId,
          is_confirmed: true,
          is_completed: false,
          is_cancelled: false,
          is_waitting: false,
        },
        group: ["is_confirmed"],
      });

      const statsTerminees = await Reservation.findAll({
        attributes: [
          "is_completed",
          [sequelize.fn("COUNT", sequelize.col("id")), "total"],
        ],
        where: {
          chambre_id: chambreId,
          is_completed: true,
        },
        group: ["is_completed"],
      });

      // Calculer les totaux à partir des résultats
      const enAttenteTotal =
        stats.find((stat) => stat.is_waitting === true)?.dataValues.total || 0;
      const annuleesTotal =
        statsAnnulees.find((stat) => stat.is_cancelled === true)?.dataValues
          .total || 0;
      const enCoursTotal =
        statsEnCours.find((stat) => stat.is_confirmed === true)?.dataValues
          .total || 0;
      const termineesTotal =
        statsTerminees.find((stat) => stat.is_completed === true)?.dataValues
          .total || 0;

      res.json({
        en_attente: enAttenteTotal,
        annulees: annuleesTotal,
        en_cours: enCoursTotal,
        terminees: termineesTotal,
      });
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des statistiques de réservation :",
        error?.message
      );
      res.status(500).json({
        message:
          "Erreur lors de la récupération des statistiques de réservation.",
      });
    }
  }
);

//récupérer la liste des réservations en cours pour une chambre spécifique
router.get(
  "/:chambreId/reservations_en_cours",
  requireAuthorization,
  async (req, res) => {
    const chambreId = req.params.chambreId;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    try {
      const queries = {
        where: {
          chambre_id: chambreId,
          is_confirmed: true,
          is_completed: false,
          is_cancelled: false,
          is_waitting: false,
        },
        order: [["date_debut", "ASC"]],
      };

      const { results, pagination } = await paginateResponse(
        Reservation,
        page,
        pageSize,
        queries
      );

      res.json({ results, pagination });
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des réservations en cours :",
        error
      );
      res.status(500).json({
        message: "Erreur lors de la récupération des réservations en cours.",
      });
    }
  }
);

//récupérer la liste des réservations en attente pour une chambre spécifique
router.get(
  "/:chambreId/reservations_en_attente",
  requireAuthorization,
  async (req, res) => {
    const chambreId = req.params.chambreId;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    try {
      const queries = {
        where: {
          chambre_id: chambreId,
          is_waitting: true,
        },
        order: [["date_debut", "ASC"]],
      };

      const { results, pagination } = await paginateResponse(
        Reservation,
        page,
        pageSize,
        queries
      );

      res.json({ results, pagination });
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des réservations en attente :",
        error
      );
      res.status(500).json({
        message: "Erreur lors de la récupération des réservations en attente.",
      });
    }
  }
);

//récupérer la liste des réservations terminées pour une chambre spécifique
router.get(
  "/:chambreId/reservations_terminees",
  requireAuthorization,
  async (req, res) => {
    const chambreId = req.params.chambreId;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    try {
      const queries = {
        where: {
          chambre_id: chambreId,
          is_completed: true,
        },
        order: [["date_debut", "ASC"]],
      };

      const { results, pagination } = await paginateResponse(
        Reservation,
        page,
        pageSize,
        queries
      );

      res.json({ results, pagination });
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des réservations terminées :",
        error
      );
      res.status(500).json({
        message: "Erreur lors de la récupération des réservations terminées.",
      });
    }
  }
);

//récupérer la liste des réservations annulées pour une chambre spécifique
router.get(
  "/:chambreId/reservations_annulees",
  requireAuthorization,
  async (req, res) => {
    const chambreId = req.params.chambreId;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    try {
      const queries = {
        where: {
          chambre_id: chambreId,
          is_cancelled: true,
        },
        order: [["date_debut", "ASC"]],
      };

      const { results, pagination } = await paginateResponse(
        Reservation,
        page,
        pageSize,
        queries
      );

      res.json({ results, pagination });
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des réservations annulées :",
        error
      );
      res.status(500).json({
        message: "Erreur lors de la récupération des réservations annulées.",
      });
    }
  }
);

export const ChambreRouter = router;
