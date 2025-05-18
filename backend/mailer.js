const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 587,
  auth: {
    user: "DEIN_MAILTRAP_USER",
    pass: "DEIN_MAILTRAP_PASS"
  }
});

function sendConfirmationMail(email, name, date, start, end) {
  const message = {
    from: "kalender@deine-domain.de",
    to: email,
    subject: "Deine Buchung beim Besuchskalender",
    text: `Hallo ${name},\n\ndu hast einen Besuch gebucht am ${date} von ${start} bis ${end}.\n\nBis bald!`
  };

  transporter.sendMail(message, (err, info) => {
    if (err) {
      console.error("Mail Fehler:", err);
    } else {
      console.log("Bestätigungsmail gesendet:", info.messageId);
    }
  });
}

module.exports = { sendConfirmationMail };
