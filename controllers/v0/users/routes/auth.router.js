import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as express from "express";

import * as Sequelize from "sequelize";
import * as EmailValidator from "email-validator";

import * as c from "../../../../configs/config.js";
import { User } from "../models/User.js";
import {
  validateDataAddCompte,
  validateDataLogin,
  validateDataSignup,
} from "../../../../middlewares/validators.js";
import { Personne } from "../../personnes/personnes.model.js";
import { BlacklistJWT } from "../models/blackListJWT.js";
import { sequelize } from "../../../../sequelize.js";

const router = express.Router();
const Op = Sequelize.Op;

// Générer un sel à partir du mot de passe
export async function generatePassword(passwordPlainText) {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  return await bcrypt.hash(passwordPlainText, salt);
}

// Comparer deux mots de passe
export async function comparePassword(passwordPlainText, hash) {
  return await bcrypt.compare(passwordPlainText, hash);
}

// Générer une signature JWT
export function generateJWT(user) {
  const payload = { userId: user.id };
  const options = { expiresIn: "1h" }; // Token will expire in 1 hour
  return jwt.sign(payload, c.config.jwt.secret, options);
}

// Middleware pour vérifier l'autorisation
export async function requireAuthorization(req, res, next) {
  if (!req.headers || !req.headers.authorization) {
    return res.status(401).json({ message: "Pas d'entête d'autorisation" });
  }

  const tokenBearer = req.headers.authorization.split(" ");
  if (tokenBearer.length !== 2 || tokenBearer[0] !== "Bearer") {
    return res.status(401).json({ message: "Token mal formaté." });
  }

  const token = tokenBearer[1];

  try {
    const blacklistedToken = await BlacklistJWT.findOne({ where: { token } });
    if (blacklistedToken) {
      return res.status(401).json({ message: "Token JWT invalide." });
    }

    jwt.verify(token, c.config.jwt.secret, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Token JWT invalide." });
      }
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error("Erreur lors de la vérification du token:", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la vérification du token." });
  }
}

// Fonction pour récupérer l'ID de l'utilisateur à partir du token
export const getUserIdFromToken = (req) => {
  if (!req.headers || !req.headers.authorization) {
    return res.status(401).json({ message: "Pas d'entête d'autorisation" });
  }
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token JWT manquant." });
  }
  const decodedToken = jwt.verify(token, c.config.jwt.secret);
  const userId = decodedToken.userId;

  return userId;
};

router.get("/verification", requireAuthorization, async (req, res) => {
  return res.status(200).send({ auth: true, message: "Authentifié." });
});

router.post("/logout", requireAuthorization, async (req, res) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    return res.status(400).json({ message: "Token JWT requis." });
  }

  const token = authorizationHeader.split(" ")[1];
  if (!token) {
    return res.status(400).json({ message: "Token JWT requis." });
  }

  let decodedToken;
  try {
    decodedToken = jwt.decode(token);
    if (!decodedToken) {
      return res.status(400).json({ message: "Token JWT invalide." });
    }
  } catch (error) {
    return res.status(400).json({ message: "Token JWT invalide." });
  }

  try {
    req.session.destroy(async (err) => {
      if (err) {
        console.error("Erreur lors de la destruction de la session :", err);
        return res.status(500).json({ message: "Erreur serveur" });
      }
      res.clearCookie("connect.sid");

      try {
        await BlacklistJWT.create({
          token,
          expirationDate: decodedToken.exp,
        });
        res.status(200).json({ message: "Déconnexion réussie." });
      } catch (error) {
        console.error("Erreur lors de l'ajout à la liste noire :", error);
        res
          .status(500)
          .json({ message: "Erreur serveur lors de la déconnexion." });
      }
    });
  } catch (error) {
    console.error("Erreur lors de la destruction de la session :", error);
    res.status(500).json({ message: "Erreur serveur lors de la déconnexion." });
  }
});

