import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,  // z. B. besuch.aykanat@gmail.com
    pass: process.env.GMAIL_PASS   // dein App-Passwort
  }
});

/**
 * Sendet eine Bestätigung an den Gast
 * und eine Info-Mail an den Admin.
 */
export async function sendConfirmationMail(email, name, date, start, end, token) {
  const cancelUrl = `https://besuchskalender.onrender.com/api/cancel?token=${token}`;

  // 1) Mail an Besucher
  await transporter.sendMail({
    from: `"Besuchskalender" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Deine Besuchsbuchung",
    html: `
      <p>Hallo ${name},</p>
      <p>deine Buchung am <strong>${date}</strong> von <strong>${start}</strong> bis <strong>${end}</strong> wurde gespeichert.</p>
      <p><a href="${cancelUrl}">Termin stornieren</a></p>
      <p>Liebe Grüße<br>Dein Besuchskalender</p>
    `
  });

  // 2) Info-Mail an Admin
  await transporter.sendMail({
    from: `"Besuchskalender" <${process.env.GMAIL_USER}>`,
    to: "eren.aykanat@web.de",
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
      <p><a href="${cancelUrl}">Termin stornieren</a></p>
      <p>Viele Grüße<br>Dein Besuchskalender</p>
    `
  });
}
