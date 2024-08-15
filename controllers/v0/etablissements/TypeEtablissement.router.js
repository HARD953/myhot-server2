import express from "express";
import { TypeEtablissement } from "./TypeEtablissement.model.js";
import { getUserIdFromToken, requireAuthorization } from "../users/routes/auth.router.js";
import { paginateResponse } from "../../../utils/utils.js";

const router = express.Router();

// Route pour créer un nouveau type d'établissement
router.post("/", requireAuthorization, async (req, res) => {
  try {
    const { type } = req.body;
    const created_by = getUserIdFromToken(req); 

    const typeEtablissement = await TypeEtablissement.create({
      type,
      created_by,
    });

    res.status(201).json(typeEtablissement);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur serveur lors de la création du type d'établissement.",
    });
  }
});

// Route pour récupérer tous les types d'établissement
router.get("/",requireAuthorization, async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const pageSize = parseInt(req.query.pageSize) || 10;
  try {

    const { results, pagination } = await paginateResponse(
      TypeEtablissement,
      page,
      pageSize
    );
    res.json({ results, pagination });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message:
        "Erreur serveur lors de la récupération des types d'établissement.",
    });
  }
});

// Route pour récupérer un type d'établissement par son ID
router.get("/:id",requireAuthorization, async (req, res) => {
  try {
    const typeEtablissement = await TypeEtablissement.findByPk(req.params.id);
    if (!typeEtablissement) {
      return res
        .status(404)
        .json({ message: "Type d'établissement non trouvé." });
    }
    res.json(typeEtablissement);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur serveur lors de la recherche du type d'établissement.",
    });
  }
});

// Route pour mettre à jour un type d'établissement par son ID
router.put("/:id",requireAuthorization, async (req, res) => {
  try {
    const typeEtablissement = await TypeEtablissement.findByPk(req.params.id);
    if (!typeEtablissement) {
      return res
        .status(404)
        .json({ message: "Type d'établissement non trouvé." });
    }

    const { type } = req.body;

    await typeEtablissement.update({
      type,
    });

    res.json({ message: "Type d'établissement mis à jour avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur serveur lors de la mise à jour du type d'établissement.",
    });
  }
});

// Route pour supprimer un type d'établissement par son ID
router.delete("/:id",requireAuthorization, async (req, res) => {
  try {
    const typeEtablissement = await TypeEtablissement.findByPk(req.params.id);
    if (!typeEtablissement) {
      return res
        .status(404)
        .json({ message: "Type d'établissement non trouvé." });
    }

    await typeEtablissement.destroy();
    res.json({ message: "Type d'établissement supprimé avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur serveur lors de la suppression du type d'établissement.",
    });
  }
});

export const TypeEtablissementRouter = router;
