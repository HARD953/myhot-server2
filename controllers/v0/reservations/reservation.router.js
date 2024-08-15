import express from 'express';
import { Reservation } from './reservation.model.js';
import { Chambre } from '../chambres/chambre.model.js';
import { Facture } from '../factures/facture.model.js';
import { validateReservation, vilidateChangeReservationStatut } from '../../../middlewares/validators.js';
import { calculateDifferenceInDays, calculateMontant, paginateResponse } from '../../../utils/utils.js';
import { Personne } from '../personnes/personnes.model.js';
import { User } from '../users/models/User.js';
import { Etablissement } from '../etablissements/etabl.model.js';
import { getUserIdFromToken, requireAuthorization } from '../users/routes/auth.router.js';
import { sequelize } from '../../../sequelize.js';
import { TypeEtablissement } from '../etablissements/TypeEtablissement.model.js';
import { PersonneEtablissement } from '../personnes/personneEtabl.model.js';

const router = express.Router();



// Fonction d'aide pour mettre à jour le statut de la réservation
const updateReservationStatus = async (id, updates, userId) => {
  const reservation = await Reservation.findByPk(id);
  if (!reservation) {
    throw new Error('Réservation non trouvée');
  }

  await reservation.update({
    ...updates,
  //   ...(updates.is_confirmed && { confirmed_by: userId }),
  //   ...(updates.is_cancelled && { cancelled_by: userId }),
  //   ...(updates.is_completed && { completed_by: userId }),
   });

  return reservation;
};


const updateReservationStatusComplete = async (id, statusUpdate, transaction) => {
  const reservation = await Reservation.findByPk(id, { transaction });
  if (!reservation) {
    throw new Error("Réservation non trouvée");
  }

  await reservation.update(statusUpdate, { transaction });
  await reservation.save({ transaction });

  return reservation;
};



// Fonction pour créer une réservation
export async function createReservation(personneId, reservationData, user,transaction) {
  const { chambreId, dateDebut, dateFin, nombrePersonne } = reservationData;

  const chambre = await Chambre.findByPk(chambreId, { transaction });
  if (!chambre) {
    throw new Error("La chambre n'existe pas.");
  }

  const montantTotal = calculateMontant(dateDebut, dateFin, chambre.prix_nuit);

  const reservation = await Reservation.create(
    {
      chambre_id: chambreId,
      personne_id: personneId,
      date_debut: dateDebut,
      date_fin: dateFin,
      nombre_personne: nombrePersonne,
      montant_total: montantTotal,
      is_waiting: true,
      is_confirmed: false,
      is_cancelled: false,
      is_completed: false,
      created_by: user.personne_id,
      etablissement_id: chambre.etablissement_id,
    },
    { transaction }
  );

  return reservation;
}


// Endpoint pour créer une réservation pour une personne sans compte
router.post("/",requireAuthorization, async (req, res) => {

    const transaction = await sequelize.transaction();

  try {

    const userID = getUserIdFromToken(req);
    const user = await User.findByPk(userID,{transaction});
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }
    
    const { nom, prenom, email, telephone, ...reservationData } = req.body;


    // Créer la personne
    const personne = await Personne.create({
      nom,
      prenom,
      email,
      telephone,
    },{transaction});

    // Créer la réservation pour la personne
    const reservation = await createReservation(
      personne.id,
      reservationData,
      user,
      transaction
    );  
    await transaction.commit();
    res.status(201).json(reservation);
  } catch (error) {
    if(transaction) await transaction.rollback();
    console.error(error);
    res.status(500).json({ message: "Erreur serveur lors de la réservation." });
  }
});



// Lire toutes les réservations
router.get("/",requireAuthorization, async (req, res) => {
  try {
    const typeReservation = req.query.status || "";
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const userID = getUserIdFromToken(req);
    const user = await User.findByPk(userID);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    const queryWhere = getReservationStatus(typeReservation);
    
    const queries = {
      where: queryWhere,
      include: [
        {
          model: Personne,
          as: "client",
        },
        {
          model: Chambre,
          as: "chambre",
        },
      ],
    };

   
    const { results, pagination } = await paginateResponse(
      Reservation,
      page,
      pageSize,
      queries
    );

    res.json({ results, pagination });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des réservations." });
  }
});


