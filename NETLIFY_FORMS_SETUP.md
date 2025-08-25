# Konfiguracja formularzy Netlify

## Aktualna konfiguracja

Formularz kontaktowy jest skonfigurowany do używania Netlify Functions z automatycznym zapisywaniem do CMS.

### 1. Konfiguracja formularza

Formularz w `index.html`:
```html
<form name="contact" method="POST" action="/.netlify/functions/contact-form" data-netlify="true" netlify-honeypot="bot-field" class="contact-form" id="contactForm">
```

### 2. Konfiguracja w netlify.toml

```toml
[[forms]]
  name = "contact"
  [forms.fields]
    name = { required = true }
    email = { required = true }
    phone = { required = true }
    message = { required = true }
    consent = { required = true }

[[redirects]]
  from = "/success"
  to = "/success.html"
  status = 200
```

### 3. Funkcja contact-form.js

Funkcja `netlify/functions/contact-form.js` automatycznie:
- Odbiera dane z formularza
- Zapisuje je do plików JSON w `data/contact_messages/`
- Formatuje dane dla CMS Netlify
- Przekierowuje na stronę sukcesu

### 4. Jak to działa

1. **Użytkownik wypełnia formularz** i klika "Wyślij"
2. **Formularz wysyła dane** do `/.netlify/functions/contact-form`
3. **Funkcja przetwarza dane** i zapisuje do pliku JSON
4. **Funkcja przekierowuje** na `/success` (która prowadzi do `success.html`)
5. **Użytkownik widzi stronę sukcesu**

### 5. Testowanie

1. **Wyślij wiadomość** przez formularz kontaktowy
2. **Sprawdź czy przekierowanie działa** - powinieneś zobaczyć stronę sukcesu
3. **Sprawdź w CMS** (harmoniarzaska.netlify.app/admin > Wiadomości kontaktowe)

### 6. Rozwiązywanie problemów

Jeśli wiadomości nie trafiają do CMS:

1. **Sprawdź logi funkcji** w panelu Netlify (Functions > contact-form)
2. **Sprawdź czy pliki są tworzone** w `data/contact_messages/`
3. **Sprawdź czy formularz jest wykrywany** w panelu Netlify (Forms)

### 7. Struktura danych

Każda wiadomość jest zapisywana jako plik JSON:
```json
{
  "id": 1703123456789,
  "name": "Jan Kowalski",
  "email": "jan@example.com",
  "phone": "123456789",
  "subject": "Pytanie o mieszkanie",
  "message": "Treść wiadomości",
  "consent": true,
  "marketing": false,
  "timestamp": "2023-12-21T10:30:45.123Z",
  "status": "new",
  "notes": ""
}
```

## WAŻNE: Sprawdzenie w panelu Netlify

**KROK 1:** Przejdź do panelu Netlify (https://app.netlify.com)

**KROK 2:** Wybierz projekt `harmoniarzaska`

**KROK 3:** Przejdź do **Site settings** > **Forms**

**KROK 4:** Sprawdź czy formularz "contact" jest widoczny

**KROK 5:** Przejdź do **Functions** i sprawdź czy `contact-form` jest aktywna

**KROK 6:** Przejdź do **CMS** (harmoniarzaska.netlify.app/admin) i sprawdź zakładkę "Wiadomości kontaktowe"

Po tej konfiguracji:
- Formularz będzie działał przez Netlify Functions
- Wiadomości będą automatycznie zapisywane do plików JSON
- CMS będzie mógł odczytywać wiadomości z plików
- Użytkownik będzie przekierowywany na stronę sukcesu
