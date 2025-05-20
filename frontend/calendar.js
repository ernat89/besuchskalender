document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");

  // Kalender-Instanz
  const calendar = new FullCalendar.Calendar(calendarEl, {
    locale: "de",                 // deutsch
    initialView: "timeGridDay",   // Tages-Ansicht
    slotDuration: "00:30:00",     // 30-Minuten-Intervalle
    slotMinTime: "12:00:00",      // ab 12:00
    slotMaxTime: "20:00:00",      // bis 20:00
    allDaySlot: true,            // kein „all day“ oben
    nowIndicator: true,           // roter Linien-Indikator
    selectable: false,            // keine Mehrfach-Selektion
    height: "auto",               // passt Höhe an den Inhalt an
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: ""
    },
    events: fetchEvents,          // Buchungsdaten nachladen
    dateClick: function (info) {  
      showForm(info.dateStr);
    },
    eventDidMount: function(arg) {
      // Tooltips mit Name anzeigen
      arg.el.setAttribute("title", arg.event.title.replace("\n", " "));
    }
  });

  calendar.render();

  // === EVENTS LADEN ===
  async function fetchEvents(info, successCallback, failureCallback) {
    try {
      const day = info.startStr.split("T")[0];
      const res = await fetch(`/api/bookings?date=${day}`);
      const bookings = await res.json();
      const events = bookings.map(b => ({
        title: `${b.start}–${b.end}\n${b.name}`, // Linie & Name
        start: `${b.date}T${b.start}`,
        end:   `${b.date}T${b.end}`,
        backgroundColor: "#ff4d4d",
        borderColor:     "#cc0000",
        display: "block"
      }));
      successCallback(events);
    } catch (err) {
      failureCallback(err);
    }
  }

  // === FORMULAR ANZEIGEN ===
  function showForm(dateTime) {
    const [d, t] = dateTime.split("T");
    document.getElementById("selectedDate").value = d;
    document.getElementById("selectedTime").value = t.substr(0,5);
    document.getElementById("bookingFormWrapper").style.display = "block";
    updateEndTime();
    document.getElementById("name").focus();
  }

  // === FORMULAR ABSENDEN ===
  document.getElementById("bookingForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    const name     = document.getElementById("name").value.trim();
    const email    = document.getElementById("email").value.trim();
    const date     = document.getElementById("selectedDate").value;
    const time     = document.getElementById("selectedTime").value;
    const duration = document.getElementById("duration").value;

    const payload = { name, email, date, time, duration };
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Serverfehler");
      // Reset & Erfolgsmeldung
      document.getElementById("bookingForm").reset();
      document.getElementById("bookingFormWrapper").style.display = "none";
      const msg = document.getElementById("successMessage");
      msg.textContent = "✅ Buchung erfolgreich!";
      msg.style.display = "block";
      // neu laden, damit event im Kalender erscheint
      setTimeout(() => location.reload(), 1500);
    } catch (err) {
      alert("Fehler bei der Buchung.");
    }
  });

  // === ENDE-ZEIT BERECHNEN ===
  document.getElementById("duration").addEventListener("change", updateEndTime);
  function updateEndTime() {
    const startStr = document.getElementById("selectedTime").value;
    const dur = parseInt(document.getElementById("duration").value, 10);
    const infoBox = document.getElementById("endTimeInfo");
    if (!startStr || isNaN(dur)) {
      infoBox.textContent = "";
      return;
    }
    const [h,m] = startStr.split(":").map(Number);
    const dt = new Date();
    dt.setHours(h);
    dt.setMinutes(m + dur);
    const endH = String(dt.getHours()).padStart(2,"0");
    const endM = String(dt.getMinutes()).padStart(2,"0");
    document.getElementById("startTimeInfo").textContent = `Start: ${h.toString().padStart(2,"0")}:${m.toString().padStart(2,"0")} Uhr`;
    infoBox.textContent = `Ende: ${endH}:${endM} Uhr`;
  }
});
