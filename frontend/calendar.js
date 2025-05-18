// Liste aller möglichen Zeitfenster
const timeOptions = [
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
];

// Wenn Datum ausgewählt → Buchungen laden
document.getElementById("date").addEventListener("change", async function () {
  const date = this.value;
  const timeSelect = document.getElementById("time");

  // Lade Buchungen für dieses Datum
  const res = await fetch(`/api/bookings?date=${date}`);
  const bookings = await res.json();

  // Blockierte Startzeiten extrahieren
  const blocked = bookings.map(b => b.start);

  // Dropdown neu aufbauen
  timeSelect.innerHTML = '<option value="">-- Bitte Zeit wählen --</option>';
  timeOptions.forEach(time => {
    const option = document.createElement("option");
    option.value = time;
    option.textContent = `${time}`;
    if (blocked.includes(time)) {
      option.disabled = true;
      option.textContent += " (belegt)";
    }
    timeSelect.appendChild(option);
  });
});

// Formular absenden
document.getElementById("bookingForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;
  const duration = document.getElementById("duration").value;

  const payload = { name, email, date, time, duration };

  try {
    const res = await fetch("/api/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      alert("Danke, deine Buchung wurde gespeichert!");
      document.getElementById("bookingForm").reset();
      // Zeitliste neu laden, damit "belegt"-Status sichtbar wird
      document.getElementById("date").dispatchEvent(new Event("change"));
    } else {
      alert("Es gab ein Problem beim Speichern.");
    }
  } catch (err) {
    console.error("Fehler beim Absenden:", err);
    alert("Verbindungsfehler.");
  }
});
