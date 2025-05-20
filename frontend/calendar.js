document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");
  const form = document.getElementById("bookingForm");
  const startInfo = document.getElementById("startTimeInfo");
  const endInfo = document.getElementById("endTimeInfo");

  let selectedSlot = null;

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "timeGridDay",
    slotMinTime: "12:00:00",
    slotMaxTime: "20:00:00",
    allDaySlot: false,
    locale: "de",
    headerToolbar: {
      left: "prev,next",
      center: "title",
      right: "today"
    },
    dateClick: function (info) {
      selectedSlot = info.date;
      highlightSelectedSlot(info.dateStr);
      form.style.display = "block";

      const start = new Date(info.date);
      const end = new Date(start.getTime() + getDuration());

      startInfo.innerText = formatTime(start);
      endInfo.innerText = formatTime(end);
    },
  });

  calendar.render();

  document.getElementById("duration").addEventListener("change", () => {
    if (!selectedSlot) return;
    const start = new Date(selectedSlot);
    const end = new Date(start.getTime() + getDuration());
    endInfo.innerText = formatTime(end);
  });

  function getDuration() {
    const duration = document.getElementById("duration").value;
    return parseInt(duration) * 60000;
  }

  function formatTime(date) {
    return date.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function highlightSelectedSlot(dateStr) {
    // Entferne alte Markierung
    document.querySelectorAll(".fc-highlight").forEach(el => el.classList.remove("fc-highlight"));

    const slotElements = document.querySelectorAll(`[data-time]`);
    slotElements.forEach(el => {
      if (el.getAttribute("data-time") === dateStr.slice(11, 16) + ":00") {
        el.classList.add("fc-highlight");
      }
    });
  }
});
