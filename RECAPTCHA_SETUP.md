# Konfiguracja reCAPTCHA - Harmonia Rząska

## Przegląd

Strona używa Google reCAPTCHA v2 "I'm not a robot" do zabezpieczenia formularza kontaktowego przed spamem.

## Klucze reCAPTCHA

### Klucz publiczny (Site Key)
```
6Lc1sK8rAAAAAFvcqHK72bEpkcT7xUtbowTMD4f7
```

### Klucz tajny (Secret Key)
```
6Lc1sK8rAAAAAH0pAKxs0P6uPPCr4Y3a4JhkCifx
```

## Konfiguracja

### 1. HTML (index.html)
Klucz publiczny jest używany w formularzu:
```html
<div class="g-recaptcha" data-sitekey="6Lc1sK8rAAAAAFvcqHK72bEpkcT7xUtbowTMD4f7"></div>
```

### 2. Netlify (netlify.toml)
Klucz tajny jest przechowywany jako zmienna środowiskowa:
```toml
[build.environment]
  RECAPTCHA_SECRET_KEY = "6Lc1sK8rAAAAAH0pAKxs0P6uPPCr4Y3a4JhkCifx"
```

### 3. Netlify Function (netlify/functions/contact-form.js)
Weryfikacja reCAPTCHA odbywa się po stronie serwera:
```javascript
const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
const recaptchaVerification = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `secret=${recaptchaSecret}&response=${recaptchaToken}`
});
```

## Bezpieczeństwo

- Klucz publiczny jest bezpieczny do używania w kodzie frontend
- Klucz tajny jest przechowywany tylko po stronie serwera
- Weryfikacja odbywa się po stronie serwera przed przetworzeniem formularza
- Honeypot field dodatkowo chroni przed botami

## Testowanie

1. Otwórz stronę w przeglądarce
2. Przejdź do sekcji kontaktowej
3. Wypełnij formularz
4. Zaznacz reCAPTCHA
5. Wyślij formularz

## Rozwiązywanie problemów

### reCAPTCHA nie działa
- Sprawdź czy klucze są poprawne
- Upewnij się, że domena jest dodana w Google reCAPTCHA admin
- Sprawdź console w przeglądarce pod kątem błędów

### Błędy weryfikacji
- Sprawdź logi Netlify Functions
- Upewnij się, że zmienna środowiskowa RECAPTCHA_SECRET_KEY jest ustawiona
- Sprawdź czy klucz tajny jest poprawny

## Aktualizacja kluczy

Jeśli potrzebujesz zmienić klucze reCAPTCHA:

1. Wygeneruj nowe klucze w Google reCAPTCHA admin
2. Zaktualizuj klucz publiczny w `index.html`
3. Zaktualizuj klucz tajny w `netlify.toml`
4. Wdróż zmiany na Netlify
