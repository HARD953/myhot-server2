import * as express from "express";
import { CommuneList, PaysList, RegionList, VilleList } from "./pays.model.js";

import * as Sequelize from "sequelize";
import { sequelize } from "../../../sequelize.js";
const router = express.Router();




// PAYS
router.get("/pays", async (req, res) => {
  const pays = await PaysList.findAll();
  res.json(pays);
});

router.get("/pays/:id", async (req, res) => {
  const pay = await PaysList.findByPk(req.params.id);
  res.json(pay);
});

router.post("/pays", async (req, res) => {
  const newPay = await PaysList.create(req.body);
  res.json(newPay);
});

router.put("/pays/:id", async (req, res) => {
  await PaysList.update(req.body, { where: { id: req.params.id } });
  res.json({ success: true });
});

router.delete("/pays/:id", async (req, res) => {
  await PaysList.destroy({ where: { id: req.params.id } });
  res.json({ success: true });
});




// Regions
router.get("/regions", async (req, res) => {
  const regions = await RegionList.findAll();
  res.json(regions);
});

router.get("/regions/:id", async (req, res) => {
  const regions = await RegionList.findByPk(req.params.id);
  res.json(regions);
});

router.post("/regions", async (req, res) => {
  const regions = await RegionList.create(req.body);
  res.json(regions);
});

router.put("/regions/:id", async (req, res) => {
  await RegionList.update(req.body, { where: { id: req.params.id } });
  res.json({ success: true });
});

router.delete("/regions/:id", async (req, res) => {
  await RegionList.destroy({ where: { id: req.params.id } });
  res.json({ success: true });
});

router.post("/regions_all", async (req, res) => {
  try {
    const paysData = req.body;
    const transaction = await sequelize.transaction();
    const paysEnregistres = await RegionList.bulkCreate(paysData, {
      transaction,
    });
    await transaction.commit();
    res.status(201).json({ message: "Données enregistrées avec succès" });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Erreur lors de l'enregistrement des données :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de l'enregistrement des données" });
  }
});


// VILLE
router.get("/villes", async (req, res) => {
  const villes = await VilleList.findAll();
  res.json(villes);
});

router.get("/villes/:id", async (req, res) => {
  const ville = await VilleList.findByPk(req.params.id);
  res.json(ville);
});

router.post("/villes", async (req, res) => {
  const newVille = await VilleList.create(req.body);
  res.json(newVille);
});

router.put("/villes/:id", async (req, res) => {
  await VilleList.update(req.body, { where: { id: req.params.id } });
  res.json({ success: true });
});

router.delete("/villes/:id", async (req, res) => {
  await VilleList.destroy({ where: { id: req.params.id } });
  res.json({ success: true });
});

router.post("/villes_all", async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const villesData = req.body;
    const villesEnregistres = await VilleList.bulkCreate(villesData, {
      transaction,
    });
    await transaction.commit();
    res.status(201).json({ message: "Données enregistrées avec succès" });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Erreur lors de l'enregistrement des données :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de l'enregistrement des données" });
  }
});


// COMMUNE
router.get("/communes", async (req, res) => {
  const communes = await CommuneList.findAll();
  res.json(communes);
});

router.get("/communes/:id", async (req, res) => {
  const commune = await CommuneList.findByPk(req.params.id);
  res.json(commune);
});

router.post("/communes", async (req, res) => {
  const newCommune = await CommuneList.create(req.body);
  res.json(newCommune);
});

router.put("/communes/:id", async (req, res) => {
  await CommuneList.update(req.body, { where: { id: req.params.id } });
  res.json({ success: true });
});

router.delete("/communes/:id", async (req, res) => {
  await CommuneList.destroy({ where: { id: req.params.id } });
  res.json({ success: true });
});

export const PaysRouter = router;
