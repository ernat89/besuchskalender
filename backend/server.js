import express from "express";
import cors    from "cors";
import fs      from "fs";
import path    from "path";

const app  = express();
const port = process.env.PORT || 3000;
const DB    = path.join(process.cwd(), "backend/bookings.json");

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(process.cwd(), "frontend")));

// Lade alle Einträge (Buchungen + Blocker)
function loadAll() {
  if (!fs.existsSync(DB)) return [];
  return JSON.parse(fs.readFileSync(DB));
}
function saveAll(arr) {
  fs.writeFileSync(DB, JSON.stringify(arr, null,2));
}

// 1) User holt sich die Events des Tages (Buchungen + ggf. All-Day-Blocker)
app.get("/api/bookings", (req, res) => {
  const { date } = req.query;
  const all = loadAll().filter(e => e.date === date);
  // admin-only: allDay-Blocker weitergeben
  res.json(all);
});

// 2) User legt eine neue Buchung an
app.post("/api/book", (req, res) => {
  const { name, email, date, time, duration } = req.body;
  if (!name||!email||!date||!time||!duration) {
    return res.status(400).send("Fehlende Angaben");
  }
  const arr = loadAll();
  const start = time;
  const endDt = new Date(`1970-01-01T${start}:00Z`);
  endDt.setMinutes(endDt.getMinutes() + duration);
  const end = endDt.toISOString().substr(11,5);

  const token = Date.now().toString(36);
  arr.push({ type:"booking", name, email, date, start, end, token });
  saveAll(arr);
  res.sendStatus(200);
});

// 3) Admin setzt All-Day-Blocker (kein Auth-Layer hier, nur über eigenes Admin-HTML erreichbar)
app.post("/api/block", (req, res) => {
  const { date } = req.body;
  if (!date) return res.status(400).send("Kein Datum");
  const arr = loadAll();
  // Prüfen, ob schon ein Blocker existiert
  if (arr.some(e=> e.type==="block" && e.date===date)) {
    return res.status(400).send("Bereits blockiert");
  }
  arr.push({ type:"block", date });
  saveAll(arr);
  res.sendStatus(200);
});

app.listen(port, ()=>{
  console.log(`Server läuft auf Port ${port}`);
});