// Lire toutes les réservations en attentes
router.get("/etablissements/waitting",requireAuthorization, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const userID = getUserIdFromToken(req);
    const user = await User.findByPk(userID);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    const queries = {
      where: {
        is_waitting: true,
        is_confirmed: false,
        is_cancelled: false,
        is_completed: false,
      },
      include: [
        {
          model: Personne,
          as: "client",
        },
        {
          model: Chambre,
          as: "chambre",
        },
        {
          model: Etablissement,
          as: "etablissement",
          include: [
            {
              model: Personne,
              as: "gerants",
              where: {
                id: user.personne_id,
              },
            },
          ],
        },
      ],
    };


    const { results, pagination } = await paginateResponse(
      Reservation,
      page,
      pageSize,
      queries
    );

    res.json({ results, pagination });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des réservations." });
  }
});

// Lire toutes les réservations confirmées
router.get(
  "/etablissements/confirmed",
  requireAuthorization,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 10;
      const userID = getUserIdFromToken(req);
      const user = await User.findByPk(userID);
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé." });
      }

      const queries = {
        where: {
          is_waitting: false,
          is_confirmed: true,
          is_cancelled: false,
          is_completed: false,
        },
        include: [
          {
            model: Personne,
            as: "client",
          },
          {
            model: Chambre,
            as: "chambre",
          },
          {
            model: Etablissement,
            as: "etablissement",
            include: [
              {
                model: Personne,
                as: "gerants",
                where: {
                  id: user.personne_id,
                },
              },
            ],
          },
        ],
      };

      const { results, pagination } = await paginateResponse(
        Reservation,
        page,
        pageSize,
        queries
      );

      res.json({ results, pagination });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({
          message: "Erreur serveur lors de la récupération des réservations.",
        });
    }
  }
);

// Lire toutes les réservations annulées
router.get(
  "/etablissements/cancelled",
  requireAuthorization,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 10;
      const userID = getUserIdFromToken(req);
      const user = await User.findByPk(userID);
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé." });
      }

      const queries = {
        where: {
          is_waitting: false,
          is_confirmed: true,
          is_cancelled: true,
          is_completed: false,
        },
        include: [
          {
            model: Personne,
            as: "client",
          },
          {
            model: Chambre,
            as: "chambre",
          },
          {
            model: Etablissement,
            as: "etablissement",
            include: [
              {
                model: Personne,
                as: "gerants",
                where: {
                  id: user.personne_id,
                },
              },
            ],
          },
        ],
      };

      const { results, pagination } = await paginateResponse(
        Reservation,
        page,
        pageSize,
        queries
      );

      res.json({ results, pagination });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Erreur serveur lors de la récupération des réservations.",
      });
    }
  }
);

// Lire toutes les réservations terminées
router.get(
  "/etablissements/completed",
  requireAuthorization,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 10;
      const userID = getUserIdFromToken(req);
      const user = await User.findByPk(userID);
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé." });
      }

      const queries = {
        where: {
          is_waitting: false,
          is_confirmed: true,
          is_cancelled: false,
          is_completed: true,
        },
        include: [
          {
            model: Personne,
            as: "client",
          },
          {
            model: Chambre,
            as: "chambre",
          },
          {
            model: Etablissement,
            as: "etablissement",
            include: [
              {
                model: Personne,
                as: "gerants",
                where: {
                  id: user.personne_id,
                },
              },
            ],
          },
        ],
      };

      const { results, pagination } = await paginateResponse(
        Reservation,
        page,
        pageSize,
        queries
      );

      res.json({ results, pagination });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Erreur serveur lors de la récupération des réservations.",
      });
    }
  }
);


