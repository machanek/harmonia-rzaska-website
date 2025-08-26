# Harmonia Rząska - Strona Internetowa

Nowoczesna strona internetowa dla osiedla Harmonia Rząska, prezentująca ofertę mieszkań i domów pod Krakowem.

## Struktura Projektu

```
harmonia-rzaska-website/
├── index.html              # Główna strona
├── css/
│   └── styles.css          # Style CSS
├── js/
│   └── app.js              # Logika JavaScript
├── data/
│   ├── units.json          # Dane jednostek (przestarzałe)
│   └── units/              # Folder z plikami jednostek (nowe)
│       ├── 1.json          # Jednostka ID 1
│       ├── 2.json          # Jednostka ID 2
│       └── ...             # Więcej jednostek
├── admin/                  # Panel administracyjny Netlify CMS
│   ├── index.html          # Interfejs CMS
│   └── config.yml          # Konfiguracja CMS
├── netlify.toml            # Konfiguracja Netlify
├── success.html            # Strona sukcesu formularza
└── README.md               # Dokumentacja
```

## Jak Uruchomić

### Lokalnie
1. Pobierz wszystkie pliki
2. Otwórz `index.html` w przeglądarce
3. Lub uruchom lokalny serwer: `python -m http.server 8000`

### Na Netlify
1. Prześlij pliki do repozytorium Git (GitHub, GitLab, Bitbucket)
2. Połącz z Netlify
3. Strona będzie dostępna pod adresem Netlify

## Funkcjonalności

### Dla Użytkowników
- **Responsywny design** - działa na wszystkich urządzeniach
- **Tabela jednostek** - przeglądanie mieszkań z filtrowaniem i sortowaniem
- **Widok kart** - mobilny widok jednostek w formie kart
- **Galeria zdjęć** - przeglądanie zdjęć osiedla
- **Formularz kontaktowy** - wysyłanie wiadomości
- **Mapa lokalizacji** - interaktywna mapa Google
- **Slider hero** - dynamiczne zdjęcia główne

### Dla Administratorów
- **Panel administracyjny** - zarządzanie danymi jednostek przez Netlify CMS
- **Edytowanie statusów** - zmiana statusu z "wolny" na "sprzedany"
- **Dodawanie nowych jednostek** - tworzenie nowych wpisów
- **Aktualizacja cen** - modyfikacja cen i opisów

## Zarządzanie Danymi Jednostek

### Panel Administracyjny Netlify CMS

Strona ma wbudowany panel administracyjny, który pozwala na łatwe zarządzanie danymi jednostek bez znajomości kodu.

#### Dostęp do Panelu
1. Przejdź na `https://twoja-domena.netlify.app/admin`
2. Zaloguj się używając swojego konta Netlify
3. Rozpocznij edycję danych

#### Funkcje Panelu
- **Dodawanie nowych jednostek** - kliknij "New Units"
- **Edytowanie istniejących** - kliknij na jednostkę do edycji
- **Zmiana statusu** - wybierz z listy: "wolny", "sprzedany", "zarezerwowany"
- **Aktualizacja cen** - zmień ceny i opisy
- **Zapisywanie zmian** - automatyczne wdrożenie na stronie

#### Pola do Edycji
- **ID** - unikalny identyfikator jednostki
- **Numer budynku** - litera budynku (np. "A", "B")
- **Numer lokalu** - numer mieszkania
- **Piętro** - numer piętra
- **Powierzchnia** - powierzchnia w m²
- **Dodatki** - dodatkowe informacje (balkon, piwnica, etc.)
- **Cena** - cena w złotych
- **Cena za m²** - cena za metr kwadratowy
- **Status** - "wolny", "sprzedany", "zarezerwowany"
- **URL planu** - link do planu mieszkania
- **Opis** - dodatkowy opis jednostki

### Struktura Plików Jednostek

Każda jednostka ma swój własny plik JSON w folderze `data/units/`:

