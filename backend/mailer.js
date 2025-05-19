const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

async function sendConfirmationMail(email,name,date,start,end,token){
  const cancelUrl = `https://${process.env.RENDER_EXTERNAL_URL}/api/cancel?token=${token}`;

  // Nutzer-Mail
  await transporter.sendMail({
    from: `"Besuchskalender" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Deine Besuchsbuchung",
    html: `<p>Hallo ${name},<br>
      Dein Besuch am <strong>${date}</strong> von <strong>${start}</strong> bis <strong>${end}</strong> ist gebucht.<br>
      <a href="${cancelUrl}">Hier stornieren</a>
    </p>`
  });

  // Admin-Mail
  await transporter.sendMail({
    from: `"Besuchskalender" <${process.env.GMAIL_USER}>`,
    to: "eren.aykanat@web.de",
    subject: `Neue Buchung: ${name}`,
    html: `<p><b>Vorname:</b> ${name}<br>
      <b>E-Mail:</b> ${email}<br>
      <b>Datum:</b> ${date}<br>
      <b>Zeit:</b> ${start}–${end}
    </p>`
  });
}

module.exports = { sendConfirmationMail };
