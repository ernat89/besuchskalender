document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");

  const calendar = new FullCalendar.Calendar(calendarEl, {
    locale: "de", // Spracheinstellung
    initialView: 'timeGridDay',
    nowIndicator: true,
    slotDuration: '00:30:00',
    allDaySlot: false,
    slotMinTime: "13:00:00",
    slotMaxTime: "20:00:00",
    height: "auto",
    selectable: true,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: ''
    },
    events: fetchEvents,
    dateClick: function (info) {
      const selectedDate = info.dateStr.split("T")[0];
      const selectedTime = info.dateStr.split("T")[1].substring(0, 5);

      document.getElementById("selectedDate").value = selectedDate;
      document.getElementById("selectedTime").value = selectedTime;
      document.getElementById("bookingFormWrapper").style.display = "block";
      document.getElementById("name").focus();
    }
  });

  calendar.render();

  async function fetchEvents(info, successCallback, failureCallback) {
    const startDate = info.startStr.split("T")[0];
    const res = await fetch(`/api/bookings?date=${startDate}`);
    const bookings = await res.json();

    const events = bookings.map(b => ({
      title: "Belegt",
      start: `${b.date}T${b.start}`,
      end: `${b.date}T${b.end}`,
      backgroundColor: "#ff4d4d",
      borderColor: "#cc0000",
      display: "block"
    }));

    successCallback(events);
  }

  document.getElementById("bookingForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const date = document.getElementById("selectedDate").value;
    const time = document.getElementById("selectedTime").value;
    const duration = document.getElementById("duration").value;

    const payload = { name, email, date, time, duration };

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showSuccessMessage("✅ Deine Buchung war erfolgreich. Du bekommst eine E-Mail zur Bestätigung.");

        document.getElementById("bookingForm").reset();
        document.getElementById("bookingFormWrapper").style.display = "none";

        // Kalender aktualisieren oder Seite neuladen (wahlweise)
        setTimeout(() => {
          location.reload(); // oder: calendar.refetchEvents();
        }, 3000);
      } else {
        alert("Fehler beim Eintragen. Bitte prüfe deine Angaben.");
      }
    } catch (err) {
      console.error(err);
      alert("Serverfehler.");
    }
  });

  function showSuccessMessage(msg) {
    const msgBox = document.getElementById("successMessage");
    msgBox.textContent = msg;
    msgBox.style.display = "block";
    setTimeout(() => {
      msgBox.style.display = "none";
    }, 10000);
  }
});
