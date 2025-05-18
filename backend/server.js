const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { sendConfirmationMail } = require("./mailer");  // <--- DAS HIER NEU

const app = express();
const port = process.env.PORT || 3000;

// ...

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

  sendConfirmationMail(email, name, date, start, end); // <--- DAS HIER NEU

  console.log("Neue Buchung:", name, date, start, "-", end);
  res.status(200).send("Buchung gespeichert");
});
