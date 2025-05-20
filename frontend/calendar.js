document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");
  const bookingForm = document.getElementById("bookingForm");
  const timeDisplay = document.getElementById("timeDisplay");

  let selectedStart = null;
  let selectedEnd = null;

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "timeGridDay",
    headerToolbar: {
      left: "prev,next",
      center: "title",
      right: "today"
    },
    slotMinTime: "12:00:00",
    slotMaxTime: "20:00:00",
    selectable: true,
    nowIndicator: true,
    select: function (info) {
      selectedStart = info.start;
      const duration = parseInt(document.getElementById("duration").value);
      selectedEnd = new Date(info.start.getTime() + duration * 60000);

      timeDisplay.innerText =
        "Start: " +
        selectedStart.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
        " – Ende: " +
        selectedEnd.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      bookingForm.style.display = "block";
    },
    events: "/api/bookings"
  });

  calendar.render();

  document.getElementById("duration").addEventListener("change", () => {
    if (selectedStart) {
      const duration = parseInt(document.getElementById("duration").value);
      selectedEnd = new Date(selectedStart.getTime() + duration * 60000);
      timeDisplay.innerText =
        "Start: " +
        selectedStart.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
        " – Ende: " +
        selectedEnd.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
  });
});

function submitBooking() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const duration = parseInt(document.getElementById("duration").value);
  const check1 = document.getElementById("check1").checked;
  const check2 = document.getElementById("check2").checked;
  const check3 = document.getElementById("check3").checked;

  if (!name || !email || !check1 || !check2 || !check3) {
    alert("Bitte alle Felder korrekt ausfüllen.");
    return;
  }

  const start = window.selectedStart.toISOString();
  const end = new Date(window.selectedStart.getTime() + duration * 60000).toISOString();

  fetch("/api/book", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name, email, start, end })
  })
    .then(res => res.json())
    .then(data => {
      alert("Buchung erfolgreich!");
      location.reload();
    })
    .catch(() => {
      alert("Fehler beim Speichern.");
    });
}
