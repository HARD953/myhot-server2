import express from "express";
import { TypeChambre } from "./TypeChambre.model.js";
import { getUserIdFromToken, requireAuthorization } from "../users/routes/auth.router.js";
import { paginateResponse } from "../../../utils/utils.js";


const router = express.Router();


router.post("/",requireAuthorization, async (req, res) => {
  try {
    const { type } = req.body;
    const created_by = getUserIdFromToken(req); 

    // Créer un nouveau type de chambre
    const typeChambre = await TypeChambre.create({ type, created_by });

    res.status(201).json(typeChambre);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "Erreur serveur lors de la création du type de chambre.",
      });
  }
});

router.get("/", requireAuthorization, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  try {

    const { results, pagination} = await paginateResponse(TypeChambre,page,pageSize)
    res.json({ results,  pagination});

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message:
        "Erreur serveur lors de la récupération des types d'établissement.",
    });
  }
});



router.get("/:id",requireAuthorization, async (req, res) => {
  try {
    const typeChambre = await TypeChambre.findByPk(req.params.id);
    if (!typeChambre) {
      return res.status(404).json({ message: "Type de chambre non trouvé." });
    }
    res.json(typeChambre);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "Erreur serveur lors de la récupération du type de chambre.",
      });
  }
});



router.put("/:id",requireAuthorization, async (req, res) => {
  try {
    const { type } = req.body;
    const typeChambre = await TypeChambre.findByPk(req.params.id);
    if (!typeChambre) {
      return res.status(404).json({ message: "Type de chambre non trouvé." });
    }
    await typeChambre.update({ type });
    res.json({ message: "Type de chambre mis à jour avec succès." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "Erreur serveur lors de la mise à jour du type de chambre.",
      });
  }
});


router.delete("/:id",requireAuthorization, async (req, res) => {
  try {
    const typeChambre = await TypeChambre.findByPk(req.params.id);
    if (!typeChambre) {
      return res.status(404).json({ message: "Type de chambre non trouvé." });
    }
    await typeChambre.destroy();
    res.json({ message: "Type de chambre supprimé avec succès." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "Erreur serveur lors de la suppression du type de chambre.",
      });
  }
});


export const TypeChambreRouter = router;
