document.addEventListener("DOMContentLoaded", function() {
  const calendarEl = document.getElementById("calendar");
  let highlightEvent = null;
  let selectedDate = null;

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView:    "timeGridDay",
    locale:         "de",
    slotDuration:   "00:30:00",
    slotMinTime:    "13:00:00",
    slotMaxTime:    "20:00:00",
    nowIndicator:   true,
    allDaySlot:     false,
    selectable:     true,
    headerToolbar:  { left:"prev,next today", center:"title", right:"" },
    buttonText:     { today: "Heute" },

    events: async (info, success, failure) => {
      try {
        const date = info.startStr.split("T")[0];
        const res  = await fetch(`/api/bookings?date=${date}`);
        const arr  = await res.json();
        success(arr.map(b => ({
          title:          "Belegt",
          start:          `${b.date}T${b.start}`,
          end:            `${b.date}T${b.end}`,
          backgroundColor:"#ff4d4d",
          borderColor:    "#cc0000",
          display:        "block"
        })));
      } catch (e) {
        failure(e);
      }
    },

    dateClick: info => {
      // Hintergrund-Markierung
      if (highlightEvent) highlightEvent.remove();
      const end = new Date(info.date.getTime() + 30*60000);
      highlightEvent = calendar.addEvent({
        display:         "background",
        start:           info.date,
        end:             end,
        backgroundColor: "#0077cc40"
      });

      // Form öffnen
      selectedDate = info.date;
      document.getElementById("bookingFormWrapper").style.display = "block";
      updateTimeInfo();
      document.getElementById("name").focus();
    }
  });

  calendar.render();

  // Form-Logik
  const form     = document.getElementById("bookingForm");
  const startEl  = document.getElementById("startTime");
  const endEl    = document.getElementById("endTime");
  const durSel   = document.getElementById("duration");

  durSel.addEventListener("change", updateTimeInfo);

  function updateTimeInfo() {
    if (!selectedDate) return;
    const hh = String(selectedDate.getHours()).padStart(2,"0");
    const mm = String(selectedDate.getMinutes()).padStart(2,"0");
    const dur= parseInt(durSel.value,10);
    const endDate = new Date(selectedDate.getTime() + dur*60000);
    const eh = String(endDate.getHours()).padStart(2,"0");
    const em = String(endDate.getMinutes()).padStart(2,"0");

    startEl.textContent = `Start: ${hh}:${mm} Uhr`;
    endEl.textContent   = `Ende: ${eh}:${em} Uhr`;
  }

  form.addEventListener("submit", async e=>{
    e.preventDefault();
    const payload = {
      name:     form.name.value.trim(),
      email:    form.email.value.trim(),
      date:     selectedDate.toISOString().split("T")[0],
      time:     selectedDate.toTimeString().substr(0,5),
      duration: parseInt(durSel.value,10)
    };

    try {
      const res = await fetch("/api/book", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload)
      });
      if (res.ok) {
        calendar.refetchEvents();
        form.reset();
        document.getElementById("bookingFormWrapper").style.display = "none";
        if (highlightEvent) highlightEvent.remove();
        alert("Buchung erfolgreich!");
      } else {
        alert("Fehler beim Speichern.");
      }
    } catch (err) {
      console.error(err);
      alert("Serverfehler");
    }
  });
});
