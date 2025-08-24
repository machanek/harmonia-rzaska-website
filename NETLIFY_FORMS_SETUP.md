# Konfiguracja Netlify Forms - Harmonia Rząska

## ✅ Co zostało skonfigurowane:

1. **Formularz HTML** - dodano `data-netlify="true"`
2. **JavaScript** - uproszczono obsługę formularza
3. **Konfiguracja Netlify** - usunięto niepotrzebne funkcje
4. **Strona sukcesu** - `success.html` już istnieje

## 🚀 Jak to działa:

1. Użytkownik wypełnia formularz
2. Netlify automatycznie przechwytuje dane
3. E-mail przychodzi do panelu Netlify
4. Można skonfigurować przekierowanie na Twój e-mail

## 📧 Konfiguracja e-maili:

### Krok 1: Sprawdź zgłoszenia w Netlify
1. Przejdź do panelu Netlify > Forms
2. Kliknij na formularz "contact"
3. Zobaczysz wszystkie zgłoszenia

### Krok 2: Skonfiguruj powiadomienia e-mail
1. W panelu Netlify > Forms > contact
2. Kliknij "Settings"
3. W sekcji "Form notifications" kliknij "Add notification"
4. Wybierz "Email notification"
5. Wpisz swój e-mail: `biuro@harmoniarzaska.pl`
6. Zapisz

### Krok 3: Opcjonalnie - skonfiguruj Slack/Discord
- Możesz dodać powiadomienia na Slack lub Discord
- Przydatne dla zespołu

## 🔒 Bezpieczeństwo:

- **Honeypot field** - chroni przed botami
- **Walidacja** - sprawdzanie pól wymaganych
- **Rate limiting** - Netlify automatycznie ogranicza spam

## 📊 Statystyki:

- **Darmowe**: 100 zgłoszeń/miesiąc
- **Płatne**: od $19/miesiąc (1000 zgłoszeń)

## 🧪 Testowanie:

1. Wypełnij formularz na stronie
2. Sprawdź panel Netlify > Forms
3. Sprawdź czy e-mail dotarł

## 🔧 Dodatkowe opcje:

### Przekierowanie po wysłaniu:
```html
<!-- W formularzu dodaj: -->
<form action="/success" data-netlify="true">
```

### Własny format e-maila:
1. Netlify > Forms > Settings
2. "Email notification" > "Customize email template"
3. Możesz zmienić treść e-maila

### Zapisywanie do Google Sheets:
1. Dodaj "Zapier" notification
2. Połącz z Google Sheets
3. Automatyczne zapisywanie danych

## 📞 Wsparcie:

- **Netlify Forms docs**: https://docs.netlify.com/forms/setup/
- **Formularz działa od razu** po wdrożeniu
- **Brak dodatkowej konfiguracji** potrzebnej

## 🎯 Korzyści:

- ✅ **Darmowe** (100 zgłoszeń/miesiąc)
- ✅ **Proste** - zero konfiguracji
- ✅ **Niezawodne** - obsługiwane przez Netlify
- ✅ **Bezpieczne** - wbudowana ochrona
- ✅ **Statystyki** - w panelu Netlify
