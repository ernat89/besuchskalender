import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

/**
 * sendConfirmationMail(
 *   zielEmail, empfängerName, datum, start, ende, token,
 *   optionaler subject-Override
 * )
 */
export async function sendConfirmationMail(
  to,
  name,
  date,
  start,
  end,
  token,
  subjectOverride
) {
  const cancelUrl = `https://besuchskalender.onrender.com/api/cancel?token=${token}`;
  const subject = subjectOverride || "Deine Besuchsbuchung";
  const html = `
    <p>Hallo ${name},</p>
    <p>Deine Buchung am <b>${date}</b> von <b>${start}</b> bis <b>${end}</b> wurde gespeichert.</p>
    <p><a href="${cancelUrl}">Hier stornieren</a></p>
    <p>Liebe Grüße,<br>Dein Besuchskalender</p>
  `;
  await transporter.sendMail({
    from: `"Besuchskalender" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html
  });
}
