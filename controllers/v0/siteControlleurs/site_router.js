import * as express from "express";
import {
  getAllChambres,
  getChambresByID,
  getDateFreeForReservationByChambre,
  getFilteredChambres,
  getReservationsAnnuleesByConnected,
  getReservationsEnAttentesByConnected,
  getReservationsEnCoursByConnected,
  getReservationsTermineesByConnected,
  getUserConnectedInformations,
} from "./site_controllers.js";
import { requireAuthorization } from "../users/routes/auth.router.js";
import {
  addFavoris,
  deleteFavoris,
  getFavorisByPersonne,
} from "../favoris/favoris.router.js";
import {
  getEvaluationsByChambreSum,
  getEvalutionsByChambre,
} from "../Evaluations/Evaluation.router.js";
const router = express.Router();

//Chambres
router.get("/chambres_libres", getAllChambres);
router.get("/chambres_libres/:id", getChambresByID);
router.get(
  "/chambres_libres/:id/periode_reservations",
  getDateFreeForReservationByChambre
);
router.get("/users/infos", requireAuthorization, getUserConnectedInformations);

router.get(
  "/reservations/me/en_cours",
  requireAuthorization,
  getReservationsEnCoursByConnected
);

router.get(
  "/reservations/me/en_attentes",
  requireAuthorization,
  getReservationsEnAttentesByConnected
);

router.get(
  "/reservations/me/annulees",
  requireAuthorization,
  getReservationsAnnuleesByConnected
);

router.get(
  "/reservations/me/terminees",
  requireAuthorization,
  getReservationsTermineesByConnected
);

router.post("/favoris", requireAuthorization, addFavoris);
router.get("/favoris", requireAuthorization, getFavorisByPersonne);
router.delete("/favoris/:chambreId", requireAuthorization, deleteFavoris);

router.get("/chambres/filtered", getFilteredChambres);

// toutes les evaluations d'une chambre en fonction de la valeur approuve en parametre
router.get("/evaluations/chambre/:id", getEvalutionsByChambre);

router.get(
  "/evaluations/chambre/:chambre_id/all_evaluations",
  getEvaluationsByChambreSum
);

export const SiteRouter = router;
