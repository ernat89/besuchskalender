document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");

  const calendar = new FullCalendar.Calendar(calendarEl, {
    locale: "de",
    initialView: "timeGridDay",
    slotDuration: "00:30:00",
    slotMinTime: "12:00:00",
    slotMaxTime: "20:00:00",
    nowIndicator: true,
    allDaySlot: false,
    selectable: true,
    expandRows: true,
    contentHeight: "auto",
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: ""
    },
    events: fetchEvents,
    dateClick: function (info) {
      const [date, time] = info.dateStr.split("T");
      document.getElementById("selectedDate").value = date;
      document.getElementById("selectedTime").value = time.substring(0, 5);
      document.getElementById("bookingFormWrapper").style.display = "block";
      updateEndTime();
      document.getElementById("name").focus();
    }
  });

  calendar.render();

  async function fetchEvents(info, successCallback, failureCallback) {
    const startDate = info.startStr.split("T")[0];
    const res = await fetch(`/api/bookings?date=${startDate}`);
    const bookings = await res.json();

    const events = bookings.map(b => ({
      title: `Belegt (${b.name})`,
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
        document.getElementById("bookingForm").reset();
        document.getElementById("bookingFormWrapper").style.display = "none";
        document.getElementById("successMessage").textContent = "✅ Buchung erfolgreich!";
        document.getElementById("successMessage").style.display = "block";
        setTimeout(() => location.reload(), 3000);
      } else {
        alert("Fehler bei der Buchung.");
      }
    } catch (err) {
      console.error(err);
      alert("Serverfehler.");
    }
  });

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
    const start = new Date();
    start.setHours(hour);
    start.setMinutes(minute + duration);

    const endHour = String(start.getHours()).padStart(2, "0");
    const endMinute = String(start.getMinutes()).padStart(2, "0");

    infoBox.textContent = `Ende des Besuchs: ${endHour}:${endMinute} Uhr`;
  }
});
