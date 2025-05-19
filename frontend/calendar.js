// Zugriff auf FullCalendar
const { Calendar, globalLocales } = FullCalendar;

document.addEventListener("DOMContentLoaded", function() {
  // 1) Mehrsprachige Buttontexte
  const translations = {
    de: { today: "Heute" },
    en: { today: "Today" },
    tr: { today: "Bugün" }
  };
  let currentLang = "de";

  // Sprach‐Switcher
  document.querySelectorAll("#languageSwitcher button").forEach(btn => {
    btn.addEventListener("click", () => {
      currentLang = btn.dataset.lang;
      calendar.setOption("locale", currentLang);
      calendar.setOption("buttonText", { today: translations[currentLang].today });
    });
  });

  // 2) Kalender initialisieren
  const calendarEl = document.getElementById("calendar");
  const calendar = new Calendar(calendarEl, {
    locales: globalLocales,
    locale: currentLang,
    initialView: "timeGridDay",
    slotDuration: "00:30:00",
    slotMinTime: "12:00:00",
    slotMaxTime: "20:00:00",
    nowIndicator: true,
    allDaySlot: false,
    selectable: true,
    expandRows: true,
    contentHeight: "auto",
    headerToolbar: {
      left: "prev,next",
      center: "title",
      right: "today"
    },
    buttonText: {
      today: translations[currentLang].today
    },
    // Events vom Backend holen
    events(fetchInfo, successCallback, failureCallback) {
      const day = fetchInfo.startStr.split("T")[0];
      fetch(`/api/bookings?date=${day}`)
        .then(r => r.json())
        .then(bookings => {
          const evs = bookings.map(b => ({
            title: `${b.start}–${b.end}  ${b.name}`,
            start: `${b.date}T${b.start}`,
            end:   `${b.date}T${b.end}`,
            backgroundColor: "#ff4d4d",
            borderColor: "#cc0000"
          }));
          successCallback(evs);
        })
        .catch(err => failureCallback(err));
    },
    // Klick aufs Grid öffnet Formular
    dateClick(info) {
      showForm(info.dateStr);
    }
  });

  calendar.render();

  // 3) Formular‐Logik
  const wrapper    = document.getElementById("bookingFormWrapper");
  const form       = document.getElementById("bookingForm");
  const durationEl = document.getElementById("duration");
  const startEl    = document.getElementById("startTimeInfo");
  const endEl      = document.getElementById("endTimeInfo");
  const successEl  = document.getElementById("successMessage");

  let selectedDate, selectedTime;

  function showForm(dateTime) {
    [selectedDate, selectedTime] = dateTime.split("T");
    selectedTime = selectedTime.substr(0,5);
    wrapper.classList.remove("hidden");
    startEl.textContent = `Start: ${selectedTime} Uhr`;
    updateEnd();
  }

  function updateEnd() {
    const dur = parseInt(durationEl.value,10);
    if (!selectedTime || isNaN(dur)) {
      endEl.textContent = "";
      return;
    }
    const [h,m] = selectedTime.split(":").map(Number);
    const dt = new Date();
    dt.setHours(h);
    dt.setMinutes(m+dur);
    const hh = String(dt.getHours()).padStart(2,"0");
    const mm = String(dt.getMinutes()).padStart(2,"0");
    endEl.textContent = `Ende: ${hh}:${mm} Uhr`;
  }
  durationEl.addEventListener("change", updateEnd);

  form.addEventListener("submit", async function(e) {
    e.preventDefault();
    const payload = {
      name:     form.name.value,
      email:    form.email.value,
      date:     selectedDate,
      time:     selectedTime,
      duration: durationEl.value
    };
    const res = await fetch("/api/book", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload)
    });
    if (res.ok) {
      form.reset();
      wrapper.classList.add("hidden");
      successEl.textContent = "✅ Buchung erfolgreich!";
      successEl.classList.remove("hidden");
      setTimeout(()=>location.reload(), 2000);
    } else {
      alert("Fehler bei der Buchung.");
    }
  });
});
