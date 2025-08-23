# 🏠 Zarządzanie Danymi Jednostek - Prosty System

## 📋 **Jak edytować dane jednostek:**

### **Krok 1: Edycja pliku `data/units.json`**

1. **Otwórz plik `data/units.json`** w dowolnym edytorze tekstu (Notepad++, VS Code, Notepad)
2. **Znajdź jednostkę**, którą chcesz edytować
3. **Zmień status** z `"wolny"` na `"sprzedany"` lub `"zarezerwowany"`
4. **Zapisz plik**

### **Przykład edycji:**

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
  "status": "sprzedany",  // ← Zmień tutaj
  "plan_url": "https://example.com/plan-a1.jpg",
  "opis": "Przestronne mieszkanie z balkonem"
}
```

### **Krok 2: Wgranie na Netlify**

1. **Zaloguj się do Netlify**
2. **Przejdź do swojej strony**
3. **Kliknij "Deploys"**
4. **Przeciągnij i upuść** cały folder projektu
5. **Poczekaj na wdrożenie** (1-2 minuty)

## 🎯 **Dostępne statusy:**

- `"wolny"` - Lokal dostępny
- `"zarezerwowany"` - Lokal zarezerwowany
- `"sprzedany"` - Lokal sprzedany

## ⚠️ **Ważne zasady:**

1. **Nie zmieniaj struktury JSON** - tylko wartości
2. **Zachowaj cudzysłowy** wokół tekstu
3. **Nie dodawaj przecinków** na końcu ostatniego elementu
4. **Sprawdź składnię** przed wgraniem

## 🔧 **Narzędzia do edycji JSON:**

- **Online:** [JSON Editor Online](https://jsoneditoronline.org/)
- **Windows:** Notepad++, VS Code
- **Mac:** TextEdit, VS Code

## 📞 **Wsparcie:**

Jeśli masz problemy z edycją, możesz:
1. Skopiować zawartość pliku
2. Wkleić do edytora online
3. Edytować wizualnie
4. Skopiować z powrotem do pliku

---
*Ten system jest prosty i nie wymaga znajomości Git!*
