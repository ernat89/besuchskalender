const translations = {
  de: {
    calendarTitle: "Besuchskalender",
    formTitle: "Besuch eintragen",
    nameLabel: "Vorname:",
    emailLabel: "E-Mail:",
    durationLabel: "Dauer:",
    confirmLegend: "Bitte bestätigen:",
    check1: "Ich bin gesund.",
    check2: "Ich bin mit der Datenverarbeitung zur Besuchsplanung einverstanden.",
    check3: "Ich akzeptiere die Bestätigung per E-Mail.",
  },
  en: {
    calendarTitle: "Visit Calendar",
    formTitle: "Book a Visit",
    nameLabel: "First name:",
    emailLabel: "Email:",
    durationLabel: "Duration:",
    confirmLegend: "Please confirm:",
    check1: "I am healthy.",
    check2: "I agree to data processing for planning.",
    check3: "I accept confirmation by email.",
  },
  tr: {
    calendarTitle: "Ziyaret Takvimi",
    formTitle: "Ziyaret Kaydı",
    nameLabel: "İsim:",
    emailLabel: "E-posta:",
    durationLabel: "Süre:",
    confirmLegend: "Lütfen onayla:",
    check1: "Sağlıklıyım.",
    check2: "Ziyaret planlaması için verilerimin kullanılmasını kabul ediyorum.",
    check3: "E-posta ile onay almayı kabul ediyorum.",
  }
};

function setLanguage(lang) {
  const t = translations[lang];
  if (!t) return;

  document.getElementById("calendarTitle").textContent = t.calendarTitle;
  document.getElementById("formTitle").textContent = t.formTitle;
  document.getElementById("nameLabel").textContent = t.nameLabel;
  document.getElementById("emailLabel").textContent = t.emailLabel;
  document.getElementById("durationLabel").textContent = t.durationLabel;
  document.getElementById("confirmLegend").textContent = t.confirmLegend;

  const checks = document.querySelectorAll("fieldset label");
  checks[0].childNodes[1].textContent = " " + t.check1;
  checks[1].childNodes[1].textContent = " " + t.check2;
  checks[2].childNodes[1].textContent = " " + t.check3;
}
