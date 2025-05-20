document.addEventListener("DOMContentLoaded", () => {
  const calendarEl = document.getElementById("calendar");

  const calendar = new FullCalendar.Calendar(calendarEl, {
    locale: "de",
    initialView: "timeGridDay",
    slotDuration: "00:30:00",
    slotMinTime: "12:00:00",
    slotMaxTime: "20:00:00",
    allDaySlot: true,
    nowIndicator: true,
    selectable: false,
    height: "auto",
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: ""
    },
    events: fetchEvents,
    dateClick: info => showForm(info.dateStr)
  });

  calendar.render();

  async function fetchEvents(info, successCallback, failureCallback) {
    try {
      const day = info.startStr.split("T")[0];
      const res = await fetch(`/api/bookings?date=${day}`);
      const bookings = await res.json();
      const events = bookings.map(b => ({
        title: `${b.start}–${b.end}\n${b.name}`,
        start: `${b.date}T${b.start}`,
        end:   `${b.date}T${b.end}`,
        backgroundColor: "#ff4d4d",
        borderColor:     "#cc0000",
        display: "block"
      }));
      successCallback(events);
    } catch (err) {
      failureCallback(err);
    }
  }

  function showForm(dateTime) {
    const [date, time] = dateTime.split("T");
    document.getElementById("selectedDate").value = date;
    document.getElementById("selectedTime").value = time.substr(0,5);
    document.getElementById("bookingFormWrapper").style.display = "block";
    updateTimes();
    document.getElementById("name").focus();
  }

  document.getElementById("bookingForm").addEventListener("submit", async e => {
    e.preventDefault();
    const name     = document.getElementById("name").value.trim();
    const email    = document.getElementById("email").value.trim();
    const date     = document.getElementById("selectedDate").value;
    const time     = document.getElementById("selectedTime").value;
    const duration = document.getElementById("duration").value;

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, date, time, duration })
      });
      if (!res.ok) throw new Error();
      document.getElementById("bookingForm").reset();
      document.getElementById("bookingFormWrapper").style.display = "none";
      const msg = document.getElementById("successMessage");
      msg.textContent = "✅ Buchung erfolgreich!";
      msg.style.display = "block";
      setTimeout(() => location.reload(), 1500);
    } catch {
      alert("Fehler bei der Buchung.");
    }
  });

  document.getElementById("duration").addEventListener("change", updateTimes);

  function updateTimes() {
    const startStr = document.getElementById("selectedTime").value;
    const dur      = parseInt(document.getElementById("duration").value, 10);
    const startEl  = document.getElementById("startTimeInfo");
    const endEl    = document.getElementById("endTimeInfo");
    if (!startStr || isNaN(dur)) {
      startEl.textContent = "";
      endEl.textContent   = "";
      return;
    }
    const [h, m] = startStr.split(":").map(Number);
    const dt     = new Date();
    dt.setHours(h);
    dt.setMinutes(m + dur);
    const endH = String(dt.getHours()).padStart(2,"0");
    const endM = String(dt.getMinutes()).padStart(2,"0");
    startEl.textContent = `Start: ${h.toString().padStart(2,"0")}:${m.toString().padStart(2,"0")} Uhr`;
    endEl.textContent   = `Ende: ${endH}:${endM} Uhr`;
  }
});
