# Folder Assets - Harmonia Rząska

## 📁 Struktura folderów

```
assets/
├── images/
│   ├── hero/           # Zdjęcia hero slider (1920x1080px)
│   ├── gallery/        # Zdjęcia galerii wnętrz
│   ├── interior/       # Zdjęcia wnętrz mieszkań
│   └── exterior/       # Zdjęcia zewnętrzne osiedla
├── documents/          # Dokumenty PDF (katalogi, plany)
├── logo-harmonia-rzaska.png    # Logo firmy
├── favicon.ico         # Ikona strony
└── og-image.jpg        # Obraz dla social media
```

## 🖼️ **ZALECANE ROZMIARY I FORMATY**

### Logo i ikony
- **Logo:** `logo-harmonia-rzaska.png` - 200x80px, PNG z przezroczystością
- **Favicon:** `favicon.ico` - 32x32px, ICO format
- **OG Image:** `og-image.jpg` - 1200x630px, JPG

### Zdjęcia hero slider
- **Rozmiar:** 1920x1080px (16:9)
- **Format:** JPG lub WebP
- **Nazwy:** `hero-1.jpg`, `hero-2.jpg`, `hero-3.jpg`

### Galeria wnętrz
- **Rozmiar:** 800x600px (4:3)
- **Format:** JPG
- **Nazwy:** `interior-1.jpg`, `interior-2.jpg`, etc.

### Zdjęcia zewnętrzne
- **Rozmiar:** 1200x800px (3:2)
- **Format:** JPG
- **Nazwy:** `exterior-1.jpg`, `exterior-2.jpg`, etc.

## 📄 **DOKUMENTY**

### Katalogi i broszury
- **Format:** PDF
- **Nazwy:** `katalog-harmonia-rzaska.pdf`, `brochure-2025.pdf`

### Plany mieszkań
- **Format:** PDF lub JPG
- **Nazwy:** `plan-mieszkanie-80m2.pdf`, `plan-mieszkanie-120m2.pdf`

## 🔗 **JAK UŻYWAĆ W KODZIE**

### W HTML
```html
<!-- Logo -->
<img src="assets/logo-harmonia-rzaska.png" alt="Harmonia Rząska">

<!-- Zdjęcie hero -->
<img src="assets/images/hero/hero-1.jpg" alt="Widok osiedla">

<!-- Galeria -->
<img src="assets/images/gallery/interior-1.jpg" alt="Salon">

<!-- Dokument -->
<a href="assets/documents/katalog-harmonia-rzaska.pdf">Pobierz katalog</a>
```

### W CSS
```css
.hero-slide {
    background-image: url('../assets/images/hero/hero-1.jpg');
}
```

## 📋 **LISTA WYMAGANYCH PLIKÓW**

### Obecnie używane w kodzie:
- [ ] `logo-harmonia-rzaska.png` - logo w header
- [ ] `favicon.ico` - ikona strony
- [ ] `og-image.jpg` - obraz dla social media
- [ ] `katalog-harmonia-rzaska.pdf` - katalog do pobrania

### Zalecane dodatkowe:
- [ ] `hero-1.jpg`, `hero-2.jpg`, `hero-3.jpg` - slider hero
- [ ] `interior-1.jpg` do `interior-5.jpg` - galeria wnętrz
- [ ] `exterior-1.jpg`, `exterior-2.jpg` - widoki zewnętrzne
- [ ] `plan-osiedla.jpg` - plan zagospodarowania

## ⚡ **OPTYMALIZACJA**

### Przed wrzuceniem:
1. **Kompresuj zdjęcia** - użyj TinyPNG lub podobnego
2. **Konwertuj na WebP** - dla lepszej wydajności
3. **Dodaj alt text** - dla accessibility
4. **Sprawdź rozmiary** - nie większe niż potrzebne

### Automatyczna optymalizacja:
- Netlify automatycznie optymalizuje obrazy
- Service Worker cache'uje obrazy
- Lazy loading dla galerii
