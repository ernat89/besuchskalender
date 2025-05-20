document.addEventListener("DOMContentLoaded", function() {
  const calendarEl = document.getElementById("calendar");

  const calendar = new FullCalendar.Calendar(calendarEl, {
    locale: "de",
    initialView: "timeGridDay",
    slotDuration: "00:30:00",
    slotMinTime: "12:00:00",
    slotMaxTime: "20:00:00",
    allDaySlot: true,
    nowIndicator: true,
    selectable: true,
    headerToolbar: {
      left: "prev,next",
      center: "title",
      right: "today"
    },
    buttonText: { today: "Heute" },
    events: fetchEvents,
    dateClick: info => showForm(info.dateStr)
  });

  calendar.render();

  async function fetchEvents(fetchInfo, successCallback) {
    const day = fetchInfo.startStr.split("T")[0];
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
  }

  function showForm(dateTime) {
    const [date, time] = dateTime.split("T");
    document.getElementById("selectedDate").value = date;
    document.getElementById("selectedTime").value = time.substring(0,5);
    document.getElementById("bookingFormWrapper").style.display = "block";
    document.getElementById("name").focus();
    updateEndTime();
  }

  document.getElementById("duration").addEventListener("change", updateEndTime);

  function updateEndTime() {
    const start = document.getElementById("selectedTime").value;
    const dur   = parseInt(document.getElementById("duration").value,10);
    if (!start || isNaN(dur)) {
      document.getElementById("endTimeInfo").textContent = "";
      return;
    }
    const [h,m] = start.split(":").map(Number);
    const d = new Date(); d.setHours(h); d.setMinutes(m + dur);
    const hh = String(d.getHours()).padStart(2,"0");
    const mm = String(d.getMinutes()).padStart(2,"0");
    document.getElementById("endTimeInfo").textContent =
      `Start: ${start} Uhr · Ende: ${hh}:${mm} Uhr`;
  }

  document.getElementById("bookingForm").addEventListener("submit", async e => {
    e.preventDefault();
    const payload = {
      name:     document.getElementById("name").value,
      email:    document.getElementById("email").value,
      date:     document.getElementById("selectedDate").value,
      time:     document.getElementById("selectedTime").value,
      duration: document.getElementById("duration").value
    };
    const res = await fetch("/api/book", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload)
    });
    if (res.ok) {
      // Formular zurücksetzen, schließen, und Events neu holen
      e.target.reset();
      document.getElementById("bookingFormWrapper").style.display = "none";
      calendar.refetchEvents();
    } else {
      alert("Fehler bei der Buchung.");
    }
  });
});
