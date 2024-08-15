import * as express from "express";
import { sequelize } from "../../../sequelize.js";

const router = express.Router();


// Route pour récupérer le nombre total de chambres
router.get('/total', async (req, res) => {
    try {
        const [result] = await sequelize.query('SELECT COUNT(*) AS total_chambres FROM Chambres');
        res.json(result[0]);
    } catch (error) {
        console.error("Erreur lors de la récupération du nombre total de chambres :", error);
        res.status(500).json({ message: "Erreur lors de la récupération des statistiques des chambres" });
    }
});

// Route pour récupérer le nombre de chambres occupées
router.get('/occupees', async (req, res) => {
    try {
        // À compléter : requête SQL pour récupérer le nombre de chambres occupées
        res.json({ message: "Route en cours de développement" });
    } catch (error) {
        console.error("Erreur lors de la récupération du nombre de chambres occupées :", error);
        res.status(500).json({ message: "Erreur lors de la récupération des statistiques des chambres occupées" });
    }
});

// Route pour récupérer le nombre de chambres disponibles
router.get('/disponibles', async (req, res) => {
    try {
        // À compléter : requête SQL pour récupérer le nombre de chambres disponibles
        res.json({ message: "Route en cours de développement" });
    } catch (error) {
        console.error("Erreur lors de la récupération du nombre de chambres disponibles :", error);
        res.status(500).json({ message: "Erreur lors de la récupération des statistiques des chambres disponibles" });
    }
});

// Route pour récupérer le prix moyen par nuit des chambres
router.get('/prix-moyen', async (req, res) => {
    try {
        // À compléter : requête SQL pour récupérer le prix moyen par nuit des chambres
        res.json({ message: "Route en cours de développement" });
    } catch (error) {
        console.error("Erreur lors de la récupération du prix moyen par nuit des chambres :", error);
        res.status(500).json({ message: "Erreur lors de la récupération des statistiques du prix moyen des chambres" });
    }
});


export const StatistiquesChambresRouter = router;
