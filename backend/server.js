const express = require("express");
const cors    = require("cors");
const fs      = require("fs");
const path    = require("path");
const { sendConfirmationMail } = require("./mailer");

const app  = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "frontend")));

const BOOKINGS_FILE = path.join(__dirname, "bookings.json");
function loadBookings() {
  return fs.existsSync(BOOKINGS_FILE)
    ? JSON.parse(fs.readFileSync(BOOKINGS_FILE))
    : [];
}
function saveBookings(b) {
  fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(b, null, 2));
}

app.get("/api/bookings", (req, res) => {
  const date = req.query.date;
  res.json(loadBookings().filter(x => x.date === date));
});

app.post("/api/book", async (req, res) => {
  const { name, email, date, time, duration } = req.body;
  if (!name||!email||!date||!time||!duration)
    return res.status(400).send("Fehlende Angaben");

  const bookings = loadBookings();
  const start = time;
  const dt = new Date(`1970-01-01T${start}:00Z`);
  dt.setMinutes(dt.getMinutes() + parseInt(duration,10));
  const end = dt.toISOString().substr(11,5);
  const token = Date.now().toString(36) + Math.random().toString(36).substr(2);
  bookings.push({ name, email, date, start, end, token });
  saveBookings(bookings);

  try {
    await sendConfirmationMail(email,name,date,start,end,token);
  } catch(err){
    console.error("Mail-Fehler:",err);
  }
  res.sendStatus(200);
});

app.get("/api/cancel", (req,res) => {
  const token = req.query.token;
  if (!token) return res.status(400).send("kein Token");
  let b = loadBookings();
  const before = b.length;
  b = b.filter(x=>x.token!==token);
  saveBookings(b);
  if (b.length===before) return res.status(404).send("nicht gefunden");
  res.send("Storno ok");
});

app.listen(port, ()=>console.log(`🚀 auf ${port}`));
