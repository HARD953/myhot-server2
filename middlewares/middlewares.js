// Middleware pour vérifier la validité de la session
export function validateSession(req, res, next) {
  if (!req.session || !req.session.userID) {
    return res
      .status(401)
      .json({ message: "Accès non autorisé. Session invalide." });
  }
  next();
}
