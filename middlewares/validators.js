import Joi from 'joi'
import { Chambre } from '../controllers/v0/chambres/chambre.model.js';

// Middleware for validate login data
export const validateDataLogin = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};


// Middleware for validate signup data
export const validateDataSignup = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        role: Joi.string().required(),
        password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};


// Middleware for validate signup data
export const validateDataAddCompte = (req, res, next) => {
    const schema = Joi.object({
      user: Joi.string().guid().required(),
      typeCompte: Joi.string().valid("gerant", "admin", "client").required(),
      permissions: Joi.array().items(Joi.string().guid()),
      password: Joi.string()
        .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
        .required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};



// Middleware de validation pour la création et la mise à jour des réservations
export const validateReservation = async (req, res, next) => {
  const { ClientId, ChambreId } = req.body;
  if(!!ClientId && !!ChambreId){
    try {
      // Vérifier si le ClientId existe
      // const client = await Client.findByPk(ClientId);
      // if (!client) {
      //   throw new Error('Client non trouvé');
      // }

      // // Vérifier si le ChambreId existe
      // const chambre = await Chambre.findByPk(ChambreId);
      // if (!chambre) {
      //   throw new Error('Chambre non trouvée');
      // }

      next();
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
  else{
     throw new Error("Chambre ou Client non spécifié");
  }
};

 // Vérification de la validité du statut
export const vilidateChangeReservationStatut = async(req,res,next)=>{
    const {statut} = req.body;
     if (!["en_cours", "terminee", "annulee", "en_attente"].includes(statut)) {
       return res
         .status(400)
         .json({ message: "Statut de réservation invalide" });
     }
     next()
}