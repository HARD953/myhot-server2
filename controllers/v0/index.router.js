import * as express from 'express';
import { UserRouter } from './users/routes/user.router.js';
import { PersonneRouter } from './personnes/personnes.router.js';
import { EtablissementRouter } from './etablissements/etabl.router.js';
import { ChambreRouter } from './chambres/chambre.router.js';
import { EquipementRouter } from './equipements/equipement.router.js';
import { ReservationRouter } from './reservations/reservation.router.js';
import { FactureRouter } from './factures/facture.router.js';
import { PermissionRouter } from './permissions/permission.router.js';
import { StatistiquesRouter } from './statistiques/statistiques.router.js';
import { ImagesRouter } from './images/images.router.js';


import { TypeEtablissementRouter } from './etablissements/TypeEtablissement.router.js';
import { TypeChambreRouter } from './chambres/typeChambre.router.js';
import { ModePaiementRouter } from './factures/modepaiement.router.js';
import { SiteRouter } from './siteControlleurs/site_router.js';
import { PaysRouter } from './utilsController/pays.router.js';
import { EvaluationRouter } from './Evaluations/Evaluation.router.js';

const router = express.Router();


router.use('/users', UserRouter);
router.use("/personnes", PersonneRouter);
router.use('/etablissements', EtablissementRouter);
router.use('/chambres/', ChambreRouter);
router.use("/evaluations", EvaluationRouter);
router.use('/equipements', EquipementRouter);
router.use('/reservations', ReservationRouter);
router.use('/factures', FactureRouter);
router.use('/permissions', PermissionRouter);

router.use("/type_chambres", TypeChambreRouter);
router.use("/Type_etablissements", TypeEtablissementRouter);
router.use("/mode_paiements", ModePaiementRouter);

router.use("/data_lists", PaysRouter);



router.use("/statistiques", StatistiquesRouter);

router.use("/images", ImagesRouter);

router.use("/site", SiteRouter);



router.get('/', async (req, res) => {
  res.send(`V0`);
});

export const IndexRouter = router;