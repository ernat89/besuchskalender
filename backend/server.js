// backend/server.js
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { sendConfirmationMail } from "./mailer.js";

const app = express();
const port = process.env.PORT || 3000;

// JSON-Buchungen speichern unter backend/bookings.json
const BOOKINGS_FILE = path.join(process.cwd(), "backend", "bookings.json");

// Middlewares
app.use(cors());
app.use(express.json());
// Statische Frontend-Dateien ausliefern (Ordner frontend/)
app.use(express.static(path.join(process.cwd(), "frontend")));

function loadBookings() {
  if (fs.existsSync(BOOKINGS_FILE)) {
    return JSON.parse(fs.readFileSync(BOOKINGS_FILE, "utf-8"));
  }
  return [];
}

function saveBookings(bookings) {
  fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2), "utf-8");
}

// GET /api/bookings?date=YYYY-MM-DD
app.get("/api/bookings", (req, res) => {
  const { date } = req.query;
  const all = loadBookings();
  res.json(all.filter(b => b.date === date));
});

// POST /api/book
app.post("/api/book", async (req, res) => {
  const { name, email, date, time, duration } = req.body;
  if (!name || !email || !date || !time || !duration) {
    return res.status(400).send("Fehlende Angaben");
  }

  // Ende berechnen
  const [h, m] = time.split(":").map(Number);
  const endDate = new Date();
  endDate.setHours(h);
  endDate.setMinutes(m + parseInt(duration, 10));
  const end = endDate.toTimeString().substr(0, 5);

  // Token generieren
  const token = Date.now().toString(36) + Math.random().toString(36).substr(2);

  const booking = { name, email, date, start: time, end, token };
  const bookings = loadBookings();
  bookings.push(booking);
  saveBookings(bookings);

  // E-Mail an Besucher + Admin
  try {
    await sendConfirmationMail(email, name, date, time, end, token);
  } catch (err) {
    console.error("Fehler beim Mailversand:", err);
  }

  console.log("✅ Neue Buchung:", booking);
  res.status(200).send("Buchung gespeichert");
});

// GET /api/cancel?token=…
app.get("/api/cancel", (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).send("Kein Token übergeben.");

  let bookings = loadBookings();
  const before = bookings.length;
  bookings = bookings.filter(b => b.token !== token);
  saveBookings(bookings);

  if (bookings.length === before) {
    return res.status(404).send("Buchung nicht gefunden.");
  }
  res.send("Deine Buchung wurde storniert.");
});

// Server starten
app.listen(port, () => {
  console.log(`🚀 Server läuft auf Port ${port}`);
});
