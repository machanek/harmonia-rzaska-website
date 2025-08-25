# Konfiguracja formularzy Netlify

## Aktualna konfiguracja

Formularz kontaktowy jest skonfigurowany do używania Netlify Forms z webhookiem, który automatycznie zapisuje dane do CMS.

### 1. Konfiguracja formularza

**Ukryty formularz** (na początku HTML dla wykrycia przez Netlify podczas builda):
```html
<form name="contact" netlify netlify-honeypot="bot-field" hidden>
    <input type="text" name="name" />
    <input type="email" name="email" />
    <input type="tel" name="phone" />
    <input type="text" name="subject" />
    <textarea name="message"></textarea>
    <input type="checkbox" name="consent" />
    <input type="checkbox" name="marketing" />
    <input type="hidden" name="g-recaptcha-response" />
</form>
```

**Główny formularz** (widoczny dla użytkowników):
```html
<form name="contact" method="POST" action="/" netlify-honeypot="bot-field" data-netlify-success="/success" class="contact-form" id="contactForm">
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
  
  # Webhook configuration for form submissions
  [forms.webhook]
    url = "/.netlify/functions/form-webhook"
    event = "form_submission"

[[redirects]]
  from = "/success"
  to = "/success.html"
  status = 200
```

### 3. Funkcja form-webhook.js

Funkcja `netlify/functions/form-webhook.js` automatycznie:
- Jest wywoływana przez Netlify po przesłaniu formularza
- Odbiera dane z webhooka Netlify Forms
- Zapisuje je do plików JSON w `data/contact_messages/`
- Formatuje dane dla CMS Netlify

### 4. Jak to działa

1. **Użytkownik wypełnia formularz** i klika "Wyślij"
2. **JavaScript waliduje dane** i dodaje token reCAPTCHA
3. **Netlify automatycznie przetwarza formularz** (dzięki ukrytemu formularzowi wykrytemu podczas builda)
3. **Netlify wywołuje webhook** `/.netlify/functions/form-webhook`
4. **Funkcja webhook zapisuje dane** do pliku JSON
5. **Użytkownik jest przekierowany** na `/success` (która prowadzi do `success.html`)
6. **Użytkownik widzi stronę sukcesu**

### 5. Zalety tego podejścia

- **Wiadomości pojawiają się w panelu Netlify Forms** (sekcja "Forms")
- **Automatyczne zapisywanie do CMS** bez dodatkowej konfiguracji
- **Działa z wbudowaną obsługą formularzy Netlify**
- **Nie wymaga ręcznej konfiguracji webhooków** w panelu Netlify

### 6. Testowanie

1. **Wyślij wiadomość** przez formularz kontaktowy
2. **Sprawdź czy przekierowanie działa** - powinieneś zobaczyć stronę sukcesu
3. **Sprawdź w panelu Netlify Forms** - wiadomość powinna być widoczna
4. **Sprawdź w CMS** (harmoniarzaska.netlify.app/admin > Wiadomości kontaktowe)

### 7. Rozwiązywanie problemów

Jeśli wiadomości nie trafiają do CMS:

1. **Sprawdź logi funkcji webhook** w panelu Netlify (Functions > form-webhook)
2. **Sprawdź czy pliki są tworzone** w `data/contact_messages/`
3. **Sprawdź czy formularz jest wykrywany** w panelu Netlify (Forms)
4. **Sprawdź czy webhook jest skonfigurowany** w `netlify.toml`

### 8. Struktura danych

Każda wiadomość jest zapisywana jako plik JSON:
```json
{
  "id": "msg_1703123456789_abc123def",
  "timestamp": "2023-12-21T10:30:45.123Z",
  "name": "Jan Kowalski",
  "email": "jan@example.com",
  "phone": "123456789",
  "message": "Treść wiadomości",
  "consent": true,
  "status": "nowa",
  "notes": "",
  "source": "form-webhook"
}
```

## WAŻNE: Sprawdzenie w panelu Netlify

**KROK 1:** Przejdź do panelu Netlify (https://app.netlify.com)

**KROK 2:** Wybierz projekt `harmoniarzaska`

**KROK 3:** Przejdź do **Site settings** > **Forms**

**KROK 4:** Sprawdź czy formularz "contact" jest widoczny i czy są w nim wiadomości

**KROK 5:** Przejdź do **Functions** i sprawdź czy `form-webhook` jest aktywna

**KROK 6:** Przejdź do **CMS** (harmoniarzaska.netlify.app/admin) i sprawdź zakładkę "Wiadomości kontaktowe"

Po tej konfiguracji:
- Formularz będzie działał przez Netlify Forms
- Wiadomości będą automatycznie zapisywane do plików JSON przez webhook
- Wiadomości będą widoczne w panelu Netlify Forms
- CMS będzie mógł odczytywać wiadomości z plików
- Użytkownik będzie przekierowywany na stronę sukcesu
