import * as express from "express";
import { sequelize } from "../../../sequelize.js";

const router = express.Router();




// Route pour récupérer le nombre total de réservations
router.get("/total", async (req, res) => {
  try {
    const [result] = await sequelize.query(
      "SELECT COUNT(*) AS total_reservations FROM Reservations"
    );
    res.json(result[0]);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du nombre total de réservations :",
      error
    );
    res.status(500).json({
      message:
        "Erreur lors de la récupération des statistiques des réservations",
    });
  }
});

// Route pour récupérer le nombre de réservations par statut
router.get("/statut", async (req, res) => {
  try {
    const [result] = await sequelize.query(
      "SELECT statut, COUNT(*) AS nombre FROM Reservations GROUP BY statut"
    );
    res.json(result);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du nombre de réservations par statut :",
      error
    );
    res.status(500).json({
      message:
        "Erreur lors de la récupération des statistiques des réservations par statut",
    });
  }
});

// Route pour récupérer la durée moyenne des réservations
router.get("/duree-moyenne", async (req, res) => {
  try {
    const [result] = await sequelize.query(
      "SELECT AVG(DATEDIFF(dateFin, dateDebut)) AS duree_moyenne FROM Reservations"
    );
    res.json(result[0]);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de la durée moyenne des réservations :",
      error
    );
    res.status(500).json({
      message:
        "Erreur lors de la récupération des statistiques de durée moyenne des réservations",
    });
  }
});

// Route pour récupérer le revenu total généré par les réservations
router.get("/revenu-total", async (req, res) => {
  try {
    const [result] = await sequelize.query(
      "SELECT SUM(montant) AS revenu_total FROM Factures"
    );
    res.json(result[0]);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du revenu total généré par les réservations :",
      error
    );
    res.status(500).json({
      message:
        "Erreur lors de la récupération des statistiques de revenu total des réservations",
    });
  }
});


export const StatistiquesReservationsRouter = router