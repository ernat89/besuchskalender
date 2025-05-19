const translations = {
  de: {
    title: "Besuchskalender",
    formTitle: "Besuch eintragen",
    labelName: "Vorname oder Initiale:",
    labelEmail: "E-Mail-Adresse:",
    labelDuration: "Dauer des Besuchs:",
    consentLegend: "Bitte bestätigen:",
    checkboxHealth: "Ich bin gesund und symptomfrei.",
    checkboxData: "Ich bin mit der Speicherung meiner Daten einverstanden.",
    checkboxEmail: "Ich akzeptiere den E-Mail-Versand zur Bestätigung.",
    submit: "Besuch eintragen"
  },
  en: {
    title: "Visit Scheduler",
    formTitle: "Enter Visit",
    labelName: "First Name or Initial:",
    labelEmail: "Email Address:",
    labelDuration: "Visit Duration:",
    consentLegend: "Please confirm:",
    checkboxHealth: "I am healthy and symptom-free.",
    checkboxData: "I consent to the storage of my data.",
    checkboxEmail: "I accept confirmation via email.",
    submit: "Submit Visit"
  },
  tr: {
    title: "Ziyaret Takvimi",
    formTitle: "Ziyaret Girişi",
    labelName: "Ad veya Baş Harf:",
    labelEmail: "E-posta Adresi:",
    labelDuration: "Ziyaret Süresi:",
    consentLegend: "Lütfen onaylayın:",
    checkboxHealth: "Sağlıklıyım ve semptom göstermiyorum.",
    checkboxData: "Verilerimin saklanmasını kabul ediyorum.",
    checkboxEmail: "Onay e-postasını kabul ediyorum.",
    submit: "Ziyareti Gönder"
  }
};

document.getElementById("language").addEventListener("change", function () {
  const lang = this.value;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    el.textContent = translations[lang][key] || el.textContent;
  });
  document.querySelectorAll("[data-i18n-value]").forEach(el => {
    const key = el.getAttribute("data-i18n-value");
    el.value = translations[lang][key] || el.value;
  });
});
