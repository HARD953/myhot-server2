import nodemailer from 'nodemailer'


let transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // true pour le port 465 (SSL), false pour le port 587 (STARTTLS)
  auth: {
    user: "votreadresse@example.com",
    pass: "votremotdepasse",
  },
});




const sendEmailToClient = async (clientEmail) => {
  try {
    // Envoyer l'e-mail
    let info = await transporter.sendMail({
      from: "votreadresse@example.com",
      to: clientEmail,
      subject: "Votre réservation est en cours",
      text: "Votre réservation est maintenant en cours. Profitez de votre séjour !",
    });

    console.log("E-mail envoyé :", info.messageId);
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'e-mail :", error);
  }
};