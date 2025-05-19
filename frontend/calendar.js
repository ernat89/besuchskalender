document.addEventListener("DOMContentLoaded", () => {
  const calendarEl = document.getElementById("calendar");
  const formWrapper = document.getElementById("bookingFormWrapper");
  const successMsg  = document.getElementById("success");
  const timeInfo    = document.getElementById("timeInfo");

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'timeGridDay',
    locale: 'de',
    nowIndicator: true,
    slotMinTime: '12:00:00',
    slotMaxTime: '20:00:00',
    slotDuration: '00:30:00',
    selectable: true,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: ''
    },
    events: async info => {
      const res = await fetch(`/api/bookings?date=${info.startStr.split("T")[0]}`);
      return await res.json();
    },
    dateClick(info) {
      const [date, time] = info.dateStr.split("T");
      document.getElementById("selectedDate").value = date;
      document.getElementById("selectedTime").value = time.substr(0,5);
      formWrapper.classList.remove("hidden");
      updateTimeInfo();
      document.getElementById("name").focus();
    }
  });

  calendar.render();

  document.getElementById("duration").addEventListener("change", updateTimeInfo);
  document.getElementById("bookingForm").addEventListener("submit", async e => {
    e.preventDefault();
    const payload = {
      name:  document.getElementById("name").value,
      email: document.getElementById("email").value,
      date:  document.getElementById("selectedDate").value,
      time:  document.getElementById("selectedTime").value,
      duration: document.getElementById("duration").value
    };
    const res = await fetch('/api/book', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      successMsg.classList.remove("hidden");
      setTimeout(()=>location.reload(), 2000);
    } else {
      alert("Fehler!");
    }
  });

  function updateTimeInfo() {
    const start = document.getElementById("selectedTime").value;
    const dur   = +document.getElementById("duration").value;
    if (!start) return timeInfo.textContent = '';
    const [h,m] = start.split(':').map(Number);
    const d    = new Date(); d.setHours(h); d.setMinutes(m + dur);
    const end  = d.toTimeString().substr(0,5);
    timeInfo.textContent = `Start: ${start} Uhr — Ende: ${end} Uhr`;
  }
});