// Route pour la connexion
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !EmailValidator.validate(email)) {
    return res
      .status(400)
      .send({ auth: false, message: "Données de connexion incorrectes." });
  }

  if (!password) {
    return res
      .status(400)
      .send({ auth: false, message: "Données de connexion incorrectes." });
  }

  try {
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      return res
        .status(401)
        .send({ auth: false, message: "Données de connexion incorrectes" });
    }

    if (user.is_gerant || user.is_admin || user.is_super) {
      const authValid = await comparePassword(password, user.password);
      if (!authValid) {
        return res
          .status(401)
          .send({ auth: false, message: "Données de connexion incorrectes." });
      }

      const jwtToken = generateJWT(user);

      // Stocker le JWT dans la session
      req.session.jwtToken = jwtToken;
      req.session.userID = user.id;

      res.status(200).send({ auth: true, token: jwtToken });
    } else {
      return res
        .status(401)
        .send({ auth: false, message: "Données de connexion incorrectes" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ auth: false, message: "Erreur serveur." });
  }
});

router.post("/signup", async (req, res) => {
  try {
    // Récupérer les données de la requête
    const { personne_id, password, is_admin, is_gerant, is_client } = req.body;

    const userID = getUserIdFromToken(req);
    const userConnected = await User.findByPk(userID);
    if (!userConnected) {
      return res
        .status(404)
        .json({ message: "Utilisateur connecté non trouvé." });
    }

    // Vérifier si la personne existe
    const personne = await Personne.findByPk(personne_id);
    if (!personne) {
      return res.status(404).json({ message: "Personne non trouvée" });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({
      where: { email: personne.email },
    });
    if (existingUser) {
      return res.status(400).json({ message: "Cet utilisateur existe déjà" });
    }
    // Crypter le mot de passe
    const generatedHash = await generatePassword(password);

    // Créer l'utilisateur dans la base de données
    const user = await User.create({
      email: personne.email,
      password: generatedHash,
      is_admin,
      is_gerant,
      is_client,
      personne_id,
      created_by: userConnected,
    });

    // // Générer un JWT
    // const token = jwt.sign({ userId: user.id }, "votre_clé_secrète", {
    //   expiresIn: "1h",
    // });

    res.status(201).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Route pour rafraîchir la session
router.post("/refresh-session", async (req, res) => {
  try {
    // Vérifier si l'utilisateur est connecté en vérifiant si l'ID de l'utilisateur est présent dans la session
    const userId = req.session.userID;
    if (!userId) {
      return res.status(401).send({ message: "Aucune session active." });
    }

    // Rechercher l'utilisateur dans la base de données
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).send({ message: "Utilisateur introuvable." });
    }

    // Générer un nouveau token JWT
    const jwtToken = generateJWT(user);

    // Mettre à jour le token dans la session
    req.session.jwtToken = jwtToken;

    res
      .status(200)
      .send({ message: "Session rafraîchie avec succès.", token: jwtToken });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Erreur serveur." });
  }
});

router.get("/", async (req, res) => {
  res.send("auth");
});

router.post("/signup_test", async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    // Récupérer les données de la requête
    const {
      nom,
      prenom,
      email,
      telephone,
      pays,
      ville,
      commune,
      date_naissance,
    } = req.body;

    let password = "issa01";
    let is_gerant = true;
    let is_client = false;
    let is_admin = true;

    const existingPerssonne = await Personne.findOne(
      {
        where: { email: email },
      },
      { transaction }
    );
    if (existingPerssonne) {
      return res.status(400).json({ message: "Cet utilisateur existe déjà" });
    }
    const personne = await Personne.create(
      {
        nom,
        prenom,
        email,
        telephone,
        pays,
        ville,
        commune,
        date_naissance,
        is_client,
        is_gerant,
      },
      { transaction }
    );

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne(
      {
        where: { email: personne.email },
      },
      { transaction }
    );
    if (existingUser) {
      return res.status(400).json({ message: "Cet utilisateur existe déjà" });
    }
    // Crypter le mot de passe
    const generatedHash = await generatePassword(password);

    // Créer l'utilisateur dans la base de données
    const user = await User.create(
      {
        email: personne.email,
        password: generatedHash,
        is_admin,
        is_gerant,
        is_client,
        personne_id: personne.id,
        created_by: personne.id,
      },
      { transaction }
    );

    // // Générer un JWT
    // const token = jwt.sign({ userId: user.id }, "votre_clé_secrète", {
    //   expiresIn: "1h",
    // });

    await transaction.commit();
    res.status(201).json({ user });
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    res.status(500).send({ message: err.message });
  }
});

export const AuthRouter = router;
