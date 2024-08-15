import * as express from "express";
import multer from "multer";
import { Image } from "./images.model.js";
import { v4 as uuidv4 } from "uuid";
import path from "path";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/images"); // Stockez les images dans un dossier appelé "uploads"
  },
  filename: function (req, file, cb) {
    // Remplacez les espaces dans le nom du fichier par des underscores
    const filename = uuidv4() + path.extname(file.originalname); // Ajoutez l'extension du fichier d'origine

    // const filename = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, filename);
  },
});

export const uploadImages = multer({
  storage: storage,
  // limits: { fileSize: 1000000 }, // Limite de taille des fichiers à 1 Mo
});

// Route pour supprimer une image par son ID
router.delete("/:id", async (req, res) => {
  try {
    const image = await Image.findByPk(req.params.id);
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    fs.unlinkSync(image.path);

    await image.destroy();

    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export const ImagesRouter = router;
