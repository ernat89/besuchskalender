import express from "express";
import cors    from "cors";
import fs      from "fs";
import path    from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const app        = express();
const port       = process.env.PORT || 3000;
const DB         = path.join(__dirname, "bookings.json");

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

// Lade Buchungen/Blocker
function loadBookings() {
  return fs.existsSync(DB)
    ? JSON.parse(fs.readFileSync(DB))
    : [];
}
function saveBookings(arr) {
  fs.writeFileSync(DB, JSON.stringify(arr, null, 2));
}

// GET /api/bookings?date=YYYY-MM-DD
app.get("/api/bookings", (req, res) => {
  const date = req.query.date;
  const all  = loadBookings();
  res.json(all.filter(e => e.date === date));
});

// POST /api/book
app.post("/api/book", (req, res) => {
  const { name, email, date, time, duration } = req.body;
  if (!name||!email||!date||!time||!duration) {
    return res.status(400).send("Fehlende Angaben");
  }
  const dt = new Date(`1970-01-01T${time}:00Z`);
  dt.setMinutes(dt.getMinutes() + parseInt(duration,10));
  const end = dt.toISOString().substr(11,5);

  const token = Date.now().toString(36);
  const entry = { type:"booking", name, email, date, start: time, end, token };
  const arr   = loadBookings();
  arr.push(entry);
  saveBookings(arr);
  res.sendStatus(200);
});

// POST /api/block?date=YYYY-MM-DD
app.post("/api/block", (req, res) => {
  const date = req.query.date;
  if (!date) return res.status(400).send("Kein Datum übergeben.");
  const arr  = loadBookings();
  // Prüfe, ob Blocker schon existiert
  if (arr.some(e=>e.type==="block"&&e.date===date)) {
    return res.status(400).send("Tag bereits gesperrt.");
  }
  const token = Date.now().toString(36);
  arr.push({ type:"block", date, token });
  saveBookings(arr);
  res.sendStatus(200);
});

// GET /api/cancel?token=...
app.get("/api/cancel", (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(400).send("Kein Token.");
  let arr = loadBookings();
  const len = arr.length;
  arr = arr.filter(e => e.token !== token);
  if (arr.length === len) {
    return res.status(404).send("Nicht gefunden.");
  }
  saveBookings(arr);
  res.send("Gelöscht");
});

app.listen(port, ()=>console.log(`Server läuft auf Port ${port}`));