```json
{
  "id": 1,
  "nr_budynku": "A",
  "nr_lokalu": "1",
  "pietro": 1,
  "powierzchnia": 45.2,
  "dodatki": "Balkon 8m²",
  "cena": 285000,
  "cena_m2": 6305,
  "status": "wolny",
  "plan_url": "https://example.com/plan-a1.jpg",
  "opis": "Przestronne mieszkanie z balkonem"
}
```

## Style i Konfiguracja

### Zmienne CSS
Główne kolory i ustawienia są zdefiniowane w `css/styles.css`:
```css
:root {
  --primary: #2E7D32;
  --secondary: #1976D2;
  --accent: #FF6F00;
  --text: #333333;
  --background: #FFFFFF;
}
```

### Responsywność
- **Desktop**: > 1024px
- **Tablet**: 768px - 1024px  
- **Mobile**: < 768px
- **Small Mobile**: < 576px

## Integracja Backend

### Formularz Kontaktowy
Formularz używa Netlify Forms do automatycznego przetwarzania:
- Automatyczne wysyłanie emaili
- Ochrona przed spamem (honeypot)
- Strona sukcesu po wysłaniu

### Dane Jednostek
- **Źródło**: Pliki JSON w folderze `data/units/`
- **Fallback**: Wbudowane dane testowe w `app.js`
- **Zarządzanie**: Panel Netlify CMS

## Testowanie

### Funkcje Debug
W konsoli przeglądarki dostępne są funkcje debug:
```javascript
// Wymuszenie renderowania jednostek
renderRealUnitsNow()

// Sprawdzenie stanu DOM
checkDOM()

// Awaryjne renderowanie
emergencyRender()
```

### Testowanie Lokalne
1. Otwórz `index.html` w przeglądarce
2. Otwórz narzędzia deweloperskie (F12)
3. Sprawdź konsolę pod kątem błędów
4. Przetestuj wszystkie funkcjonalności

## Wdrażanie

### Netlify
1. Prześlij kod do repozytorium Git
2. Połącz z Netlify
3. Skonfiguruj ustawienia w `netlify.toml`
4. Włącz Netlify Identity dla panelu admin

### Konfiguracja Netlify
Plik `netlify.toml` zawiera:
- Ustawienia build
- Przekierowania (admin, success)
- Nagłówki bezpieczeństwa
- Cache dla plików statycznych

## Rozwiązywanie Problemów

### Błędy Ładowania Danych
- Sprawdź czy pliki JSON są dostępne
- Sprawdź konsolę przeglądarki
- Użyj funkcji debug

### Problemy z Panelem Admin
- Sprawdź czy Netlify Identity jest włączone
- Sprawdź uprawnienia użytkownika
- Sprawdź konfigurację w `admin/config.yml`

### Problemy z Responsywnością
- Sprawdź media queries w CSS
- Przetestuj na różnych urządzeniach
- Sprawdź viewport meta tag

## Licencja

Projekt jest własnością Harmonia Rząska. Wszystkie prawa zastrzeżone.

---

## Mobile Card View Improvements

### Implementacja Widoku Kart na Mobile

Strona została zaktualizowana o responsywny widok kart dla urządzeń mobilnych, który zastępuje tabelę jednostek na małych ekranach.

#### Zmiany w CSS (`css/styles.css`)
- Dodano media queries dla ekranów ≤ 768px i ≤ 576px
- Ukryto tabelę jednostek na mobile (`display: none !important`)
- Wyświetlono widok kart na mobile (`display: grid !important`)
- Stylizacja kart jednostek z lepszą czytelnością
- Dodano badge "SPRZEDANE" dla sprzedanych jednostek
- Poprawiono kolory i spacing dla lepszego UX

#### Zmiany w JavaScript (`js/app.js`)
- Funkcja `renderCards()` generuje szczegółowe karty jednostek
- Każda karta zawiera wszystkie informacje o jednostce
- Formatowanie ID jako "Lokal [ID]"
- Dodano cenę za m² do widoku kart

