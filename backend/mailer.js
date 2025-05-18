const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 587,
  auth: {
    user: "DEIN_USERNAME",
    pass: "DEIN_PASSWORT"
  }
});

function sendConfirmationMail(email, name, date, start, end) {
  const message = {
    from: "kalender@besuch.local",
    to: email,
    subject: "Deine Besuchsbestätigung",
    text: `Hallo ${name},\n\ndu hast erfolgreich einen Besuch gebucht am ${date} von ${start} bis ${end}.\n\nViele Grüße!`
  };

  transporter.sendMail(message, (err, info) => {
    if (err) {
      console.error("E-Mail Fehler:", err);
    } else {
      console.log("E-Mail gesendet:", info.messageId);
    }
  });
}

module.exports = { sendConfirmationMail };
