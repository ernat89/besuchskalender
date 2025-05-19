import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { sendConfirmationMail } from "./mailer.js";

const app = express();
const port = process.env.PORT || 3000;

// statische Dateien aus dem frontend-Verzeichnis ausliefern
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(process.cwd(), "frontend")));

const BOOKINGS_FILE = path.join(process.cwd(), "backend", "bookings.json");

function loadBookings() {
  if (fs.existsSync(BOOKINGS_FILE)) {
    return JSON.parse(fs.readFileSync(BOOKINGS_FILE));
  }
  return [];
}

function saveBookings(bookings) {
  fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
}

// Buchungen für einen Tag
app.get("/api/bookings", (req, res) => {
  const { date } = req.query;
  const all = loadBookings();
  res.json(all.filter(b => b.date === date));
});

// neue Buchung
app.post("/api/book", async (req, res) => {
  const { name, email, date, time, duration } = req.body;
  if (!name || !email || !date || !time || !duration) {
    return res.status(400).send("Fehlende Angaben");
  }

  const bookings = loadBookings();
  const start = time;
  const endDate = new Date(`1970-01-01T${start}:00Z`);
  endDate.setMinutes(endDate.getMinutes() + +duration);
  const end = endDate.toISOString().substr(11, 5);

  const token = Date.now().toString(36) + Math.random().toString(36).slice(2);
  const newBooking = { name, email, date, start, end, token };
  bookings.push(newBooking);
  saveBookings(bookings);

  try {
    // E-Mail an Gast
    await sendConfirmationMail(email, name, date, start, end, token);
    // Info-Mail an dich selbst
    await sendConfirmationMail(
      "eren.aykanat@web.de",
      "Admin",
      date,
      start,
      end,
      token,
      `Neue Buchung von ${name} (${email})`
    );
  } catch (err) {
    console.error("Fehler beim Mailversand:", err);
  }

  res.status(200).send("Buchung gespeichert");
});

// Storno per Token
app.get("/api/cancel", (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).send("Kein Token");

  let bookings = loadBookings();
  const before = bookings.length;
  bookings = bookings.filter(b => b.token !== token);
  saveBookings(bookings);

  if (bookings.length === before) {
    return res.status(404).send("Nicht gefunden");
  }
  res.send("Storniert");
});

app.listen(port, () => {
  console.log(`Server läuft auf Port ${port}`);
});
