import { sequelize } from "../../../sequelize.js";
import * as Sequelize from "sequelize";
import { paginateResponse } from "../../../utils/utils.js";
import { TypeChambre } from "../chambres/TypeChambre.model.js";
import { Chambre } from "../chambres/chambre.model.js";
import { TypeEtablissement } from "../etablissements/TypeEtablissement.model.js";
import { Etablissement } from "../etablissements/etabl.model.js";
import { Image } from "../images/images.model.js";
import { Personne } from "../personnes/personnes.model.js";
import { Reservation } from "../reservations/reservation.model.js";
import { User } from "../users/models/User.js";
import { getUserIdFromToken } from "../users/routes/auth.router.js";
import { PaysList, VilleList } from "../utilsController/pays.model.js";

const Op = Sequelize.Op;

//Liste de toutes les chambres
export const getAllChambres = async (req, res) => {
  try {
    const { prix_min, prix_max } = req.query;

    const filters = {};

    if (prix_min) {
      filters.prix_nuit = { ...filters.prix_nuit, [Op.gte]: prix_min };
    }
    if (prix_max) {
      filters.prix_nuit = { ...filters.prix_nuit, [Op.lte]: prix_max };
    }

    const chambres = await Chambre.findAll({
      where: filters,
      include: [
        {
          model: Image,
          as: "images",
        },
        {
          model: Etablissement,
          as: "etablissement",
          include: [
            {
              model: PaysList,
              as: "pays",
            },
            {
              model: VilleList,
              as: "ville",
            },
          ],
        },
        {
          model: TypeChambre,
          as: "type_chambre",
        },
      ],
      order: sequelize.random(),
    });
    res.status(200).json(chambres);
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Une erreur est survenue lors de la récupération des chambres.",
      });
  }
};

//recuperer une chambre par son id
export const getChambresByID = async (req, res) => {
  try {
    const chambre_id = req.params?.id;
    const chambre = await Chambre.findByPk(chambre_id, {
      include: [
        {
          model: Image,
          as: "images",
        },
        {
          model: Etablissement,
          as: "etablissement",
        },
        {
          model: TypeChambre,
          as: "type_chambre",
        },
      ],
    });
    res.status(200).json(chambre);
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Une erreur est survenue lors de la récupération des chambres.",
      });
  }
};

//recuperer une chambre par son id
export const getDateFreeForReservationByChambre = async (req, res) => {
  try {
    const chambre_id = req.params?.id;

    const reservations = await Reservation.findAll({
      where: { chambre_id: chambre_id },
      attributes: ["date_debut", "date_fin"],
    });

    res.status(200).json(reservations);
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Une erreur est survenue lors de la récupération des chambres.",
      });
  }
};

// Route pour récupérer un utilisateur par son ID
export const getUserConnectedInformations = async (req, res) => {
  try {
    const userID = getUserIdFromToken(req);

    const user = await User.findByPk(userID, {
      attributes: {
        exclude: ["password"],
      },
      include: [
        {
          model: Personne,
          as: "personne",
        },
      ],
    });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getReservationsEnAttentesByConnected = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const userID = getUserIdFromToken(req);
    const user = await User.findByPk(userID);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    const queries = {
      where: {
        personne_id: user?.personne_id,
        is_waitting: true,
        is_confirmed: false,
        is_cancelled: false,
        is_completed: false,
      },
      include: [
        {
          model: Personne,
          as: "client",
        },
        {
          model: Chambre,
          as: "chambre",
          include: [
            {
              model: Etablissement,
              as: "etablissement",
              include: {
                model: TypeEtablissement,
                as: "type_etablissement",
              },
            },
            {
              model: Image,
              as: "images",
            },
          ],
        },
      ],
    };
    const { results, pagination } = await paginateResponse(
      Reservation,
      page,
      pageSize,
      queries
    );

    res.json({ results, pagination });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur serveur lors de la récupération des réservations.",
    });
  }
};

export const getReservationsEnCoursByConnected = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const userID = getUserIdFromToken(req);
    const user = await User.findByPk(userID);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    const queries = {
      where: {
        personne_id: user?.personne_id,
        is_waitting: false,
        is_confirmed: true,
        is_cancelled: false,
        is_completed: false,
      },
      include: [
        {
          model: Personne,
          as: "client",
        },
        {
          model: Chambre,
          as: "chambre",
          include: [
            {
              model: Etablissement,
              as: "etablissement",
              include: {
                model: TypeEtablissement,
                as: "type_etablissement",
              },
            },
            {
              model: Image,
              as: "images",
            },
          ],
        },
      ],
    };
    const { results, pagination } = await paginateResponse(
      Reservation,
      page,
      pageSize,
      queries
    );

    res.json({ results, pagination });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur serveur lors de la récupération des réservations.",
    });
  }
};

export const getReservationsAnnuleesByConnected = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const userID = getUserIdFromToken(req);
    const user = await User.findByPk(userID);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    const queries = {
      where: {
        personne_id: user?.personne_id,
        is_waitting: false,
        is_confirmed: false,
        is_cancelled: true,
        is_completed: false,
      },
      include: [
        {
          model: Personne,
          as: "client",
        },
        {
          model: Chambre,
          as: "chambre",
          include: [
            {
              model: Etablissement,
              as: "etablissement",
              include: {
                model: TypeEtablissement,
                as: "type_etablissement",
              },
            },
            {
              model: Image,
              as: "images",
            },
          ],
        },
      ],
    };
    const { results, pagination } = await paginateResponse(
      Reservation,
      page,
      pageSize,
      queries
    );

    res.json({ results, pagination });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur serveur lors de la récupération des réservations.",
    });
  }
};

export const getReservationsTermineesByConnected = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const userID = getUserIdFromToken(req);
    const user = await User.findByPk(userID);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    const queries = {
      where: {
        personne_id: user?.personne_id,
        is_waitting: false,
        is_confirmed: true,
        is_cancelled: false,
        is_completed: true,
      },
      include: [
        {
          model: Personne,
          as: "client",
        },
        {
          model: Chambre,
          as: "chambre",
          include: [
            {
              model: Etablissement,
              as: "etablissement",
              include: {
                model: TypeEtablissement,
                as: "type_etablissement",
              },
            },
            {
              model: Image,
              as: "images",
            },
          ],
        },
      ],
    };
    const { results, pagination } = await paginateResponse(
      Reservation,
      page,
      pageSize,
      queries
    );

    res.json({ results, pagination });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur serveur lors de la récupération des réservations.",
    });
  }
};

export const getFilteredChambres = async (req, res) => {
  try {
    const { prix_min, prix_max } = req.query;

    const filters = {};

    if (prix_min) {
      filters.prix_nuit = { ...filters.prix_nuit, [Op.gte]: prix_min };
    }
    if (prix_max) {
      filters.prix_nuit = { ...filters.prix_nuit, [Op.lte]: prix_max };
    }
    // if (ville) {
    //   filters["$etablissement.ville$"] = ville;
    // }
    // if (type_id) {
    //   filters.type_id = type_id;
    // }

    const chambreCount = await Chambre.count({
      where: filters,
      include: [
        {
          model: Etablissement,
          as: "etablissement",
        },
        {
          model: TypeChambre,
          as: "type_chambre",
        },
      ],
    });

    res.status(200).json({ count: chambreCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la récupération des chambres.",
    });
  }
};
