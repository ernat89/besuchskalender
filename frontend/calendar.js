document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");

  const calendar = new FullCalendar.Calendar(calendarEl, {
    locale: "de",
    initialView: "timeGridDay",
    slotDuration: "00:30:00",
    slotMinTime: "12:00:00",
    slotMaxTime: "20:30:00",
    nowIndicator: true,
    selectable: true,
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
      updateStartAndEndTime();
    }
  });

  calendar.render();

  async function fetchEvents(info, successCallback, failureCallback) {
    const startDate = info.startStr.split("T")[0];
    const res = await fetch(`/api/bookings?date=${startDate}`);
    const bookings = await res.json();

    const events = bookings.map(b => ({
      title: `Belegt: ${b.name}`,
      start: `${b.date}T${b.start}`,
      end: `${b.date}T${b.end}`,
      backgroundColor: "#ff4d4d",
      borderColor: "#cc0000",
      display: "block"
    }));

    successCallback(events);
  }

  function updateStartAndEndTime() {
    const start = document.getElementById("selectedTime").value;
    const duration = parseInt(document.getElementById("duration").value, 10);
    const startBox = document.getElementById("startTimeInfo");
    const endBox = document.getElementById("endTimeInfo");

    if (!start || isNaN(duration)) {
      startBox.textContent = "";
      endBox.textContent = "";
      return;
    }

    const [h, m] = start.split(":").map(Number);
    const date = new Date();
    date.setHours(h, m);

    const startStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    date.setMinutes(date.getMinutes() + duration);
    const endStr = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

    startBox.textContent = `Start: ${startStr} Uhr`;
    endBox.textContent = `Ende: ${endStr} Uhr`;
  }

  document.getElementById("duration").addEventListener("change", updateStartAndEndTime);

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
        document.getElementById("successMessage").style.display = "block";
        setTimeout(() => location.reload(), 2500);
      } else {
        alert("Fehler bei der Buchung.");
      }
    } catch (err) {
      console.error(err);
      alert("Serverfehler.");
    }
  });
});
