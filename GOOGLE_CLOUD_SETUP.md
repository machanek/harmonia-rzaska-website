# Konfiguracja Google Cloud dla reCAPTCHA Enterprise

## Krok 1: Utwórz projekt Google Cloud
1. Przejdź do [Google Cloud Console](https://console.cloud.google.com/)
2. Utwórz nowy projekt lub wybierz istniejący
3. Zapisz **Project ID** (np. "dubaicars")

## Krok 2: Włącz reCAPTCHA Enterprise API
1. W Google Cloud Console przejdź do "APIs & Services" > "Library"
2. Znajdź "reCAPTCHA Enterprise API"
3. Kliknij "Enable"

## Krok 3: Utwórz Service Account
1. Przejdź do "IAM & Admin" > "Service Accounts"
2. Kliknij "Create Service Account"
3. Nazwa: `recaptcha-enterprise-sa`
4. Opis: `Service account for reCAPTCHA Enterprise verification`
5. Kliknij "Create and Continue"

## Krok 4: Nadaj uprawnienia
1. Rola: `reCAPTCHA Enterprise Agent`
2. Kliknij "Continue" i "Done"

## Krok 5: Utwórz klucz
1. Kliknij na utworzony service account
2. Przejdź do zakładki "Keys"
3. Kliknij "Add Key" > "Create new key"
4. Format: JSON
5. Kliknij "Create"

## Krok 6: Skonfiguruj Netlify
1. Pobierz plik JSON z kluczem
2. W Netlify Dashboard przejdź do "Site settings" > "Environment variables"
3. Dodaj zmienną:
   - **Key**: `GOOGLE_APPLICATION_CREDENTIALS_JSON`
   - **Value**: Cała zawartość pliku JSON z kluczem

## Krok 7: Zaktualizuj kod
W `netlify/functions/form-webhook.js` dodaj na początku:

```javascript
// Ustaw credentials z zmiennej środowiskowej
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
  process.env.GOOGLE_APPLICATION_CREDENTIALS = credentials;
}
```

## Krok 8: Test
1. Wdróż zmiany na Netlify
2. Przetestuj formularz kontaktowy
3. Sprawdź logi w Netlify Functions

## Uwagi
- **Project ID**: Użyj swojego Project ID w kodzie
- **Site Key**: Użyj swojego Site Key z reCAPTCHA
- **Bezpieczeństwo**: Nigdy nie commituj pliku z kluczem do repo
- **Koszty**: reCAPTCHA Enterprise jest płatne po przekroczeniu limitu
