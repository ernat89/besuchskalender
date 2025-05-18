const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

const BOOKINGS_FILE = path.join(__dirname, "../bookings.json");

// Lese bestehende Buchungen
function loadBookings() {
    if (fs.existsSync(BOOKINGS_FILE)) {
        return JSON.parse(fs.readFileSync(BOOKINGS_FILE));
    }
    return [];
}

// Speichere Buchungen
function saveBookings(bookings) {
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
}

// Besuch eintragen
app.post("/api/book", (req, res) => {
    const { name, email, date, time, duration } = req.body;
    if (!name || !email || !date || !time || !duration) {
        return res.status(400).send("Fehlende Angaben");
    }

    const bookings = loadBookings();
    const token = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const start = time;
    const endTime = new Date(`1970-01-01T${start}:00Z`);
    endTime.setMinutes(endTime.getMinutes() + parseInt(duration));

    const end = endTime.toISOString().substr(11, 5);

    bookings.push({ name, email, date, start, end, token });
    saveBookings(bookings);

    console.log("Neue Buchung:", name, date, start, "-", end);

    res.status(200).send("Buchung gespeichert");
});

// Starte Server
app.listen(port, () => {
    console.log(`Server läuft auf Port ${port}`);
});
