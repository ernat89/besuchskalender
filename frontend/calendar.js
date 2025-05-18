document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");
  const lang = localStorage.getItem("lang") || "de";

  const calendar = new FullCalendar.Calendar(calendarEl, {
    locale: lang,
    initialView: 'timeGridDay',
    nowIndicator: true,
    allDaySlot: false,
    slotMinTime: "13:00:00",
    slotMaxTime: "20:00:00",
    slotDuration: "00:30:00",
    contentHeight: "auto",
    expandRows: true,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: ''
    },
    events: fetchEvents,
    dateClick: function (info) {
      showForm(info.dateStr);
    },
    slotClick: function (info) {
      const iso = info.date.toISOString();
      showForm(iso);
    }
  });

  calendar.render();

  async function fetchEvents(info, successCallback, failureCallback) {
    const startDate = info.startStr.split("T")[0];
    const res = await fetch(`/api/bookings?date=${startDate}`);
    const bookings = await res.json();

    const events = bookings.map(b => ({
      title: `${b.start} - ${b.end}\nBelegt`,
      start: `${b.date}T${b.start}`,
      end: `${b.date}T${b.end}`,
      backgroundColor: "#ff4d4d",
      borderColor: "#cc0000",
      display: "block"
    }));

    successCallback(events);
  }

  function showForm(fullDateTime) {
    const [selectedDate, selectedTime] = fullDateTime.split("T");
    const cleanTime = selectedTime?.substring(0, 5);

    if (!selectedDate || !cleanTime) return;

    document.getElementById("selectedDate").value = selectedDate;
    document.getElementById("selectedTime").value = cleanTime;
    document.getElementById("bookingFormWrapper").style.display = "block";
    document.getElementById("name").focus();
    updateEndTime(); // gleich Endzeit anzeigen
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
        document.getElementById("endTimeInfo").textContent = "";
        setTimeout(() => location.reload(), 3000);
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

  document.getElementById("duration").addEventListener("change", updateEndTime);

  function updateEndTime() {
    const timeStr = document.getElementById("selectedTime").value;
    const duration = parseInt(document.getElementById("duration").value, 10);
    const infoBox = document.getElementById("endTimeInfo");

    if (!timeStr || isNaN(duration)) {
      infoBox.textContent = "";
      return;
    }

    const [hour, minute] = timeStr.split(":").map(Number);
    const startDate = new Date();
    startDate.setHours(hour, minute, 0, 0);
    startDate.setMinutes(startDate.getMinutes() + duration);

    const endHour = String(startDate.getHours()).padStart(2, "0");
    const endMinute = String(startDate.getMinutes()).padStart(2, "0");

    infoBox.textContent = `Ende des Besuchs: ${endHour}:${endMinute} Uhr`;
  }
});
