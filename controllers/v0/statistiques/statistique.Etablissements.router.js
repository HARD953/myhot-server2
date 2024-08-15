import * as express from "express";
import { sequelize } from "../../../sequelize.js";

const router = express.Router();






// Route pour récupérer le nombre total d'établissements
router.get('/total', async (req, res) => {
    try {
        const [result] = await sequelize.query('SELECT COUNT(*) AS total_etablissements FROM Etablissements');
        res.json(result[0]);
    } catch (error) {
        console.error("Erreur lors de la récupération du nombre total d'établissements :", error);
        res.status(500).json({ message: "Erreur lors de la récupération des statistiques des établissements" });
    }
});

// Route pour récupérer le nombre d'établissements par région ou par catégorie
router.get('/par-region', async (req, res) => {
    try {
        // À compléter : requête SQL pour récupérer le nombre d'établissements par région
        res.json({ message: "Route en cours de développement" });
    } catch (error) {
        console.error("Erreur lors de la récupération du nombre d'établissements par région :", error);
        res.status(500).json({ message: "Erreur lors de la récupération des statistiques des établissements par région" });
    }
});

// Route pour récupérer le nombre moyen de chambres par établissement
router.get('/nombre-moyen-chambres', async (req, res) => {
    try {
        // À compléter : requête SQL pour récupérer le nombre moyen de chambres par établissement
        res.json({ message: "Route en cours de développement" });
    } catch (error) {
        console.error("Erreur lors de la récupération du nombre moyen de chambres par établissement :", error);
        res.status(500).json({ message: "Erreur lors de la récupération des statistiques du nombre moyen de chambres par établissement" });
    }
});
export const StatistiquesEtablissementsRouter = router;
