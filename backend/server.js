const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { sendConfirmationMail } = require("./mailer");
// ...nachdem du die Buchung gespeichert hast:
await sendConfirmationMail(email, token);
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

const BOOKINGS_FILE = path.join(__dirname, "../bookings.json");

function loadBookings() {
  if (fs.existsSync(BOOKINGS_FILE)) {
    return JSON.parse(fs.readFileSync(BOOKINGS_FILE));
  }
  return [];
}

function saveBookings(bookings) {
  fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
}

// API: Buchungen für einen Tag abrufen
app.get("/api/bookings", (req, res) => {
  const { date } = req.query;
  const allBookings = loadBookings();
  const filtered = allBookings.filter(b => b.date === date);
  res.json(filtered);
});

// API: Neue Buchung speichern + Bestätigung versenden
app.post("/api/book", (req, res) => {
  const { name, email, date, time, duration } = req.body;
  if (!name || !email || !date || !time || !duration) {
    return res.status(400).send("Fehlende Angaben");
  }

  const bookings = loadBookings();

  const start = time;
  const endTime = new Date(`1970-01-01T${start}:00Z`);
  endTime.setMinutes(endTime.getMinutes() + parseInt(duration));
  const end = endTime.toISOString().substr(11, 5);

  const token = Date.now().toString(36) + Math.random().toString(36).substr(2);
  const newBooking = { name, email, date, start, end, token };

  bookings.push(newBooking);
  saveBookings(bookings);

  sendConfirmationMail(email, name, date, start, end, token);

  console.log("Neue Buchung:", newBooking);
  res.status(200).send("Buchung gespeichert");
});

// API: Buchung stornieren per Token
app.get("/api/cancel", (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(400).send("Kein Token übergeben.");

  let bookings = loadBookings();
  const initialLength = bookings.length;

  bookings = bookings.filter(b => b.token !== token);
  saveBookings(bookings);

  if (bookings.length === initialLength) {
    return res.status(404).send("Keine passende Buchung gefunden.");
  }

  res.send("Deine Buchung wurde erfolgreich storniert.");
});

app.listen(port, () => {
  console.log(`Server läuft auf Port ${port}`);
});
