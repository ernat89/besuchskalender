// calendar.js
document.addEventListener('DOMContentLoaded', function() {
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

  // FullCalendar initialisieren
  const calendar = new FullCalendar.Calendar(calendarEl, {
    locale:        'de',
    initialView:   'timeGridDay',     // Tagesansicht mit Stunden
    slotMinTime:   '12:00:00',        // frühester Slot
    slotMaxTime:   '20:00:00',        // spätester Slot
    slotDuration:  '00:30:00',
    allDaySlot:    false,             // kein ganztägiger Slot
    nowIndicator:  true,
    height:        'auto',
    headerToolbar: {
      left:   'prev,next today',
      center: 'title',
      right:  ''
    },

    // Events vom Backend laden
    events: function(fetchInfo, successCallback, failureCallback) {
      const day = fetchInfo.startStr.slice(0,10);
      fetch(`/api/bookings?date=${day}`)
        .then(r => r.json())
        .then(bookings => {
          const events = bookings.map(b => ({
            title: b.name,  // Name im Slot
            start: `${b.date}T${b.start}`,
            end:   `${b.date}T${b.end}`,
            backgroundColor: '#ff4d4d',
            borderColor:     '#cc0000'
          }));
          successCallback(events);
        })
        .catch(err => failureCallback(err));
    },

    // Klick auf freien Slot
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

  // Formular-Zeitfelder aktualisieren
  timeInput.addEventListener('change', updateTimes);
  durationInput.addEventListener('change', updateTimes);

  function updateTimes() {
    const st  = timeInput.value;
    const dur = parseInt(durationInput.value, 10) || 0;
    startInfoEl.textContent = st ? `Start: ${st}` : '';
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

  // Formular absenden
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