#### Struktura Kart
```html
<div class="unit-card">
  <div class="unit-card-header">
    <span class="unit-card-id">Lokal 1</span>
    <span class="unit-card-status">WOLNE</span>
  </div>
  <div class="unit-card-info">
    <div class="unit-card-field">
      <span class="label">Powierzchnia:</span>
      <span class="value">45.2 m²</span>
    </div>
    <!-- Więcej pól... -->
  </div>
</div>
```

### Korzyści
- **Lepsza czytelność** na urządzeniach mobilnych
- **Szybsze przeglądanie** jednostek
- **Intuicyjny interfejs** dla użytkowników mobile
- **Zachowanie wszystkich informacji** o jednostkach
- **Responsywny design** dostosowany do różnych rozmiarów ekranów

## Netlify CMS Integration

### Panel Administracyjny

Strona została zintegrowana z Netlify CMS, umożliwiając łatwe zarządzanie danymi jednostek bez znajomości kodu.

#### Konfiguracja
- **Plik admin**: `admin/index.html` - interfejs CMS
- **Konfiguracja**: `admin/config.yml` - struktura danych
- **Dostęp**: `https://twoja-domena.netlify.app/admin`

#### Funkcje
- **Dodawanie jednostek** - tworzenie nowych wpisów
- **Edytowanie** - modyfikacja istniejących danych
- **Zmiana statusów** - "wolny" ↔ "sprzedany" ↔ "zarezerwowany"
- **Aktualizacja cen** - zmiana cen i opisów
- **Automatyczne wdrażanie** - zmiany są natychmiast widoczne na stronie

#### Struktura Danych
Każda jednostka jest przechowywana jako osobny plik JSON w `data/units/`:
```json
{
  "id": 1,
  "nr_budynku": "A",
  "nr_lokalu": "1",
  "pietro": 1,
  "powierzchnia": 45.2,
  "dodatki": "Balkon 8m²",
  "cena": 285000,
  "cena_m2": 6305,
  "status": "wolny",
  "plan_url": "https://example.com/plan-a1.jpg",
  "opis": "Przestronne mieszkanie z balkonem"
}
```

#### Instrukcja Użycia
1. Przejdź na `/admin` na swojej stronie
2. Zaloguj się używając konta Netlify
3. Wybierz "Units" z menu
4. Kliknij na jednostkę do edycji lub "New Units" dla nowej
5. Zmień dane i zapisz
6. Zmiany będą automatycznie wdrożone na stronie

### Integracja z Formularzem Kontaktowym

Formularz kontaktowy został zintegrowany z Netlify Forms:
- **Automatyczne przetwarzanie** - bez potrzeby backend
- **Ochrona przed spamem** - honeypot field
- **Powiadomienia email** - automatyczne wysyłanie
- **Strona sukcesu** - potwierdzenie wysłania

#### Konfiguracja Formularza
```html
<form name="contact" method="POST" data-netlify="true" netlify-honeypot="bot-field">
  <input type="hidden" name="form-name" value="contact" />
  <p class="hidden">
    <label>Nie wypełniaj tego pola: <input name="bot-field" /></label>
  </p>
  <!-- Pola formularza... -->
</form>
```

## System Formularza Kontaktowego

### Jak to działa:
1. **Formularz kontaktowy** na stronie wysyła dane do Netlify Forms
2. **Webhook** (`netlify/functions/form-webhook.js`) odbiera dane z Netlify Forms
3. **GitHub API** dodaje wiadomość jako plik JSON do repo (`data/contact_messages/`)
4. **Netlify CMS** automatycznie wyświetla wiadomości w panelu administracyjnym

### Konfiguracja:
- **Zmienne środowiskowe w Netlify:**
  - `GITHUB_TOKEN` - Personal Access Token z uprawnieniami `repo`
  - `GITHUB_REPO` - nazwa repo w formacie `username/repository-name`
- **Webhook URL:** `https://harmoniarzaska.netlify.app/.netlify/functions/form-webhook`

### Status: ✅ DZIAŁA
- Ostatni test: 26.08.2025 - wiadomości trafiają do CMS
- Webhook aktywny i funkcjonalny
- Git API integration działa poprawnie
