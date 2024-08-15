import express from "express";
import { Equipement } from "./equipement.model.js";
import {
  getUserIdFromToken,
  requireAuthorization,
} from "../users/routes/auth.router.js";
import { User } from "../users/models/User.js";
import { paginateResponse } from "../../../utils/utils.js";

const router = express.Router();

// Create Equipement
router.post("/", requireAuthorization, async (req, res) => {
  try {
    const userID = getUserIdFromToken(req);
    const user = await User.findByPk(userID);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }
    const { icon, titre, description } = req.body;
    const equipement = await Equipement.create({
      icon,
      titre,
      description,
      created_by: user.personne_id,
    });
    res.status(201).json(equipement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Read all Equipements
router.get("/", requireAuthorization, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const queries = {
      order: [["createdAt", "DESC"]],
    };

    const { results, pagination } = await paginateResponse(
      Equipement,
      page,
      pageSize,
      queries
    );

    res.json({ results, pagination });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Read Equipement by ID
router.get("/:id", async (req, res) => {
  try {
    const equipement = await Equipement.findByPk(req.params.id);
    if (!equipement) {
      res.status(404).json({ message: "Equipement not found" });
    } else {
      res.json(equipement);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Equipement
router.put("/:id", async (req, res) => {
  try {
    const equipement = await Equipement.findByPk(req.params.id);
    if (!equipement) {
      res.status(404).json({ message: "Equipement not found" });
    } else {
      await equipement.update(req.body);
      res.json(equipement);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete Equipement
router.delete("/:id", async (req, res) => {
  try {
    const equipement = await Equipement.findByPk(req.params.id);
    if (!equipement) {
      res.status(404).json({ message: "Equipement not found" });
    } else {
      await equipement.destroy();
      res.status(204).end();
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export const EquipementRouter = router;
