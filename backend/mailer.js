const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "besuche.aykanat@gmail.com",
    pass: "mdjs yhzt jmai ocbc"
  }
});

function sendConfirmationMail(email, name, date, start, end, token) {
  const cancelLink = `https://besuchskalender.onrender.com/cancel.html?token=${token}`;

  const mailOptions = {
    from: '"Besuchskalender" <besuche.aykanat@gmail.com>',
    to: email,
    subject: "Dein Besuch ist eingetragen ✅",
    text: `Hallo ${name},\n\nDein Besuch am ${date} von ${start} bis ${end} wurde erfolgreich eingetragen.\n\nWenn du doch nicht kommen kannst, kannst du hier stornieren:\n${cancelLink}\n\nViele Grüße\nBesuchsteam`
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
