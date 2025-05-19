document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");
  const bookingFormWrapper = document.getElementById("bookingFormWrapper");
  const bookingForm = document.getElementById("bookingForm");
  const successMessage = document.getElementById("successMessage");

  const calendar = new FullCalendar.Calendar(calendarEl, {
    locale: "de",
    initialView: "timeGridDay",
    slotMinTime: "12:00:00",
    slotMaxTime: "20:00:00",
    slotDuration: "00:30:00",
    selectable: true,
    height: "auto",
    headerToolbar: {
      left: "prev,next",
      center: "title",
      right: "today"
    },
    buttonText: {
      today: "Heute"
    },
    dateClick: info => {
      // Datum + Zeit übernehmen
      const date = info.dateStr.substring(0, 10);
      const time = info.dateStr.substring(11, 16);
      document.getElementById("selectedDate").value = date;
      document.getElementById("selectedTime").value = time;

      // Formular anzeigen + Fokus
      bookingFormWrapper.style.display = "block";
      document.getElementById("name").focus();
      updateStartEndTime(time);
    },
    events: fetchEvents
  });

  calendar.render();

  async function fetchEvents(fetchInfo, success, failure) {
    const date = fetchInfo.startStr.substring(0, 10);
    const res = await fetch(`/api/bookings?date=${date}`);
    const data = await res.json();
    const events = data.map(b => ({
      title: b.name,
      start: `${b.date}T${b.start}`,
      end:   `${b.date}T${b.end}`,
      backgroundColor: "#ff4d4d",
      borderColor:     "#cc0000"
    }));
    success(events);
  }

  // Dauer-Änderung
  document.getElementById("duration").addEventListener("change", () => {
    const startTime = document.getElementById("selectedTime").value;
    if (startTime) updateStartEndTime(startTime);
  });

  // Formular absenden
  bookingForm.addEventListener("submit", async e => {
    e.preventDefault();
    const payload = {
      name:     document.getElementById("name").value,
      email:    document.getElementById("email").value,
      date:     document.getElementById("selectedDate").value,
      time:     document.getElementById("selectedTime").value,
      duration: document.getElementById("duration").value
    };

    const res = await fetch("/api/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      successMessage.innerText = "✅ Termin erfolgreich eingetragen!";
      calendar.refetchEvents();                // neu laden
      setTimeout(() => {
        bookingFormWrapper.style.display = "none";
        bookingForm.reset();
        successMessage.innerText = "";
      }, 1500);
    } else {
      successMessage.innerText = "❌ Fehler beim Speichern!";
    }
  });

  function updateStartEndTime(startTime) {
    const dur = parseInt(document.getElementById("duration").value, 10);
    const dt  = new Date(`1970-01-01T${startTime}:00Z`);
    dt.setMinutes(dt.getMinutes() + dur);
    const end = dt.toISOString().substr(11, 5);
    document.getElementById("startEndTimeInfo").innerHTML =
      `<strong>Start:</strong> ${startTime} Uhr<br><strong>Ende:</strong> ${end} Uhr`;
  }
});
