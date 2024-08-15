import * as express from "express";
import { sequelize } from "../../../sequelize.js";

const router = express.Router();


// Route pour récupérer le montant total des factures générées
router.get("/montant-total", async (req, res) => {
  try {
    const [result] = await sequelize.query(
      "SELECT SUM(montant) AS montant_total FROM Factures"
    );
    res.json(result[0]);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du montant total des factures :",
      error
    );
    res.status(500).json({
      message: "Erreur lors de la récupération des statistiques des factures",
    });
  }
});

// Route pour récupérer le montant moyen des factures
router.get("/montant-moyen", async (req, res) => {
  try {
    const [result] = await sequelize.query(
      "SELECT AVG(montant) AS montant_moyen FROM Factures"
    );
    res.json(result[0]);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du montant moyen des factures :",
      error
    );
    res.status(500).json({
      message:
        "Erreur lors de la récupération des statistiques du montant moyen des factures",
    });
  }
});

// Route pour récupérer le nombre de factures émises dans une période spécifique
router.get("/nombre-emises", async (req, res) => {
  try {
    // À compléter : requête SQL pour récupérer le nombre de factures émises dans une période spécifique
    res.json({ message: "Route en cours de développement" });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du nombre de factures émises :",
      error
    );
    res.status(500).json({
      message:
        "Erreur lors de la récupération des statistiques du nombre de factures émises",
    });
  }
});

export const StatistiquesFacturesRouter = router;
