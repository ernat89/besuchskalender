// calendar.js
document.addEventListener('DOMContentLoaded', function() {
  // 1) DOM-Elemente
  const calendarEl    = document.getElementById('calendar');
  const formWrapper   = document.getElementById('bookingFormWrapper');
  const form          = document.getElementById('bookingForm');
  const nameInput     = document.getElementById('name');
  const emailInput    = document.getElementById('email');
  const dateInput     = document.getElementById('selectedDate');
  const timeInput     = document.getElementById('selectedTime');
  const durationInput = document.getElementById('duration');
  const startInfoEl   = document.getElementById('startTimeInfo');
  const endInfoEl     = document.getElementById('endTimeInfo');
  const successMsgEl  = document.getElementById('successMessage');

  // 2) Kalender initialisieren
  const calendar = new FullCalendar.Calendar(calendarEl, {
    locale: 'de',
    initialView: 'timeGridDay',
    slotMinTime: '12:00:00',
    slotMaxTime: '20:00:00',
    slotDuration: '00:30:00',
    allDaySlot: false,
    nowIndicator: true,
    height: 'auto',
    headerToolbar: {
      left:  'prev,next today',
      center:'title',
      right: ''
    },
    // 3) Termine vom Server laden
    events: function(fetchInfo, successCallback, failureCallback) {
      const date = fetchInfo.startStr.slice(0,10);
      fetch(`/api/bookings?date=${date}`)
        .then(res => res.json())
        .then(data => {
          const events = data.map(b => ({
            title: b.name,
            start: `${b.date}T${b.start}`,
            end:   `${b.date}T${b.end}`,
            backgroundColor: '#ff4d4d',
            borderColor:     '#cc0000'
          }));
          successCallback(events);
        })
        .catch(err => failureCallback(err));
    },
    // 4) Klick auf Slot → Formular anzeigen
    dateClick: function(info) {
      const [d, t] = info.dateStr.split('T');
      dateInput.value = d;
      timeInput.value = t.slice(0,5);
      updateTimes();
      formWrapper.style.display = 'block';
      nameInput.focus();
    }
  });

  calendar.render();

  // 5) Start/End-Zeit im Formular berechnen
  timeInput.addEventListener('change', updateTimes);
  durationInput.addEventListener('change', updateTimes);

  function updateTimes() {
    const st  = timeInput.value;
    const dur = parseInt(durationInput.value, 10) || 0;
    // Start
    startInfoEl.textContent = st ? `Start: ${st}` : '';
    // Ende
    if (st && dur) {
      const [h, m] = st.split(':').map(Number);
      const dt     = new Date();
      dt.setHours(h);
      dt.setMinutes(m + dur);
      const eh = String(dt.getHours()).padStart(2,'0');
      const em = String(dt.getMinutes()).padStart(2,'0');
      endInfoEl.textContent = `Ende: ${eh}:${em} Uhr`;
    } else {
      endInfoEl.textContent = '';
    }
  }

  // 6) Formular abschicken
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const payload = {
      name:     nameInput.value.trim(),
      email:    emailInput.value.trim(),
      date:     dateInput.value,
      time:     timeInput.value,
      duration: durationInput.value
    };
    fetch('/api/book', {
      method:  'POST',
      headers: {'Content-Type':'application/json'},
      body:    JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error();
        formWrapper.style.display = 'none';
        successMsgEl.textContent = '✅ Buchung erfolgreich!';
        successMsgEl.style.display = 'block';
        calendar.refetchEvents();
        setTimeout(() => successMsgEl.style.display = 'none', 3000);
      })
      .catch(() => alert('Fehler beim Eintragen.'));
  });
});
