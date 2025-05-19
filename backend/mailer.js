const nodemailer = require("nodemailer");

// Transporter-Konfiguration für Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,  // z. B. besuch.aykanat@gmail.com
    pass: process.env.GMAIL_PASS   // dein App-Passwort / OAuth-Token
  }
});

/**
 * sendConfirmationMail verschickt einerseits die Bestätigung
 * an den Gast und sendet danach eine Info-Mail an den Admin.
 *
 * @param {string} email – Adresse des Buchers
 * @param {string} name  – Vorname oder Initiale des Buchers
 * @param {string} date  – Datum im ISO-Format (YYYY-MM-TT)
 * @param {string} start – Start-Uhrzeit (HH:MM)
 * @param {string} end   – Ende-Uhrzeit (HH:MM)
 * @param {string} token – Stornierungs-Token
 */
async function sendConfirmationMail(email, name, date, start, end, token) {
  // Link zum Stornieren
  const cancelUrl = `https://besuchskalender.onrender.com/api/cancel?token=${token}`;

  // 1) Mail an den/ die Bucher*in
  const userMail = {
    from: `"Besuchskalender" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Deine Besuchsbuchung",
    html: `
      <p>Hallo ${name},</p>
      <p>deine Buchung am <strong>${date}</strong> von <strong>${start}</strong> bis <strong>${end}</strong> wurde erfolgreich gespeichert.</p>
      <p>Wenn du stornieren möchtest, klicke bitte hier:<br>
      <a href="${cancelUrl}">Termin stornieren</a></p>
      <p>Liebe Grüße<br>Dein Besuchskalender</p>
    `
  };
  await transporter.sendMail(userMail);

  // 2) Info-Mail an den Admin
  const adminMail = {
    from: `"Besuchskalender" <${process.env.GMAIL_USER}>`,
    to: "eren.aykanat@web.de",  // deine feste Admin-Adresse
    subject: `Neue Buchung von ${name} (${email})`,
    html: `
      <p>Hallo Admin,</p>
      <p>es wurde eine neue Buchung eingetragen:</p>
      <ul>
        <li><strong>Name:</strong> ${name}</li>
        <li><strong>E-Mail:</strong> ${email}</li>
        <li><strong>Datum:</strong> ${date}</li>
        <li><strong>Uhrzeit:</strong> ${start} – ${end}</li>
      </ul>
      <p>Zum Stornieren hier klicken:<br>
      <a href="${cancelUrl}">Termin stornieren</a></p>
      <p>Viele Grüße<br>Dein Besuchskalender</p>
    `
  };
  await transporter.sendMail(adminMail);
}

module.exports = { sendConfirmationMail };
