import express from 'express';
import { Facture } from './facture.model.js';
import { Reservation } from '../reservations/reservation.model.js';
import { Chambre } from '../chambres/chambre.model.js';
import { User } from '../users/models/User.js';
import { getUserIdFromToken, requireAuthorization } from '../users/routes/auth.router.js';
import { Etablissement } from '../etablissements/etabl.model.js';
import { PersonneEtablissement } from '../personnes/personneEtabl.model.js';
import { Personne } from '../personnes/personnes.model.js';

const router = express.Router();

// Create Facture
router.post('/', async (req, res) => {
  try {
    const facture = await Facture.create(req.body);
    res.status(201).json(facture);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/",requireAuthorization, async (req, res) => {
  try {
    // Récupérer l'ID de l'utilisateur connecté
    const userID = getUserIdFromToken(req);
    const user = await User.findByPk(userID);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    
        const factures = await Facture.findAll({
          include: [
            {
              model: Reservation,
              as: "reservation",
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
            },
          ],
        });
    res.status(200).json(factures);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "Erreur serveur lors de la récupération des factures.",
      });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const facture = await Facture.findByPk(req.params.id);
    if (!facture) {
      return res.status(404).json({ message: "Facture non trouvée." });
    }
    res.status(200).json(facture);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "Erreur serveur lors de la récupération de la facture.",
      });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const facture = await Facture.findByPk(req.params.id);
    if (!facture) {
      return res.status(404).json({ message: "Facture non trouvée." });
    }
    const { montant, modePaiementId } = req.body;
    await facture.update({ montant, mode_paiement_id: modePaiementId });
    res.json({ message: "Facture mise à jour avec succès." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "Erreur serveur lors de la mise à jour de la facture.",
      });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const facture = await Facture.findByPk(req.params.id);
    if (!facture) {
      return res.status(404).json({ message: "Facture non trouvée." });
    }
    await facture.destroy();
    res.json({ message: "Facture supprimée avec succès." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "Erreur serveur lors de la suppression de la facture.",
      });
  }
});


export const FactureRouter= router;
