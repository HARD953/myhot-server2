import { TypeChambre } from "../chambres/TypeChambre.model.js";
import { Chambre } from "../chambres/chambre.model.js";
import { Etablissement } from "../etablissements/etabl.model.js";
import { Image } from "../images/images.model.js";
import { User } from "../users/models/User.js";
import { getUserIdFromToken } from "../users/routes/auth.router.js";
import { Favoris } from "./favoris.model.js";


export const addFavoris = async (req, res) => {
  try {
    const { chambreId } = req.body;
    const userID = getUserIdFromToken(req);
    const user = await User.findByPk(userID);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    const favoris = await Favoris.create({
      chambre_id: chambreId,
      personne_id: user.personne_id,
      created_by: userID,
    });

    res.status(201).json(favoris);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de l'ajout aux favoris." });
  }
};


export const getFavorisByPersonne = async (req, res) => {
  try {
    const userID = getUserIdFromToken(req);
    const user = await User.findByPk(userID);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    const favoris = await Favoris.findAll({
      where: { personne_id: user.personne_id },
      include: [
        {
          model: Chambre,
          as: "chambre",
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
        },
      ],
    });

    res.status(200).json(favoris);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la récupération des favoris." });
  }
};



export const deleteFavoris = async (req, res) => {
  try {
    const { chambreId } = req.params;
    const userID = getUserIdFromToken(req); 
    const user = await User.findByPk(userID);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    await Favoris.destroy({
      where: {
        chambre_id: chambreId,
        personne_id: user.personne_id,
      },
    });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la suppression des favoris." });
  }
};
