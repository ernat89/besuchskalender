document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");
  const calendar = new FullCalendar.Calendar(calendarEl, {
    locale: "de",
    initialView: "timeGridDay",
    slotDuration: "00:30:00",
    slotMinTime: "12:00:00",
    slotMaxTime: "20:00:00",
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
      updateEndTime();
      document.getElementById("name").focus();
    }
  });
  calendar.render();

  async function fetchEvents(info, successCallback) {
    const date = info.startStr.split("T")[0];
    const res = await fetch(`/api/bookings?date=${date}`);
    const bookings = await res.json();

    const events = bookings.map(b => ({
      title: b.name || "Belegt",
      start: `${b.date}T${b.start}`,
      end: `${b.date}T${b.end}`,
      backgroundColor: "#ff4d4d",
      borderColor: "#cc0000",
    }));

    successCallback(events);
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

    const [h, m] = timeStr.split(":").map(Number);
    const end = new Date();
    end.setHours(h);
    end.setMinutes(m + duration);

    infoBox.textContent = `Ende: ${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")} Uhr`;
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
        setTimeout(() => location.reload(), 2000);
      } else {
        alert("Fehler bei der Buchung.");
      }
    } catch (err) {
      console.error(err);
      alert("Serverfehler.");
    }
  });
});
