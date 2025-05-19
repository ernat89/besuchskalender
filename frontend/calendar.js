document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: window.innerWidth < 768 ? "listDay" : "timeGridDay",
    locale: "de",
    slotMinTime: "12:00:00",
    slotMaxTime: "20:30:00",
    slotDuration: "00:30:00",
    selectable: true,
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: ""
    },
    dateClick: function (info) {
      const selected = info.dateStr;
      const time = selected.substring(11, 16);
      document.getElementById("selectedDate").value = selected.substring(0, 10);
      document.getElementById("selectedTime").value = time;

      updateStartEndTime();

      document.getElementById("bookingFormWrapper").style.display = "block";
    },
    events: "/api/bookings"
  });

  calendar.render();

  window.addEventListener("resize", function () {
    const view = window.innerWidth < 768 ? "listDay" : "timeGridDay";
    if (calendar.view.type !== view) {
      calendar.changeView(view);
    }
  });
});

function updateStartEndTime() {
  const date = document.getElementById("selectedDate").value;
  const time = document.getElementById("selectedTime").value;
  const duration = parseInt(document.getElementById("duration").value);

  const startDate = new Date(`${date}T${time}`);
  const endDate = new Date(startDate.getTime() + duration * 60000);

  document.getElementById("startTimeInfo").innerText = "Start: " + time;
  document.getElementById("endTimeInfo").innerText = "Ende: " + endDate.toTimeString().substr(0, 5);
}

document.getElementById("duration").addEventListener("change", updateStartEndTime);

document.getElementById("bookingForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const body = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    date: document.getElementById("selectedDate").value,
    time: document.getElementById("selectedTime").value,
    duration: document.getElementById("duration").value
  };

  const res = await fetch("/api/book", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (res.ok) {
    document.getElementById("successMessage").style.display = "block";
    setTimeout(() => window.location.reload(), 1500);
  }
});
