document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");

  const calendar = new FullCalendar.Calendar(calendarEl, {
    locale: 'de',
    initialView: 'timeGridDay',
    slotDuration: '00:30:00',
    slotMinTime: '12:00:00',
    slotMaxTime: '20:00:00',
    nowIndicator: true,
    allDaySlot: true,
    selectable: true,
    headerToolbar: {
      left: 'prev,next',
      center: 'title',
      right: 'today'
    },
    buttonText: {
      today: 'Heute'
    },
    events: fetchEvents,
    dateClick: function(info) {
      showForm(info.dateStr);
    }
  });

  calendar.render();

  // 1) Events vom Server holen
  async function fetchEvents(fetchInfo, successCallback) {
    const date = fetchInfo.startStr.split('T')[0];
    const res = await fetch(`/api/bookings?date=${date}`);
    const bookings = await res.json();
    successCallback(bookings.map(b => ({
      title: b.name,        // hier siehst du direkt den Namen
      start: `${b.date}T${b.start}`,
      end:   `${b.date}T${b.end}`,
      backgroundColor: '#ff4d4d',
      borderColor: '#cc0000'
    })));
  }

  // 2) Formular anzeigen und ausfüllen
  function showForm(fullDateTime) {
    const [date, time] = fullDateTime.split('T');
    document.getElementById('selectedDate').value = date;
    document.getElementById('selectedTime').value = time.substring(0,5);
    document.getElementById('bookingFormWrapper').style.display = 'block';
    document.getElementById('name').focus();
    updateEndTime();
  }

  // 3) Ende-Zeit berechnen
  document.getElementById('duration').addEventListener('change', updateEndTime);
  function updateEndTime() {
    const start = document.getElementById('selectedTime').value;
    const dur   = parseInt(document.getElementById('duration').value, 10);
    if (!start || isNaN(dur)) {
      document.getElementById('endTimeInfo').textContent = '';
      return;
    }
    const [h, m] = start.split(':').map(Number);
    const d = new Date(); d.setHours(h); d.setMinutes(m + dur);
    const hh = String(d.getHours()).padStart(2,'0');
    const mm = String(d.getMinutes()).padStart(2,'0');
    document.getElementById('endTimeInfo').textContent = `Start: ${start} Uhr · Ende: ${hh}:${mm} Uhr`;
  }

  // 4) Absenden
  document.getElementById('bookingForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const name  = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const date  = document.getElementById('selectedDate').value;
    const time  = document.getElementById('selectedTime').value;
    const duration = document.getElementById('duration').value;

    const payload = { name, email, date, time, duration };
    const res = await fetch('/api/book', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      // Formular zurücksetzen
      this.reset();
      this.closest('#bookingFormWrapper').style.display = 'none';
      calendar.refetchEvents();      // Kalender aktualisieren
    } else {
      alert('Fehler bei der Buchung.');
    }
  });
});
