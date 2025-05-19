document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");
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
    select: function (info) {
      const selectedDate = info.startStr.substring(0, 10);
      const selectedTime = info.startStr.substring(11, 16);
      document.getElementById("selectedDate").value = selectedDate;
      document.getElementById("selectedTime").value = selectedTime;
      document.getElementById("bookingFormWrapper").style.display = "block";
      updateStartEndTime(selectedTime);
    },
    events: "/api/bookings"
  });

  calendar.render();

  function updateStartEndTime(startTime) {
    const duration = parseInt(document.getElementById("duration").value);
    const start = new Date(`1970-01-01T${startTime}:00Z`);
    start.setMinutes(start.getMinutes() + duration);
    const end = start.toISOString().substr(11, 5);

    document.getElementById("startEndTimeInfo").innerHTML = `
      <p>Start: ${startTime} Uhr<br>Ende: ${end} Uhr</p>
    `;
  }

  document.getElementById("duration").addEventListener("change", () => {
    const startTime = document.getElementById("selectedTime").value;
    if (startTime) updateStartEndTime(startTime);
  });

  document.getElementById("bookingForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const data = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      date: document.getElementById("selectedDate").value,
      time: document.getElementById("selectedTime").value,
      duration: document.getElementById("duration").value
    };

    const res = await fetch("/api/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (res.ok) {
      document.getElementById("successMessage").innerText = "✅ Termin erfolgreich eingetragen!";
      calendar.refetchEvents();
      setTimeout(() => {
        document.getElementById("bookingFormWrapper").style.display = "none";
        document.getElementById("bookingForm").reset();
        document.getElementById("startEndTimeInfo").innerHTML = "";
      }, 1500);
    } else {
      document.getElementById("successMessage").innerText = "❌ Fehler beim Speichern!";
    }
  });
});
