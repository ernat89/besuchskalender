document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");

  const calendar = new FullCalendar.Calendar(calendarEl, {
    locale: "de",
    initialView: "timeGridDay",
    slotDuration: "00:30:00",
    slotMinTime: "12:00:00",
    slotMaxTime: "20:30:00",
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
      updateStartAndEndTime();
      document.getElementById("name").focus();
    }
  });

  calendar.render();

  async function fetchEvents(info, successCallback) {
    const date = info.startStr.split("T")[0];
    const res = await fetch(`/api/bookings?date=${date}`);
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

  document.getElementById("duration").addEventListener("change", updateStartAndEndTime);

  function updateStartAndEndTime() {
    const start = document.getElementById("selectedTime").value;
    const duration = parseInt(document.getElementById("duration").value, 10);
    const startInfo = document.getElementById("startTimeInfo");
    const endInfo = document.getElementById("endTimeInfo");

    if (!start || isNaN(duration)) {
      startInfo.textContent = "";
      endInfo.textContent = "";
      return;
    }

    const [hour, minute] = start.split(":").map(Number);
    const startDate = new Date();
    startDate.setHours(hour);
    startDate.setMinutes(minute);
    const endDate = new Date(startDate.getTime() + duration * 60000);

    const format = (d) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

    startInfo.textContent = `Beginn des Besuchs: ${format(startDate)} Uhr`;
    endInfo.textContent = `Ende des Besuchs: ${format(endDate)} Uhr`;
  }

  document.getElementById("bookingForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const payload = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      date: document.getElementById("selectedDate").value,
      time: document.getElementById("selectedTime").value,
      duration: document.getElementById("duration").value
    };

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
  });
});