// Route pour confirmer une réservation
router.patch("/:id/confirm",requireAuthorization, async (req, res) => {
  const { id } = req.params;
  const userID = getUserIdFromToken(req);
  const user = await User.findByPk(userID);
  if (!user) {
    return res.status(404).json({ message: "Utilisateur non trouvé." });
  }
  try {
    const updatedReservation = await updateReservationStatus(
      id,
      { is_waitting: false, is_confirmed: true, onfirmed_by: userID },
      userID
    );

    
    res.status(200).json(updatedReservation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// Route pour annuler une réservation
router.patch('/:id/cancel',requireAuthorization, async (req, res) => {
  const { id } = req.params;
  const userID = getUserIdFromToken(req);
  const user = await User.findByPk(userID);
  if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
  }

  try {
    const updatedReservation = await updateReservationStatus(id, { is_cancelled: true }, userID);
    res.status(200).json(updatedReservation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// Route pour terminer une réservation
router.patch('/:id/complete',requireAuthorization, async (req, res) => {
 const { id } = req.params;
 const userID = getUserIdFromToken(req);
 const user = await User.findByPk(userID);
 if (!user) {
   return res.status(404).json({ message: "Utilisateur non trouvé." });
 }

 const transaction = await sequelize.transaction();

 try {
   const updatedReservation = await updateReservationStatusComplete(
     id,
     { is_completed: true },
     transaction
   );

   const chambre = await Chambre.findByPk(updatedReservation.chambre_id,);

   const facture = await Facture.create(
     {
       montant:
         updatedReservation.montant_total - updatedReservation.montant_regle,
       montant_versee: 0,
       monnaie_rendue: 0,
       mode_paiement_id: null,
       reservation_id: updatedReservation.id,
       etablissement_id: chambre.etablissement_id,
       created_by: userID,
     },
     { transaction }
   );

   await transaction.commit();

   res.status(200).json({ updatedReservation, facture });
 } catch (error) {

   res.status(400).json({ error: error.message });
 }
});



// Lire les détails d'une réservation par son ID
router.get("/:id", async (req, res) => {
  try {
    // Récupérer l'ID de la réservation depuis les paramètres de la requête
    const { id } = req.params;

    // Récupérer les détails de la réservation par son ID
    const reservation = await Reservation.findByPk(id);

    // Vérifier si la réservation existe
    if (!reservation) {
      return res.status(404).json({ message: "Réservation non trouvée." });
    }

    // Répondre avec les détails de la réservation
    res.status(200).json(reservation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération de la réservation." });
  }
});

router.put("/:id", async (req, res) => {
  try {
    // Récupérer l'ID de la réservation depuis les paramètres de la requête
    const { id } = req.params;

    // Récupérer les données mises à jour de la réservation depuis le corps de la requête
    const updatedReservationData = req.body;

    // Mettre à jour la réservation par son ID avec les nouvelles données
    await Reservation.update(updatedReservationData, { where: { id } });

    // Répondre avec un message de succès
    res.status(200).json({ message: "Réservation mise à jour avec succès." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "Erreur serveur lors de la mise à jour de la réservation.",
      });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    // Récupérer l'ID de la réservation depuis les paramètres de la requête
    const { id } = req.params;

    // Supprimer la réservation par son ID
    await Reservation.destroy({ where: { id } });

    // Répondre avec un message de succès
    res.status(200).json({ message: "Réservation supprimée avec succès." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "Erreur serveur lors de la suppression de la réservation.",
      });
  }
});



// générer une facture pour une réservation
router.post("/:reservationId/factures", async (req, res) => {
  try {
    // Récupérer l'ID de la réservation depuis les paramètres de la requête
    const { reservationId } = req.params;

    // Vérifier si la réservation existe
    const reservation = await Reservation.findByPk(reservationId);
    if (!reservation) {
      return res.status(404).json({ message: "La réservation n'existe pas." });
    }

    // Créer la facture associée à la réservation
    const facture = await Facture.create({
      montant: req.body.montant, 
      mode_paiement_id: req.body.modePaiementId, 
      created_by: req.session.userID,
    });

    // Associer la facture à la réservation
    await reservation.addFacture(facture);

    res.status(201).json(facture);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la création de la facture." });
  }
});




export const ReservationRouter= router;
