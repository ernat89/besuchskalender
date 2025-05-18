document.getElementById("bookingForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;
  const duration = document.getElementById("duration").value;

  const payload = { name, email, date, time, duration };

  try {
    const res = await fetch("/api/book", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      alert("Danke, deine Buchung wurde gespeichert!");
      document.getElementById("bookingForm").reset();
    } else {
      alert("Es gab ein Problem. Bitte überprüfe deine Angaben.");
    }
  } catch (err) {
    console.error("Fehler beim Absenden:", err);
    alert("Fehler beim Verbinden mit dem Server.");
  }
});
