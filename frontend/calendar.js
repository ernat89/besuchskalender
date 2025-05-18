document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");

  const calendar = new FullCalendar.Calendar(calendarEl, {
    locale: "de",
    initialView: "timeGridDay",
    slotDuration: "00:30:00",
    slotMinTime: "13:00:00",
    slotMaxTime: "20:00:00",
    nowIndicator: true,
    selectable: true,
    allDaySlot: false,
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: ""
    },
    events: [] // kann später mit fetchEvents ersetzt werden
  });

  calendar.render();
});
