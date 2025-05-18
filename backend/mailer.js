const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "deineAdresse@gmail.com",
    pass: "DEIN_APP_PASSWORT"
  }
});

function sendConfirmationMail(email, name, date, start, end, token) {
  const cancelLink = `https://deineseite.onrender.com/cancel.html?token=${token}`;

  const mailOptions = {
    from: '"Besuchskalender" <besuch.aykanat@gmail.com>',
    to: email,
    subject: "Bestätigung deines Besuchs",
    text: `Hallo ${name},\n
dein Besuch am ${date} von ${start} bis ${end} wurde erfolgreich eingetragen.\n
Wenn du absagen möchtest, kannst du deine Buchung hier stornieren:\n${cancelLink}\n\n
Viele Grüße\nDein Besuchs-Team`
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
