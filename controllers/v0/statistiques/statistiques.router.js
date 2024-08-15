// import * as Sequelize from "sequelize";
import * as express from "express";
import { StatistiquesChambresRouter } from "./statistique.Chambres.router.js";
import { StatistiquesEtablissementsRouter } from "./statistique.Etablissements.router.js";
import { StatistiquesFacturesRouter } from "./statistique.Factures.router.js";
import { StatistiquesReservationsRouter } from "./statistique.Reservations.router.js";

import { Reservation } from "../reservations/reservation.model.js";
import { Facture } from "../factures/facture.model.js";
import { Chambre } from "../chambres/chambre.model.js";
import { Etablissement } from "../etablissements/etabl.model.js";
import { sequelize } from "../../../sequelize.js";


const router = express.Router();


router.use("/chambres", StatistiquesChambresRouter);
router.use("/etablissements", StatistiquesEtablissementsRouter);
router.use("/factures", StatistiquesFacturesRouter);
router.use("/reservations", StatistiquesReservationsRouter);
router.use("/chambres", StatistiquesChambresRouter);



router.get("/evolution-recettes-mois", async (req, res) => {
  try {
    // Liste de tous les mois de janvier à décembre
    const tous_les_mois = [
      "janvier",
      "février",
      "mars",
      "avril",
      "mai",
      "juin",
      "juillet",
      "août",
      "septembre",
      "octobre",
      "novembre",
      "décembre",
    ];
    const statistiques_montants_par_mois = await Facture.findAll({
      attributes: [
        [sequelize.literal(`TO_CHAR("dateDebut", 'YYYY-MM')`), "mois"],
        [sequelize.fn("SUM", sequelize.col("montant")), "montant_total"],
      ],
      include: [
        {
          model: Reservation,
          attributes: [],
          include: [{ model: Chambre, attributes: [] }],
        },
      ],
      group: [sequelize.literal(`TO_CHAR("dateDebut", 'YYYY-MM')`)],
      order: [sequelize.literal(`TO_CHAR("dateDebut", 'YYYY-MM')`)],
    });

    const montants_par_mois = {};
    statistiques_montants_par_mois.forEach((item) => {
      const mois = new Date(item.dataValues.mois + "-01").getMonth();
      montants_par_mois[mois] = item.dataValues.montant_total;
    });

    const valeurs = tous_les_mois.map(
      (mois, index) => montants_par_mois[index] || 0
    );

    const resultat_formate = { mois: tous_les_mois, valeurs };

    res.json(resultat_formate);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des statistiques sur l'évolution des réservations par mois :",
      error
    );
    res.status(500).json({
      message:
        "Erreur lors de la récupération des statistiques sur l'évolution des réservations par mois",
    });
  }
});



router.get("/evolution-reservations-mois",async(req,res)=>{
    try {
             const tous_les_mois = [
               "janvier",
               "février",
               "mars",
               "avril",
               "mai",
               "juin",
               "juillet",
               "août",
               "septembre",
               "octobre",
               "novembre",
               "décembre",
             ];

             
             const statistiques_reservations_par_mois =
               await Reservation.findAll({
                 attributes: [
                   [
                     sequelize.literal(`TO_CHAR("dateDebut", 'YYYY-MM')`),
                     "mois",
                   ],
                   [
                     sequelize.fn("COUNT", sequelize.col("id")),
                     "nombre_reservations",
                   ],
                 ],
                 group: [sequelize.literal(`TO_CHAR("dateDebut", 'YYYY-MM')`)],
                 order: [sequelize.literal(`TO_CHAR("dateDebut", 'YYYY-MM')`)],
               });
               

             const reservations_par_mois = {};
             statistiques_reservations_par_mois.forEach((item) => {
               const mois = new Date(item.dataValues.mois + "-01").getMonth();
               reservations_par_mois[mois] =
                 item.dataValues.nombre_reservations;
             });

             
             const valeurs = tous_les_mois.map(
               (mois, index) => parseInt(reservations_par_mois[index]) || 0
             );

             const resultat_formate = { mois: tous_les_mois, valeurs };

             res.json(resultat_formate);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des statistiques sur l'évolution des réservations par mois :",
        error
      );
      res
        .status(500)
        .json({
          message:
            "Erreur lors de la récupération des statistiques sur l'évolution des réservations par mois",
        });
    }
})

router.get("/statistiques-generales", async (req, res) => {
  try {
    const total_reservations = await Reservation.count();
    const reservations_en_cours = await Reservation.count({
      where: { statut: "en_cours" },
    });
    const reservations_en_attente = await Reservation.count({
      where: { statut: "en_attente" },
    });
    const reservations_annulees = await Reservation.count({
      where: { statut: "annulee" },
    });
    const reservations_terminees = await Reservation.count({
      where: { statut: "terminee" },
    });

    const duree_moyenne_reservations = await sequelize.query(`
    SELECT AVG(EXTRACT(EPOCH FROM "dateFin" - "dateDebut") / (3600 * 24)) AS "duree_moyenne"
    FROM "Reservations";
`);

    const duree_moyenne = duree_moyenne_reservations[0][0].duree_moyenne;

    const revenu_total = await Facture.sum("montant");
    const total_clients = await Client.count();
    const total_chambres = await Chambre.count();
    const chambres_occupees = await Chambre.count({ where: { occupee: true } });
    const chambres_disponibles = await Chambre.count({
      where: { occupee: false },
    });

    const prix_moyen_nuit_chambre = await Chambre.findOne({
      attributes: [
        [sequelize.fn("AVG", sequelize.col("prixParNuit")), "prix_moyen"],
      ],
    });

    const total_etablissements = await Etablissement.count();
    // const nombre_moyen_chambres_etablissement = await Etablissement.findOne({
    //   attributes: [
    //     [sequelize.fn("AVG", sequelize.col("nombreChambres")), "nombre_moyen"],
    //   ],
    // });

    const total_gerants = await Gerant.count();

    const statistiques = {
      total_reservations,
      reservations_en_cours,
      reservations_en_attente,
      reservations_annulees,
      reservations_terminees,
      duree_moyenne_reservations: duree_moyenne || 0,
      revenu_total,
      total_clients,
      total_chambres,
      chambres_occupees,
      chambres_disponibles,
      prix_moyen_nuit_chambre: prix_moyen_nuit_chambre.prix_moyen || 0,
      total_etablissements,
    //   nombre_moyen_chambres_etablissement:
    //     nombre_moyen_chambres_etablissement.nombre_moyen || 0,
      total_gerants,
    };

    res.json(statistiques);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des statistiques générales :",
      error
    );
    res
      .status(500)
      .json({
        message: "Erreur lors de la récupération des statistiques générales",
      });
  }
});

export const StatistiquesRouter = router