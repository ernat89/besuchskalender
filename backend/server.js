const express = require("express");
const cors    = require("cors");
const fs      = require("fs");
const path    = require("path");
const { sendConfirmationMail } = require("./mailer");

const app  = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

const BOOKINGS_FILE = path.join(__dirname, "bookings.json");

function loadBookings() {
  if (fs.existsSync(BOOKINGS_FILE)) {
    return JSON.parse(fs.readFileSync(BOOKINGS_FILE));
  }
  return [];
}
function saveBookings(b) {
  fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(b, null, 2));
}

// GET Buchungen für ein Datum
app.get("/api/bookings", (req, res) => {
  const date = req.query.date;
  const all  = loadBookings();
  res.json(all.filter(b => b.date === date));
});

// POST neue Buchung
app.post("/api/book", async (req, res) => {
  const { name, email, date, time, duration } = req.body;
  if (!name||!email||!date||!time||!duration) {
    return res.status(400).send("Fehlende Angaben");
  }

  const bookings = loadBookings();
  const start = time;
  const endDT = new Date(`1970-01-01T${start}:00Z`);
  endDT.setMinutes(endDT.getMinutes() + parseInt(duration, 10));
  const end = endDT.toISOString().substr(11, 5);

  const token = Date.now().toString(36) + Math.random().toString(36).substr(2);
  const entry = { name, email, date, start, end, token };

  bookings.push(entry);
  saveBookings(bookings);

  try {
    await sendConfirmationMail(email, name, date, start, end, token);
  } catch (err) {
    console.error("Mail-Fehler:", err);
  }

  res.status(200).send("ok");
});

// GET Stornierung
app.get("/api/cancel", (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(400).send("kein Token");

  let b = loadBookings();
  const len0 = b.length;
  b = b.filter(x => x.token !== token);
  saveBookings(b);

  if (b.length === len0) return res.status(404).send("nicht gefunden");
  res.send("Storno erfolgreich");
});

app.listen(port, ()=> console.log(`🚀 läuft auf ${port}`));
