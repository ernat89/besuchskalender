document.addEventListener("DOMContentLoaded", function(){
  const calendarEl = document.getElementById("calendar");
  let selectionBg = null;

  const cal = new FullCalendar.Calendar(calendarEl, {
    initialView: "timeGridDay",
    locale: "de",
    slotDuration: "00:30:00",
    slotMinTime: "13:00:00",
    slotMaxTime: "20:00:00",
    nowIndicator: true,
    allDaySlot: false,
    selectable: true,
    headerToolbar: { left:"prev,next", center:"title", right:"" },
    buttonText: { today:"Heute" },
    events: async (info, success, fail) => {
      try {
        const date = info.startStr.split("T")[0];
        let res = await fetch(`/api/bookings?date=${date}`);
        let data = await res.json();
        success(data.map(b => ({
          title: "Belegt",
          start: b.date+"T"+b.start,
          end:   b.date+"T"+b.end,
          backgroundColor:"#ff4d4d",
          borderColor:"#cc0000",
          display:"block"
        })));
      } catch(e){
        fail(e);
      }
    },
    dateClick: info => {
      if (selectionBg) selectionBg.remove();
      let end = new Date(info.date.getTime()+30*60000);
      selectionBg = cal.addEvent({
        display:"background",
        start:info.date,
        end:end,
        backgroundColor:"#0077cc40"
      });
      openForm(info.date);
    }
  });

  cal.render();

  const formWrap = document.getElementById("bookingFormWrapper");
  const form = document.getElementById("bookingForm");
  const sEl = document.getElementById("startTime");
  const eEl = document.getElementById("endTime");
  let selDate = null;

  function openForm(dt){
    selDate = dt;
    formWrap.style.display="block";
    updateTimes();
    document.getElementById("name").focus();
  }

  document.getElementById("duration").addEventListener("change", updateTimes);

  function updateTimes(){
    if (!selDate) return;
    let hh = String(selDate.getHours()).padStart(2,"0"),
        mm = String(selDate.getMinutes()).padStart(2,"0"),
        dur = parseInt(form.duration.value,10);
    let end = new Date(selDate.getTime()+dur*60000);
    let eh = String(end.getHours()).padStart(2,"0"),
        em = String(end.getMinutes()).padStart(2,"0");
    sEl.textContent = `Start: ${hh}:${mm} Uhr`;
    eEl.textContent = `Ende: ${eh}:${em} Uhr`;
  }

  form.addEventListener("submit", async e=>{
    e.preventDefault();
    const payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      date: selDate.toISOString().split("T")[0],
      time: selDate.toTimeString().substr(0,5),
      duration: parseInt(form.duration.value,10)
    };
    try {
      let res = await fetch("/api/book", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        form.reset();
        formWrap.style.display="none";
        if (selectionBg) selectionBg.remove();
        cal.refetchEvents();
        alert("Buchung erfolgreich!");
      } else {
        alert("Fehler beim Speichern.");
      }
    } catch(err){
      console.error(err);
      alert("Serverfehler");
    }
  });
});
