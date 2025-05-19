document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");
  const calendar = new FullCalendar.Calendar(calendarEl, {
    locale: "de",
    initialView: "timeGridDay",
    slotMinTime: "13:00:00",
    slotMaxTime: "20:30:00",
    slotDuration: "00:30:00",
    allDaySlot: false,
    nowIndicator: true,
    selectable: true,
    contentHeight: "auto",
    expandRows: true,
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
      title: b.name,
      start: `${b.date}T${b.start}`,
      end: `${b.date}T${b.end}`,
      backgroundColor: "#ff4d4d",
      borderColor: "#cc0000"
    }));
    successCallback(events);
  }

  document.getElementById("duration").addEventListener("change", updateStartAndEndTime);

  function updateStartAndEndTime() {
    const start = document.getElementById("selectedTime").value;
    const duration = parseInt(document.getElementById("duration").value, 10);
    const [hour, minute] = start.split(":").map(Number);
    const startDate = new Date();
    startDate.setHours(hour, minute);

    const endDate = new Date(startDate.getTime() + duration * 60000);

    const formatTime = date => date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });

    document.getElementById("startTimeInfo").textContent = "Start: " + formatTime(startDate);
    document.getElementById("endTimeInfo").textContent = "Ende: " + formatTime(endDate);
  }

  document.getElementById("bookingForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const date = document.getElementById("selectedDate").value;
    const time = document.getElementById("selectedTime").value;
    const duration = document.getElementById("duration").value;

    const payload = { name, email, date, time, duration };

    const res = await fetch("/api/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      document.getElementById("successMessage").textContent = "✅ Buchung erfolgreich!";
      document.getElementById("bookingForm").reset();
      setTimeout(() => location.reload(), 3000);
    } else {
      alert("Fehler bei der Buchung.");
    }
  });
});
