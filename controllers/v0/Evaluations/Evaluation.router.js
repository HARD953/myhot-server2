import express from "express";
import { Evaluation } from "./Evaluation.model.js";
import {
  getUserIdFromToken,
  requireAuthorization,
} from "../users/routes/auth.router.js";
import { paginateResponse } from "../../../utils/utils.js";
import { Chambre } from "../chambres/chambre.model.js";
import { Personne } from "../personnes/personnes.model.js";
import { TypeChambre } from "../chambres/TypeChambre.model.js";
import { User } from "../users/models/User.js";
import { sequelize } from "../../../sequelize.js";

const router = express.Router();

// =========== Fonctions ===============

const getEvalutionsBystatus = async (request, approuve) => {
  const page = parseInt(request.query.page) || 1;
  const pageSize = parseInt(request.query.pageSize) || 10;
  const queries = {
    where: {
      approuve: approuve,
    },
    include: [
      {
        model: Chambre,
        as: "chambre",
        include: [
          {
            model: TypeChambre,
            as: "type_chambre",
          },
        ],
      },
      {
        model: Personne,
        as: "client",
      },
    ],
  };
  const { results, pagination } = await paginateResponse(
    Evaluation,
    page,
    pageSize,
    queries
  );
  return { results, pagination };
};





export const getEvalutionsByChambre = async(req,res)=>{
   try {
    const approuve = req.query.approuve || null;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const queries = {
      where: {
        approuve: approuve,
        chambre_id: req.params.id,
      },
      include: [
        {
          model: Chambre,
          as: "chambre",
          include: [
            {
              model: TypeChambre,
              as: "type_chambre",
            },
          ],
        },
        {
          model: Personne,
          as: "client",
        },
      ],
    };
    const { results, pagination } = await paginateResponse(
      Evaluation,
      page,
      pageSize,
      queries
    );

    res.json({ results, pagination });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


export const getEvaluationsByChambreSum = async (req, res) => {
  const { chambre_id } = req.params;
  const approuve = req.query.approuve;
  try {
    const results = await Evaluation.findAll({
      where: {
        chambre_id,
        approuve,
      },
      attributes: [
        [sequelize.literal("COALESCE(SUM(note_proprete), 1)"), "note_proprete"],
        [
          sequelize.literal("COALESCE(SUM(note_service_client), 1)"),
          "note_service_client",
        ],
        [sequelize.literal("COALESCE(SUM(note_confort), 1)"), "note_confort"],
        [
          sequelize.literal("COALESCE(SUM(note_equipements), 1)"),
          "note_equipements",
        ],
        [
          sequelize.literal("COALESCE(SUM(note_localisation), 1)"),
          "note_localisation",
        ],
        [
          sequelize.literal("COALESCE(SUM(note_valeur_argent), 1)"),
          "note_valeur_argent",
        ],
        [sequelize.literal("COALESCE(SUM(note_securite), 1)"), "note_securite"],
      ],
    });

    const totalSums = results[0].dataValues;

    res.status(200).json(totalSums);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ========================= ENDPOINTS ==================
// Create
router.post("/", requireAuthorization, async (req, res) => {
  try {
    const {
      note_proprete,
      note_service_client,
      note_confort,
      note_equipements,
      note_localisation,
      note_valeur_argent,
      note_securite,
      commentaire,
      chambre_id,
      personne_id,
    } = req.body;
    const evaluation = await Evaluation.create({
      note_proprete,
      note_service_client,
      note_confort,
      note_equipements,
      note_localisation,
      note_valeur_argent,
      note_securite,
      commentaire,
      chambre_id,
      personne_id,
    });
    res.status(201).json(evaluation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Read all
router.get("/", requireAuthorization, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const queries = {
      where: {
        approuve: null,
      },
      include: [
        {
          model: Chambre,
          as: "chambre",
          include: [
            {
              model: TypeChambre,
              as: "type_chambre",
            },
          ],
        },
        {
          model: Personne,
          as: "client",
        },
      ],
    };
    const { results, pagination } = await paginateResponse(
      Evaluation,
      page,
      pageSize,
      queries
    );

    res.json({ results, pagination });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Read by ID
router.get("/:id", async (req, res) => {
  try {
    const evaluation = await Evaluation.findByPk(req.params.id, {
      include: [
        {
          model: Chambre,
          as: "chambre",
          include: [
            {
              model: TypeChambre,
              as: "type_chambre",
            },
          ],
        },
        {
          model: Personne,
          as: "client",
        },
      ],
    });
    if (!evaluation) {
      res.status(404).json({ message: "Evaluation not found" });
    } else {
      res.json(evaluation);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update
router.put("/:id", async (req, res) => {
  try {
    const evaluation = await Evaluation.findByPk(req.params.id);
    if (!evaluation) {
      res.status(404).json({ message: "Evaluation not found" });
    } else {
      await evaluation.update(req.body);
      res.json(evaluation);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete
router.delete("/:id", async (req, res) => {
  try {
    const evaluation = await Evaluation.findByPk(req.params.id);
    if (!evaluation) {
      res.status(404).json({ message: "Evaluation not found" });
    } else {
      await evaluation.destroy();
      res.status(204).end();
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// evalutions acceptées
router.get("/status/accepted", requireAuthorization, async (req, res) => {
  try {
    const userID = getUserIdFromToken(req);
    const user = await User.findByPk(userID);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }
    const { results, pagination } = await getEvalutionsBystatus(req, true);
    res.json({ results, pagination });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Evalutaions rejetées
router.get("/status/refused", requireAuthorization, async (req, res) => {
  try {
    const userID = getUserIdFromToken(req);
    const user = await User.findByPk(userID);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }
    const { results, pagination } = await getEvalutionsBystatus(req, false);
    res.json({ results, pagination });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Evaluation change approuve
router.patch("/:id/approuve", requireAuthorization, async (req, res) => {
  try {
    const userID = getUserIdFromToken(req);
    const user = await User.findByPk(userID);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }
    const evaluation = await Evaluation.findByPk(req.params.id);
    if (!evaluation) {
      res.status(404).json({ message: "Evaluation not found" });
    } else {
      const { approuve } = req.body;
      await evaluation.update({
        approuve: approuve,
        approuve_by: user.personne_id,
        approuve_date: new Date(),
      });
      res.json(evaluation);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// toutes les evaluations d'une chambre en fonction de la valeur approuve en parametre
router.get("/chambre/:id",getEvalutionsByChambre);

router.get(
  "/chambre/:chambre_id/all_evaluations",
  requireAuthorization,
  getEvaluationsByChambreSum
);

export const EvaluationRouter = router;
