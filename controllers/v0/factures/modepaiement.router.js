import express from "express";
import { ModePaiement } from "./modePaiement.model.js";

const router = express.Router();


router.post("/", async (req, res) => {
  try {
    const { nom, created_by } = req.body;

    // Créer un nouveau mode de paiement
    const modePaiement = await ModePaiement.create({ nom, created_by });

    res.status(201).json(modePaiement);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "Erreur serveur lors de la création du mode de paiement.",
      });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const modePaiement = await ModePaiement.findByPk(req.params.id);
    if (!modePaiement) {
      return res.status(404).json({ message: "Mode de paiement non trouvé." });
    }
    res.json(modePaiement);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "Erreur serveur lors de la récupération du mode de paiement.",
      });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { nom } = req.body;
    const modePaiement = await ModePaiement.findByPk(req.params.id);
    if (!modePaiement) {
      return res.status(404).json({ message: "Mode de paiement non trouvé." });
    }
    await modePaiement.update({ nom });
    res.json({ message: "Mode de paiement mis à jour avec succès." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "Erreur serveur lors de la mise à jour du mode de paiement.",
      });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const modePaiement = await ModePaiement.findByPk(req.params.id);
    if (!modePaiement) {
      return res.status(404).json({ message: "Mode de paiement non trouvé." });
    }
    await modePaiement.destroy();
    res.json({ message: "Mode de paiement supprimé avec succès." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "Erreur serveur lors de la suppression du mode de paiement.",
      });
  }
});

export const ModePaiementRouter = router;
