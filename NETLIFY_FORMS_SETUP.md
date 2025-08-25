# Konfiguracja formularzy Netlify

## Aktualna konfiguracja

Formularz kontaktowy jest skonfigurowany do używania standardowej obsługi Netlify z webhookiem.

### 1. Konfiguracja formularza

Formularz w `index.html`:
```html
<form name="contact" method="POST" action="/success" netlify-honeypot="bot-field" class="contact-form" id="contactForm">
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
```

### 3. Konfiguracja webhook

Aby wiadomości trafiały do CMS, należy skonfigurować webhook w panelu Netlify:

1. **Przejdź do panelu Netlify** (https://app.netlify.com)
2. **Wybierz projekt** harmoniarzaska
3. **Przejdź do Site settings > Forms**
4. **Kliknij "Form notifications"**
5. **Dodaj nowe powiadomienie:**
   - **Event:** Form submission
   - **Form:** contact
   - **Type:** Webhook
   - **URL:** `https://harmoniarzaska.netlify.app/.netlify/functions/form-webhook`

### 4. Funkcja webhook

Funkcja `netlify/functions/form-webhook.js` automatycznie:
- Odbiera dane z formularza
- Zapisuje je do plików JSON w `data/contact_messages/`
- Formatuje dane dla CMS Netlify

### 5. Testowanie

1. **Wyślij wiadomość** przez formularz kontaktowy
2. **Sprawdź w panelu Netlify** (Site settings > Forms > Submissions)
3. **Sprawdź w CMS** (harmoniarzaska.netlify.app/admin > Wiadomości kontaktowe)

### 6. Rozwiązywanie problemów

Jeśli wiadomości nie trafiają do CMS:

1. **Sprawdź logi funkcji** w panelu Netlify (Functions > form-webhook)
2. **Sprawdź konfigurację webhook** w Site settings > Forms > Form notifications
3. **Sprawdź czy pliki są tworzone** w `data/contact_messages/`

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
