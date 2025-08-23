# Instrukcja Konfiguracji Netlify CMS

## 🎯 Cel
Ta instrukcja pomoże Ci skonfigurować panel administracyjny Netlify CMS, który pozwoli Ci łatwo zarządzać danymi jednostek (mieszkań) na swojej stronie bez znajomości kodu.

## 📋 Wymagania
- Konto Netlify (darmowe)
- Strona już wdrożona na Netlify
- Dostęp do repozytorium Git (GitHub, GitLab, Bitbucket)

## 🚀 Krok 1: Włączenie Netlify Identity

1. **Zaloguj się do Netlify**
   - Przejdź na [netlify.com](https://netlify.com)
   - Zaloguj się do swojego konta

2. **Wybierz swoją stronę**
   - W dashboardzie Netlify znajdź swoją stronę Harmonia Rząska
   - Kliknij na nią, aby przejść do szczegółów

3. **Włącz Netlify Identity**
   - W menu bocznym kliknij "Site settings"
   - Przejdź do zakładki "Identity"
   - Kliknij "Enable Identity"
   - Poczekaj na aktywację (może potrwać kilka minut)

4. **Skonfiguruj ustawienia Identity**
   - W sekcji "Registration" wybierz "Invite only" (tylko zaproszenia)
   - W sekcji "External providers" możesz dodać Google/GitHub (opcjonalnie)
   - Zapisz ustawienia

## 👥 Krok 2: Zaproszenie Użytkowników

1. **Przejdź do zakładki "Identity"**
   - W menu bocznym kliknij "Identity"

2. **Zaproś siebie jako administratora**
   - Kliknij "Invite users"
   - Wprowadź swój email
   - Wybierz rolę "Owner" lub "Admin"
   - Wyślij zaproszenie

3. **Sprawdź email**
   - Otwórz email z zaproszeniem
   - Kliknij link aktywacyjny
   - Ustaw hasło do swojego konta

## 🔧 Krok 3: Konfiguracja Git Gateway

1. **Włącz Git Gateway**
   - W sekcji "Identity" znajdź "Git Gateway"
   - Kliknij "Enable Git Gateway"
   - Poczekaj na aktywację

2. **Skonfiguruj uprawnienia**
   - W sekcji "Identity" przejdź do "Services" → "Git Gateway"
   - Upewnij się, że Git Gateway jest włączone

## 📁 Krok 4: Struktura Plików

Upewnij się, że w Twoim repozytorium masz następujące pliki:

```
twoja-strona/
├── admin/
│   ├── index.html          # Panel CMS
│   └── config.yml          # Konfiguracja CMS
├── data/
│   └── units/              # Folder z jednostkami
│       ├── 1.json          # Przykładowa jednostka
│       └── 2.json          # Przykładowa jednostka
└── netlify.toml            # Konfiguracja Netlify
```

## 🎨 Krok 5: Dostęp do Panelu

1. **Przejdź do panelu administracyjnego**
   - Otwórz swoją stronę: `https://twoja-domena.netlify.app`
   - Dodaj `/admin` na końcu URL
   - Przykład: `https://twoja-domena.netlify.app/admin`

2. **Zaloguj się**
   - Użyj swojego emaila i hasła
   - Kliknij "Log in"

3. **Rozpocznij edycję**
   - Zobaczysz menu z opcją "Units"
   - Kliknij na "Units", aby zobaczyć listę jednostek

## 📝 Krok 6: Zarządzanie Jednostkami

### Dodawanie Nowej Jednostki

1. **Kliknij "New Units"**
   - W panelu CMS kliknij przycisk "New Units"

2. **Wypełnij dane**
   - **ID**: Unikalny numer (np. 1, 2, 3...)
   - **Numer budynku**: Litera budynku (np. "A", "B")
   - **Numer lokalu**: Numer mieszkania (np. "1", "2")
   - **Piętro**: Numer piętra (0 = parter)
   - **Powierzchnia**: Powierzchnia w m² (np. 45.2)
   - **Dodatki**: Dodatkowe informacje (np. "Balkon 8m²")
   - **Cena**: Cena w złotych (np. 285000)
   - **Cena za m²**: Cena za metr kwadratowy (np. 6305)
   - **Status**: Wybierz z listy:
     - `wolny` - dostępne do sprzedaży
     - `sprzedany` - już sprzedane
     - `zarezerwowany` - zarezerwowane
   - **URL planu**: Link do planu mieszkania (opcjonalnie)
   - **Opis**: Dodatkowy opis (opcjonalnie)

3. **Zapisz**
   - Kliknij "Publish" lub "Save as draft"
   - Zmiany będą automatycznie wdrożone na stronie

### Edytowanie Istniejącej Jednostki

1. **Znajdź jednostkę**
   - W liście jednostek kliknij na tę, którą chcesz edytować

2. **Zmień dane**
   - Zmień dowolne pola
   - Szczególnie przydatne do zmiany statusu z "wolny" na "sprzedany"

3. **Zapisz zmiany**
   - Kliknij "Update" lub "Publish"
   - Zmiany będą widoczne na stronie w ciągu kilku minut

### Usuwanie Jednostki

1. **Otwórz jednostkę**
   - Kliknij na jednostkę do usunięcia

2. **Usuń**
   - Kliknij "Delete" (ikona kosza)
   - Potwierdź usunięcie

## 🔄 Krok 7: Automatyczne Wdrażanie

Po każdej zmianie w panelu CMS:

1. **Zmiany są automatycznie zapisywane** w repozytorium Git
2. **Netlify automatycznie wdraża** nową wersję strony
3. **Strona jest aktualizowana** w ciągu 1-3 minut

## 🛠️ Rozwiązywanie Problemów

### Problem: Nie mogę się zalogować
**Rozwiązanie:**
- Sprawdź czy Netlify Identity jest włączone
- Sprawdź czy otrzymałeś email z zaproszeniem
- Spróbuj zresetować hasło

### Problem: Nie widzę opcji "Units"
**Rozwiązanie:**
- Sprawdź czy plik `admin/config.yml` jest w repozytorium
- Sprawdź czy Git Gateway jest włączone
- Sprawdź uprawnienia użytkownika

### Problem: Zmiany nie są widoczne na stronie
**Rozwiązanie:**
- Poczekaj 1-3 minuty na automatyczne wdrożenie
- Sprawdź zakładkę "Deploys" w Netlify
- Sprawdź czy nie ma błędów w build

### Problem: Błędy w panelu CMS
**Rozwiązanie:**
- Sprawdź format plików JSON w `data/units/`
- Upewnij się, że wszystkie wymagane pola są wypełnione
- Sprawdź konsolę przeglądarki (F12)

## 📞 Wsparcie

Jeśli masz problemy:

1. **Sprawdź dokumentację Netlify CMS**: [docs.netlify.com](https://docs.netlify.com/visitor-access/identity/)
2. **Sprawdź logi w Netlify**: Dashboard → Twoja strona → "Deploys"
3. **Skontaktuj się z pomocą techniczną** Netlify

## 🎉 Gratulacje!

Teraz możesz łatwo zarządzać danymi jednostek na swojej stronie bez znajomości kodu. Panel CMS pozwoli Ci:

- ✅ Dodawać nowe mieszkania
- ✅ Zmieniać status z "wolny" na "sprzedany"
- ✅ Aktualizować ceny i opisy
- ✅ Zarządzać wszystkimi danymi w jednym miejscu

Wszystkie zmiany będą automatycznie widoczne na Twojej stronie!
