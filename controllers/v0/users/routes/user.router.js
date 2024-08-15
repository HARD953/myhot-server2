import * as express from 'express';

import {AuthRouter, generatePassword, getUserIdFromToken, requireAuthorization} from './auth.router.js';
import { User } from '../models/User.js';
import { validateDataAddCompte } from '../../../../middlewares/validators.js';
import { Permission } from '../../permissions/permission.model.js';
import { Personne } from '../../personnes/personnes.model.js';
import { paginateResponse } from '../../../../utils/utils.js';

const router = express.Router();

router.use('/auth', AuthRouter);


// Middleware pour parser le JSON
router.use(express.json());

// Route pour récupérer tous les utilisateurs
router.get('/',requireAuthorization, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;

        const userID = getUserIdFromToken(req);

        const user = await User.findByPk(userID);

        if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        const queries = {
            include:[
                {
                    model: Personne,
                    as: "personne"
                }
            ],

        }

        const { results, pagination } = await paginateResponse(
        User,
        page,
        pageSize,
        queries
        );

        res.json({ results, pagination });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Route pour créer un nouvel utilisateur

router.post("/", requireAuthorization,async (req, res) => {
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
      personne_id: personne.id,
      created_by: userConnected.id,
    });


    res.status(201).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Route pour récupérer un utilisateur par son ID
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id,{
            attributes:{
                exclude: [ "password"]
            },
            include:[{
                model: Personne,
                as: "personne"
            }],
            
            
        });
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Route pour mettre à jour un utilisateur
router.put('/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        await user.update(req.body);
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Route pour supprimer un utilisateur
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        await user.destroy();
        res.json({ message: 'Utilisateur supprimé avec succès' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});


export const UserRouter = router;