# Konfiguracja reCAPTCHA v3 - Harmonia Rząska

## Przegląd

Strona używa Google reCAPTCHA v3, które działa w tle bez interakcji użytkownika. System analizuje zachowanie użytkownika i przypisuje score od 0.0 (bot) do 1.0 (człowiek).

## Klucze reCAPTCHA v3

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
Klucz publiczny jest używany w script tag:
```html
<script src="https://www.google.com/recaptcha/api.js?render=6Lc1sK8rAAAAAFvcqHK72bEpkcT7xUtbowTMD4f7"></script>
```

### 2. Netlify (netlify.toml)
Klucz tajny jest przechowywany jako zmienna środowiskowa:
```toml
[build.environment]
  RECAPTCHA_SECRET_KEY = "6Lc1sK8rAAAAAH0pAKxs0P6uPPCr4Y3a4JhkCifx"
```

### 3. JavaScript (js/app.js)
Weryfikacja reCAPTCHA v3:
```javascript
recaptchaToken = await grecaptcha.execute('6Lc1sK8rAAAAAFvcqHK72bEpkcT7xUtbowTMD4f7', {action: 'contact_form'});
```

### 4. Netlify Function (netlify/functions/contact-form.js)
Weryfikacja z oceną score:
```javascript
// For reCAPTCHA v3, check the score (0.0 is very likely a bot, 1.0 is very likely a human)
if (recaptchaResult.score !== undefined && recaptchaResult.score < 0.5) {
    return { error: 'reCAPTCHA score too low - possible bot activity' };
}
```

## Różnice między v2 a v3

### reCAPTCHA v2
- Wymaga interakcji użytkownika (checkbox "I'm not a robot")
- Widoczne na stronie
- Prosty sukces/niepowodzenie

### reCAPTCHA v3
- Działa w tle bez interakcji
- Analizuje zachowanie użytkownika
- Zwraca score (0.0 - 1.0)
- Bardziej zaawansowane wykrywanie botów

## Bezpieczeństwo

- Klucz publiczny jest bezpieczny do używania w kodzie frontend
- Klucz tajny jest przechowywany tylko po stronie serwera
- Score threshold ustawiony na 0.5 (można dostosować)
- Honeypot field dodatkowo chroni przed botami

## Testowanie

1. Otwórz stronę w przeglądarce
2. Przejdź do sekcji kontaktowej
3. Wypełnij formularz
4. Wyślij formularz (reCAPTCHA działa automatycznie)

## Rozwiązywanie problemów

### reCAPTCHA nie działa
- Sprawdź czy klucze są poprawne
- Upewnij się, że domena jest dodana w Google reCAPTCHA admin
- Sprawdź console w przeglądarce pod kątem błędów

### Błędy weryfikacji
- Sprawdź logi Netlify Functions
- Upewnij się, że zmienna środowiskowa RECAPTCHA_SECRET_KEY jest ustawiona
- Sprawdź czy klucz tajny jest poprawny

### Niskie score
- Można obniżyć threshold w Netlify Function (domyślnie 0.5)
- Sprawdź czy użytkownik nie używa VPN/proxy
- Sprawdź czy nie ma blokad w przeglądarce

## Aktualizacja kluczy

Jeśli potrzebujesz zmienić klucze reCAPTCHA:

1. Wygeneruj nowe klucze v3 w Google reCAPTCHA admin
2. Zaktualizuj klucz publiczny w `index.html`
3. Zaktualizuj klucz tajny w `netlify.toml`
4. Wdróż zmiany na Netlify
