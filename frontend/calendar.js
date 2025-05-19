document.addEventListener("DOMContentLoaded", () => {
  let currentLang = "de";

  const calendarEl = document.getElementById("calendar");
  const formWrap = document.getElementById("bookingFormWrapper");
  const form = document.getElementById("bookingForm");
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const durSelect = document.getElementById("duration");
  const startDiv = document.getElementById("startTime");
  const endDiv = document.getElementById("endTime");
  const successDiv = document.getElementById("successMessage");

  // Sprachwechsel
  document.querySelectorAll("#langSwitch button").forEach(btn => {
    btn.onclick = () => {
      currentLang = btn.dataset.lang;
      document.querySelectorAll("#langSwitch button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      calendar.setOption("locale", currentLang);
      // hier könntest du noch alle labels neu setzen
    };
  });

  // FullCalendar-Initialisierung
  const calendar = new FullCalendar.Calendar(calendarEl, {
    locale: currentLang,
    initialView: "timeGridDay",
    slotMinTime: "12:00:00",
    slotMaxTime: "20:00:00",
    slotDuration: "00:30:00",
    nowIndicator: true,
    headerToolbar: { left: "prev,next today", center: "title", right: "" },
    selectable: true,
    dateClick: info => {
      const [date, time] = info.dateStr.split("T");
      document.getElementById("bookingFormWrapper").style.display = "block";
      nameInput.focus();
      selectedDate = date;
      selectedTime = time.slice(0, 5);
      updateStartEnd();
    },
    events: async fetchEvents
  });
  calendar.render();

  async function fetchEvents(fetchInfo, success) {
    const date = fetchInfo.startStr.slice(0, 10);
    const res = await fetch(`/api/bookings?date=${date}`);
    const bookings = await res.json();
    const ev = bookings.map(b => ({
      title: b.name,
      start: `${b.date}T${b.start}`,
      end: `${b.date}T${b.end}`,
      backgroundColor: "#ff4d4d",
      borderColor: "#cc0000"
    }));
    success(ev);
  }

  let selectedDate = null;
  let selectedTime = null;

  durSelect.onchange = updateStartEnd;
  function updateStartEnd() {
    if (!selectedTime) return;
    startDiv.textContent = `Start: ${selectedTime}`;
    const [h, m] = selectedTime.split(":").map(Number);
    const dur = Number(durSelect.value);
    const d = new Date();
    d.setHours(h, m + dur);
    const eh = String(d.getHours()).padStart(2, "0");
    const em = String(d.getMinutes()).padStart(2, "0");
    endDiv.textContent = `Ende: ${eh}:${em}`;
  }

  form.onsubmit = async e => {
    e.preventDefault();
    const payload = {
      name: nameInput.value,
      email: emailInput.value,
      date: selectedDate,
      time: selectedTime,
      duration: durSelect.value
    };
    const res = await fetch("/api/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      successDiv.textContent = "✅ Buchung erfolgreich!";
      successDiv.style.color = "green";
      form.reset();
      setTimeout(() => {
        formWrap.style.display = "none";
        calendar.refetchEvents();
      }, 1500);
    } else {
      successDiv.textContent = "Fehler!";
      successDiv.style.color = "red";
    }
  };
});
