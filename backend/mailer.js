const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 587,
  auth: {
    user: "b0776fcbd0493d",
    pass: "bb193a4429e115" // ← Ersetze das Sternchen-Passwort von Mailtrap
  }
});

function sendConfirmationMail(email, name, date, start, end) {
  const mailOptions = {
    from: '"Besuchskalender" <noreply@besuch.local>',
    to: email,
    subject: "Bestätigung deines Besuchs",
    text: `Hallo ${name},\n\ndein Besuch am ${date} von ${start} bis ${end} wurde erfolgreich eingetragen.\n\nFalls du den Termin doch nicht wahrnehmen kannst, gib bitte rechtzeitig Bescheid.\n\nVielen Dank!\nDein Besuchs-Team`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Fehler beim Senden der Mail:", error);
    } else {
      console.log("Bestätigung gesendet:", info.response);
    }
  });
}

module.exports = { sendConfirmationMail };
