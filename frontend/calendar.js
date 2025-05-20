document.addEventListener("DOMContentLoaded", ()=>{
  const calEl       = document.getElementById("calendar");
  const formWrap    = document.getElementById("bookingFormWrapper");
  const form        = document.getElementById("bookingForm");
  const startEl     = document.getElementById("startTime");
  const endEl       = document.getElementById("endTime");
  const durSel      = document.getElementById("duration");
  let selectedDate  = null;
  let highlightBgEv = null;

  const calendar = new FullCalendar.Calendar(calEl, {
    initialView:    "timeGridDay",
    locale:         "de",
    slotDuration:   "00:30:00",
    slotMinTime:    "12:00:00",
    slotMaxTime:    "19:00:00",      // nach 19 Uhr kein riesiger Bereich
    nowIndicator:   true,
    allDaySlot:     true,            // Anzeige der All-Day-Leiste
    selectable:     true,
    headerToolbar:  { left:"prev,next today", center:"title", right:"" },
    buttonText:     { today: "Heute" },

    events: async (info, success, failure)=>{
      try {
        const date = info.startStr.split("T")[0];
        const res  = await fetch(`/api/bookings?date=${date}`);
        const arr  = await res.json();
        // Mappe Booking + Blocker
        success(arr.map(e=>{
          if (e.type==="block") {
            return {
              title:    "Gesperrt",
              start:    e.date,
              allDay:   true,
              display:  "background",
              backgroundColor:"#88888880"
            };
          } else {
            return {
              title:    "Belegt",
              start:    `${e.date}T${e.start}`,
              end:      `${e.date}T${e.end}`,
              backgroundColor:"#ff4d4d",
              borderColor:    "#cc0000",
              display:        "block"
            };
          }
        }));
      } catch(err) {
        failure(err);
      }
    },

    dateClick: info=>{
      // entferne alte Markierung
      if (highlightBgEv) highlightBgEv.remove();
      // Highlight 30 Min. block
      const end = new Date(info.date.getTime()+30*60000);
      highlightBgEv = calendar.addEvent({
        display:         "background",
        start:           info.date,
        end:             end,
        backgroundColor: "#0077cc40"
      });

      selectedDate = info.date;
      formWrap.style.display = "block";
      updateTimeInfo();
      form.name.focus();
    }
  });

  calendar.render();

  durSel.addEventListener("change", updateTimeInfo);

  function updateTimeInfo(){
    if (!selectedDate) return;
    const hh = String(selectedDate.getHours()).padStart(2,"0");
    const mm = String(selectedDate.getMinutes()).padStart(2,"0");
    const dur= parseInt(durSel.value,10);
    const endDt = new Date(selectedDate.getTime()+dur*60000);
    const eh = String(endDt.getHours()).padStart(2,"0");
    const em = String(endDt.getMinutes()).padStart(2,"0");
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
    const res = await fetch("/api/book", {
      method:  "POST",
      headers: {"Content-Type":"application/json"},
      body:    JSON.stringify(payload)
    });
    if (res.ok) {
      calendar.refetchEvents();
      form.reset();
      formWrap.style.display = "none";
      if (highlightBgEv) highlightBgEv.remove();
      alert("Gebucht!");
    } else {
      alert("Fehler!");
    }
  });
});
