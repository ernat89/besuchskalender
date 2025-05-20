// calendar.js
document.addEventListener("DOMContentLoaded", function () {

  // 1) DOM-Elemente
  const calendarEl         = document.getElementById("calendar");
  const bookingFormWrapper = document.getElementById("bookingFormWrapper");
  const bookingForm        = document.getElementById("bookingForm");
  const nameInput          = document.getElementById("name");
  const emailInput         = document.getElementById("email");
  const dateInput          = document.getElementById("selectedDate");
  const timeInput          = document.getElementById("selectedTime");
  const durationSelect     = document.getElementById("duration");
  const startInfo          = document.getElementById("startTimeInfo");
  const endInfo            = document.getElementById("endTimeInfo");
  const successMsg         = document.getElementById("successMessage");

  // 2) FullCalendar initialisieren
  const calendar = new FullCalendar.Calendar(calendarEl, {
    locale: "de",
    initialView: "timeGridDay",
    slotDuration: "00:30:00",
    slotMinTime: "12:00:00",
    slotMaxTime: "20:00:00",
    expandRows: true,
    contentHeight: "auto",
    nowIndicator: true,
    allDaySlot: true,
    headerToolbar: {
      left:  "prev,next today",
      center:"title",
      right: ""
    },
    events: fetchEvents,
    dateClick: info => showForm(info.dateStr)
  });

  calendar.render();

  // 3) Events vom Backend holen
  async function fetchEvents(info, successCallback, failureCallback) {
    try {
      const day = info.startStr.split("T")[0];
      const res = await fetch(`/api/bookings?date=${day}`);
      const data = await res.json();
      const events = data.map(b => ({
        title: b.name,
        start: `${b.date}T${b.start}`,
        end:   `${b.date}T${b.end}`,
        backgroundColor: "#ff4d4d",
        borderColor:     "#cc0000"
      }));
      successCallback(events);
    } catch (err) {
      failureCallback(err);
    }
  }

  // 4) Formular anzeigen
  function showForm(dateTime) {
    const [d, t] = dateTime.split("T");
    dateInput.value = d;
    timeInput.value = t.substring(0,5);
    bookingFormWrapper.style.display = "block";
    nameInput.focus();
    updateStartEnd();
  }

  // 5) Start/End-Anzeige aktualisieren
  durationSelect.addEventListener("change", updateStartEnd);
  timeInput.addEventListener("change",     updateStartEnd);

  function updateStartEnd() {
    const st  = timeInput.value;
    const dur = parseInt(durationSelect.value, 10) || 0;

    // Start
    startInfo.textContent = st ? `Start: ${st}` : "";

    // Ende
    if (st && dur) {
      const [h, m] = st.split(":").map(Number);
      const dt     = new Date();
      dt.setHours(h);
      dt.setMinutes(m + dur);
      const eh = String(dt.getHours()).padStart(2,"0");
      const em = String(dt.getMinutes()).padStart(2,"0");
      endInfo.textContent = `Ende: ${eh}:${em} Uhr`;
    } else {
      endInfo.textContent = "";
    }
  }

  // 6) Formular-Abschicken
  bookingForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const payload = {
      name:     nameInput.value.trim(),
      email:    emailInput.value.trim(),
      date:     dateInput.value,
      time:     timeInput.value,
      duration: durationSelect.value
    };

    try {
      const res = await fetch("/api/book", {
        method:  "POST",
        headers: {"Content-Type":"application/json"},
        body:    JSON.stringify(payload)
      });
      if (res.ok) {
        bookingFormWrapper.style.display = "none";
        successMsg.textContent = "✅ Buchung erfolgreich!";
        successMsg.style.display = "block";
        calendar.refetchEvents();
        setTimeout(() => location.reload(), 3000);
      } else {
        alert("Fehler bei der Buchung.");
      }
    } catch (err) {
      console.error(err);
      alert("Serverfehler.");
    }
  });

});
