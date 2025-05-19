document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");
  const calendar = new FullCalendar.Calendar(calendarEl, {
    locale: "de",
    initialView: "timeGridDay",
    slotMinTime: "12:00:00",
    slotMaxTime: "20:00:00",
    selectable: true,
    allDaySlot: false,
    nowIndicator: true,
    height: "auto",
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: ""
    },
    buttonText: {
      today: "Heute"
    },
    events: "/api/bookings",
    dateClick: function (info) {
      const selectedDate = info.dateStr.substring(0, 10);
      const selectedTime = info.dateStr.substring(11, 16);
      document.getElementById("selectedDate").value = selectedDate;
      document.getElementById("selectedTimeValue").value = selectedTime;
      document.getElementById("selectedTime").textContent = `Start: ${selectedTime}`;
      document.getElementById("bookingFormWrapper").style.display = "block";
    }
  });
  calendar.render();

  document.getElementById("bookingForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const duration = document.getElementById("duration").value;
    const date = document.getElementById("selectedDate").value;
    const time = document.getElementById("selectedTimeValue").value;

    const res = await fetch("/api/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, date, time, duration })
    });

    if (res.ok) {
      location.reload();
    } else {
      alert("Fehler beim Buchen");
    }
  });
});
