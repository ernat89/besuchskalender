const translations = {
  de: {
    title: "Besuchskalender",
    intro: "Hier siehst du, welche Zeiten schon belegt sind. Klicke auf einen freien Slot, um einen Besuch einzutragen.",
    form: {
      nameLabel: "Vorname oder Initiale:",
      emailLabel: "E-Mail-Adresse:",
      durationLabel: "Dauer des Besuchs:",
      confirm: "Bitte bestätigen:",
      check1: "Ich bin gesund und symptomfrei.",
      check2: "Ich bin mit der Speicherung meiner Daten zur Besuchskoordination einverstanden.",
      check3: "Ich akzeptiere den Erhalt einer Bestätigung per E-Mail.",
      check4: "Diese Seite wird ausschließlich privat genutzt.",
      submit: "Besuch eintragen"
    },
    cancel: {
      title: "Buchung stornieren",
      waiting: "Bitte warten...",
      success: "Deine Buchung wurde erfolgreich storniert.",
      error: "Es gab ein Problem bei der Stornierung."
    },
    admin: {
      heading:      "Admin-Bereich",
      loginText:    "Bitte Admin-Passwort eingeben:",
      button:       "Einloggen",
      wrong:        "Falsches Passwort.",
      logout:       "Logout",
      tableHeading: "Alle Buchungen",
      noBookings:   "Keine Buchungen gefunden.",
      // NEU: All-Day-Blocker
      blockHeading: "Tag sperren",
      blockLabel:   "Datum wählen:",
      blockButton:  "Sperren",
      blockSuccess: "Tag erfolgreich gesperrt.",
      blockError:   "Fehler beim Sperren des Tages"
    }
  },
  en: {
    title: "Visit Calendar",
    intro: "See which times are already booked. Click a free slot to schedule your visit.",
    form: {
      nameLabel: "First name or Initial:",
      emailLabel: "Email address:",
      durationLabel: "Visit duration:",
      confirm: "Please confirm:",
      check1: "I am healthy and symptom-free.",
      check2: "I agree that my data is stored to coordinate visits.",
      check3: "I agree to receive a confirmation email.",
      check4: "This site is for private use only.",
      submit: "Submit visit"
    },
    cancel: {
      title: "Cancel Booking",
      waiting: "Please wait...",
      success: "Your booking has been successfully canceled.",
      error: "An error occurred during cancellation."
    },
    admin: {
      heading:      "Admin Area",
      loginText:    "Please enter admin password:",
      button:       "Login",
      wrong:        "Wrong password.",
      logout:       "Logout",
      tableHeading: "All Bookings",
      noBookings:   "No bookings found.",
      // NEW: All-Day-Blocker
      blockHeading: "Block entire day",
      blockLabel:   "Pick date:",
      blockButton:  "Block",
      blockSuccess: "Day blocked successfully.",
      blockError:   "Error blocking day"
    }
  },
  tr: {
    title: "Ziyaret Takvimi",
    intro: "Hangi saatlerin dolu olduğunu görebilirsin. Uygun bir zaman seçerek ziyaretini kaydedebilirsin.",
    form: {
      nameLabel: "Ad veya Baş harf:",
      emailLabel: "E-posta adresi:",
      durationLabel: "Ziyaret süresi:",
      confirm: "Lütfen onaylayın:",
      check1: "Sağlıklıyım ve semptom göstermiyorum.",
      check2: "Verilerimin ziyaret koordinasyonu için saklanmasına izin veriyorum.",
      check3: "Onay e-postası almayı kabul ediyorum.",
      check4: "Bu site yalnızca özel kullanım içindir.",
      submit: "Ziyareti kaydet"
    },
    cancel: {
      title: "Ziyareti İptal Et",
      waiting: "Lütfen bekleyin...",
      success: "Ziyaretin başarıyla iptal edildi.",
      error: "İptal sırasında bir hata oluştu."
    },
    admin: {
      heading:      "Yönetici Alanı",
      loginText:    "Lütfen yönetici şifresini girin:",
      button:       "Giriş",
      wrong:        "Yanlış şifre.",
      logout:       "Çıkış",
      tableHeading: "Tüm Kayıtlar",
      noBookings:   "Kayıt bulunamadı.",
      // YENİ: All-Day-Blocker
      blockHeading: "Tüm günü engelle",
      blockLabel:   "Tarih seçin:",
      blockButton:  "Engelle",
      blockSuccess: "Gün başarıyla engellendi.",
      blockError:   "Engelleme hatası"
    }
  }
};

function applyTranslations(lang) {
  const trans = translations[lang] || translations.de;
  document.title = trans.title;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const keys = el.dataset.i18n.split(".");
    let value = trans;
    keys.forEach(k => value = value?.[k]);
    if (value) el.innerText = value;
  });
}
