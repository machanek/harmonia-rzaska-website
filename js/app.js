// App.js - Complete functionality for Harmonia Rząska website

// Safe console logging
const safeLog = (message, type = 'log') => {
    try {
        if (console && console[type]) {
            console[type](message);
        }
    } catch (e) {
        // Silent fail
    }
};

class HarmoniaApp {
    constructor() {
        safeLog('🏗️ HarmoniaApp constructor called');
        
        this.units = [];
        this.filteredUnits = [];
        this.currentPage = 1;
        this.perPage = 25;
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.currentSlide = 0;
        this.galleryCurrentImage = 0;
        
        // Check if required DOM elements exist
        const requiredElements = [
            'unitsTableBody',
            'unitsCards', 
            'pagination',
            'searchInput',
            'statusFilter',
            'floorFilter',
            'perPage'
        ];
        
        const missingElements = requiredElements.filter(id => !document.getElementById(id));
        if (missingElements.length > 0) {
            safeLog('⚠️ Missing DOM elements: ' + missingElements.join(', '), 'warn');
        } else {
            safeLog('✅ All required DOM elements found');
        }
        
        this.init();
    }

    async init() {
        try {
            console.log('🏗️ Initializing HarmoniaApp...');
            
            // Load data
            await this.loadUnits();
            this.siteSettings = await this.loadSiteSettings();
            await this.setupPWA();
            console.log('📊 Units and settings loaded, setting up components...');
            
            this.setupEventListeners();
            this.setupMobileMenu();
            this.setupCookieBanner();
            this.setupContactForm();
            this.setupOfflineIndicator();
            this.initLucideIcons();
            this.setupProspectButton();
            
            console.log('🎨 Components setup complete, rendering...');
            
            // Render initial state
            this.renderUnits();
            
            console.log('✅ App initialization complete. Units:', this.units.length);
        } catch (error) {
            console.error('❌ Error during initialization:', error);
        }
    }

    // Data Management
    async loadUnits() {
        // Load units from individual JSON files (managed by CMS)
        try {
            // Only try fetch if not running from file:// protocol
            if (window.location.protocol !== 'file:') {
                const unitsFromFolder = await this.loadUnitsFromFolder();
                if (unitsFromFolder.length > 0) {
                    this.units = unitsFromFolder;
                    console.log('✅ Loaded units from CMS folder structure:', this.units.length);
                    
                    // Normalize data types
                    this.units = this.units.map(unit => ({
                        ...unit,
                        pietro: parseInt(unit.pietro) || 0,
                        powierzchnia: parseFloat(unit.powierzchnia) || 0,
                        cena: parseInt(unit.cena) || 0,
                        cena_m2: parseInt(unit.cena_m2) || Math.round(unit.cena / unit.powierzchnia) || 0
                    }));
                    
                    this.filteredUnits = [...this.units];
                    return;
                }
            }
            throw new Error('No units found');
        } catch (error) {
            safeLog('📋 No units found - please add units through the admin panel');
            this.units = [];
            this.filteredUnits = [];
            safeLog('✅ No units loaded - CMS will be used to add units');
        }
        
        // Force immediate render for debugging - multiple attempts
        setTimeout(() => {
            if (this.units.length > 0) {
                safeLog('🔄 Force rendering units... (attempt 1)');
                this.filteredUnits = [...this.units];
                this.renderUnits();
            }
        }, 100);
        
        setTimeout(() => {
            if (this.units.length > 0) {
                safeLog('🔄 Force rendering units... (attempt 2)');
                this.filteredUnits = [...this.units];
                this.renderUnits();
            }
        }, 500);
        
        setTimeout(() => {
            if (this.units.length > 0 && document.getElementById('unitsTableBody')) {
                safeLog('🔄 Force rendering units... (attempt 3)');
                this.filteredUnits = [...this.units];
                this.renderTable(this.units.slice(0, 5)); // Direct render first 5
            }
        }, 1000);
    }

    async loadUnitsFromFolder() {
        const units = [];
        // Lista plików jednostek w folderze data/units/ (zarządzane przez CMS Netlify)
        const unitFiles = [
            '1-a-1.json',
            '2-a-2.json', 
            '3-a-3.json',
            '4-b-1.json',
            '5-b-2.json'
        ];
        
        console.log('🔍 Próba ładowania plików z folderu data/units/ (CMS Netlify)');
        console.log('📁 Protokół:', window.location.protocol);
        console.log('🌐 URL:', window.location.href);
        
        for (const filename of unitFiles) {
            try {
                console.log(`📁 Ładowanie: ${filename}`);
                const timestamp = Date.now();
                const url = `data/units/${filename}?t=${timestamp}`;
                console.log(`🔗 URL: ${url}`);
                
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Cache-Control': 'no-cache'
                    }
                });
                
                console.log(`📊 Status dla ${filename}:`, response.status, response.statusText);
                
                if (response.ok) {
                    const unit = await response.json();
                    console.log(`✅ Surowe dane ${filename}:`, unit);
                    
                    // Normalizuj status z CMS Netlify do formatu aplikacji
                    const normalizedUnit = {
                        ...unit,
                        status: this.normalizeStatus(unit.status),
                        pietro: parseInt(unit.pietro) || 0,
                        powierzchnia: parseFloat(unit.powierzchnia) || 0,
                        cena: parseInt(unit.cena) || 0,
                        cena_m2: parseInt(unit.cena_m2) || Math.round(unit.cena / unit.powierzchnia) || 0
                    };
                    units.push(normalizedUnit);
                    console.log(`✅ Załadowano: ${filename}`, normalizedUnit);
                } else {
                    console.error(`❌ Błąd dla ${filename}:`, response.status, response.statusText);
                    // Spróbuj załadować z fallback
                    console.log(`🔄 Próba fallback dla ${filename}`);
                }
            } catch (error) {
                console.error(`💥 Wyjątek dla ${filename}:`, error);
                // Ignoruj błędy dla nieistniejących plików
                continue;
            }
        }
        
        console.log(`📋 Łącznie załadowano: ${units.length} jednostek z CMS`);
        
        // Jeśli nie ma danych z CMS, użyj przykładowych danych
        if (units.length === 0) {
            console.log('⚠️ Brak danych z CMS - używam przykładowych danych');
            return this.getFallbackData();
        }
        
        return units.sort((a, b) => a.id.localeCompare(b.id));
    }

    // Normalizuj status z CMS Netlify do formatu aplikacji
    normalizeStatus(cmsStatus) {
        const statusMap = {
            'wolny': 'WOLNE',
            'sprzedany': 'SPRZEDANE', 
            'zarezerwowany': 'REZERWACJA'
        };
        return statusMap[cmsStatus] || cmsStatus;
    }

    // Przykładowe dane jako fallback gdy CMS jest pusty
    getFallbackData() {
        return [
            {
                id: "1-a-1",
                nr_budynku: "A",
                nr_lokalu: "1",
                pietro: 1,
                powierzchnia: 85.5,
                dodatki: "Balkon, komórka lokatorska",
                cena: 850000,
                cena_m2: 9942,
                status: "WOLNE",
                plan_url: "/assets/plans/1-a-1.pdf"
            },
            {
                id: "2-a-2",
                nr_budynku: "A",
                nr_lokalu: "2",
                pietro: 2,
                powierzchnia: 95.2,
                dodatki: "Balkon, komórka lokatorska, garaż",
                cena: 920000,
                cena_m2: 9664,
                status: "REZERWACJA",
                plan_url: "/assets/plans/2-a-2.pdf"
            },
            {
                id: "3-a-3",
                nr_budynku: "A",
                nr_lokalu: "3",
                pietro: 3,
                powierzchnia: 110.8,
                dodatki: "Taras, komórka lokatorska, garaż",
                cena: 1050000,
                cena_m2: 9477,
                status: "WOLNE",
                plan_url: "/assets/plans/3-a-3.pdf"
            },
            {
                id: "4-b-1",
                nr_budynku: "B",
                nr_lokalu: "1",
                pietro: 0,
                powierzchnia: 75.3,
                dodatki: "Ogródek, komórka lokatorska",
                cena: 720000,
                cena_m2: 9562,
                status: "SPRZEDANE",
                plan_url: "/assets/plans/4-b-1.json"
            },
            {
                id: "5-b-2",
                nr_budynku: "B",
                nr_lokalu: "2",
                pietro: 1,
                powierzchnia: 88.7,
                dodatki: "Balkon, komórka lokatorska",
                cena: 850000,
                cena_m2: 9583,
                status: "WOLNE",
                plan_url: "/assets/plans/5-b-2.pdf"
            }
        ];
    }

    getSeedData() {
        // Puste dane - wszystko będzie ładowane z plików JSON przez panel admin
        return [];
    }

    async loadSiteSettings() {
        try {
            console.log('🔧 Loading site settings...');
            const timestamp = Date.now();
            const response = await fetch(`data/site_settings/site-settings.json?t=${timestamp}`);
            
            if (response.ok) {
                const settings = await response.json();
                console.log('✅ Site settings loaded:', settings);
                this.updateLogo(settings.logo);
                this.updateFavicons(settings);
                this.updatePageTitle(settings.title);
                this.updatePageDescription(settings.description);
                this.updateContactInfo(settings);
                return settings;
            } else {
                console.log('⚠️ No site settings found, using defaults');
                return null;
            }
        } catch (error) {
            console.log('⚠️ Error loading site settings:', error);
            return null;
        }
    }

    updateLogo(logoPath) {
        if (logoPath) {
            const logoImg = document.querySelector('.logo img');
            if (logoImg) {
                logoImg.src = logoPath;
                console.log('🎨 Logo updated:', logoPath);
            }
        }
    }

    updateFavicons(settings) {
        // Update favicon links in head
        if (settings.favicon_svg) {
            this.updateFaviconLink('icon', settings.favicon_svg, 'image/svg+xml');
        }
        if (settings.favicon_16) {
            this.updateFaviconLink('icon', settings.favicon_16, 'image/png', '16x16');
        }
        if (settings.favicon_32) {
            this.updateFaviconLink('icon', settings.favicon_32, 'image/png', '32x32');
        }
        if (settings.favicon_180) {
            this.updateFaviconLink('apple-touch-icon', settings.favicon_180, 'image/png', '180x180');
        }
        if (settings.favicon_192) {
            this.updateFaviconLink('icon', settings.favicon_192, 'image/png', '192x192');
        }
        if (settings.favicon_512) {
            this.updateFaviconLink('icon', settings.favicon_512, 'image/png', '512x512');
        }
    }

    updateFaviconLink(rel, href, type, sizes = null) {
        // Find existing link or create new one
        let link = document.querySelector(`link[rel="${rel}"]${sizes ? `[sizes="${sizes}"]` : ''}`);
        
        if (!link) {
            link = document.createElement('link');
            link.rel = rel;
            if (sizes) link.sizes = sizes;
            if (type) link.type = type;
            document.head.appendChild(link);
        }
        
        link.href = href;
        console.log(`🎨 Favicon updated: ${rel}${sizes ? ` (${sizes})` : ''} -> ${href}`);
    }

    updatePageTitle(title) {
        if (title) {
            document.title = title;
            const titleElement = document.querySelector('title');
            if (titleElement) {
                titleElement.textContent = title;
            }
        }
    }

    updatePageDescription(description) {
        if (description) {
            const metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription) {
                metaDescription.setAttribute('content', description);
            }
        }
    }

    updateContactInfo(settings) {
        // Update contact information if needed
        if (settings.phone) {
            const phoneElements = document.querySelectorAll('[data-contact="phone"]');
            phoneElements.forEach(el => el.textContent = settings.phone);
        }
        if (settings.email) {
            const emailElements = document.querySelectorAll('[data-contact="email"]');
            emailElements.forEach(el => el.textContent = settings.email);
        }
    }

    // Filtering and Sorting
    applyFilters() {
        let filtered = [...this.units];
        
        // Search filter
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(unit => 
                unit.id.toLowerCase().includes(searchTerm) ||
                unit.nr_budynku.toLowerCase().includes(searchTerm) ||
                unit.nr_lokalu.toLowerCase().includes(searchTerm)
            );
        }
        
        // Status filter
        const statusFilter = document.getElementById('statusFilter').value;
        if (statusFilter) {
            filtered = filtered.filter(unit => unit.status === statusFilter);
        }
        
        // Floor filter
        const floorFilter = document.getElementById('floorFilter').value;
        if (floorFilter !== '') {
            filtered = filtered.filter(unit => unit.pietro == floorFilter);
        }
        
        // Area filters
        const areaMin = parseFloat(document.getElementById('areaMin').value);
        const areaMax = parseFloat(document.getElementById('areaMax').value);
        if (!isNaN(areaMin)) {
            filtered = filtered.filter(unit => unit.powierzchnia >= areaMin);
        }
        if (!isNaN(areaMax)) {
            filtered = filtered.filter(unit => unit.powierzchnia <= areaMax);
        }
        
        // Price filters
        const priceMin = parseFloat(document.getElementById('priceMin').value);
        const priceMax = parseFloat(document.getElementById('priceMax').value);
        if (!isNaN(priceMin)) {
            filtered = filtered.filter(unit => unit.cena >= priceMin);
        }
        if (!isNaN(priceMax)) {
            filtered = filtered.filter(unit => unit.cena <= priceMax);
        }
        
        this.filteredUnits = filtered;
        this.currentPage = 1;
        this.renderUnits();
    }

    sortUnits(column) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }
        
        this.filteredUnits.sort((a, b) => {
            let aVal = a[column];
            let bVal = b[column];
            
            // Handle numeric values
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return this.sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
            }
            
            // Handle string values
            aVal = String(aVal).toLowerCase();
            bVal = String(bVal).toLowerCase();
            
            if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
        
        this.renderUnits();
        this.updateSortHeaders();
    }

    updateSortHeaders() {
        // Clear all sort indicators
        document.querySelectorAll('.units-table th').forEach(th => {
            th.classList.remove('sort-asc', 'sort-desc');
        });
        
        // Add current sort indicator
        if (this.sortColumn) {
            const th = document.querySelector(`[data-sort="${this.sortColumn}"]`);
            if (th) {
                th.classList.add(this.sortDirection === 'asc' ? 'sort-asc' : 'sort-desc');
            }
        }
    }

    updateFloorFilter() {
        const floorFilter = document.getElementById('floorFilter');
        const floors = [...new Set(this.units.map(unit => unit.pietro))].sort((a, b) => a - b);
        
        // Keep current value
        const currentValue = floorFilter.value;
        
        // Clear and rebuild options
        floorFilter.innerHTML = '<option value="">Wszystkie</option>';
        floors.forEach(floor => {
            const option = document.createElement('option');
            option.value = floor;
            option.textContent = floor == 0 ? 'Parter' : `${floor} piętro`;
            floorFilter.appendChild(option);
        });
        
        // Restore selection if still valid
        if (floors.includes(parseInt(currentValue))) {
            floorFilter.value = currentValue;
        }
    }

    // Rendering
    renderUnits() {
        safeLog('🎯 renderUnits called');
        safeLog('📊 Current state: units=' + this.units.length + ', filtered=' + this.filteredUnits.length + ', page=' + this.currentPage);
        
        const perPageElement = document.getElementById('perPage');
        if (!perPageElement) {
            safeLog('❌ perPage element not found', 'error');
            return;
        }
        
        this.perPage = parseInt(perPageElement.value) || 25;
        const startIndex = (this.currentPage - 1) * this.perPage;
        const endIndex = startIndex + this.perPage;
        const pageUnits = this.filteredUnits.slice(startIndex, endIndex);
        
        safeLog('📋 Rendering units: perPage=' + this.perPage + ', showing=' + pageUnits.length + ', firstUnit=' + (pageUnits[0]?.id || 'none'));
        
        // Render desktop table
        this.renderTable(pageUnits);
        
        // Render mobile cards
        this.renderCards(pageUnits);
        
        // Render pagination
        this.renderPagination();
        
        safeLog('✅ renderUnits complete');
    }

    renderTable(units) {
        const tbody = document.getElementById('unitsTableBody');
        if (!tbody) {
            safeLog('❌ Table body not found', 'error');
            return;
        }
        
        safeLog('🔄 Clearing table and rendering ' + units.length + ' units');
        
        // Hide emergency row
        const emergencyRow = document.getElementById('emergency-row');
        if (emergencyRow) {
            emergencyRow.style.display = 'none';
            safeLog('✅ Emergency row hidden');
        }
        
        tbody.innerHTML = '';
        
        if (units.length === 0) {
            tbody.innerHTML = 
                '<tr>' +
                    '<td colspan="10" style="text-align: center; padding: 2rem; color: #666;">' +
                        'Brak lokali spełniających kryteria wyszukiwania' +
                    '</td>' +
                '</tr>';
            return;
        }
        
        units.forEach((unit, index) => {
            try {
                const row = document.createElement('tr');
                row.className = unit.status === 'SPRZEDANE' ? 'sold' : '';
                
                const planCell = unit.plan_url ? 
                    '<a href="' + encodeURI(unit.plan_url) + '" target="_blank" class="plan-link" aria-label="Otwórz plan lokalu ' + unit.id + '">📄 Plan</a>' : 
                    '-';
                
                row.innerHTML = 
                    '<td><strong>' + unit.id + '</strong></td>' +
                    '<td>' + unit.nr_budynku + '</td>' +
                    '<td>' + unit.nr_lokalu + '</td>' +
                    '<td>' + (unit.pietro == 0 ? 'Parter' : unit.pietro) + '</td>' +
                    '<td>' + unit.powierzchnia + ' m²</td>' +
                    '<td>' + (unit.dodatki || '-') + '</td>' +
                    '<td>' + this.formatPrice(unit.cena) + ' zł</td>' +
                    '<td>' + this.formatPrice(unit.cena_m2) + ' zł</td>' +
                    '<td><span class="status-chip ' + this.getStatusClass(unit.status) + '">' + unit.status + '</span></td>' +
                    '<td>' + planCell + '</td>';
                
                tbody.appendChild(row);
                safeLog('✅ Added row ' + (index + 1) + ': ' + unit.id);
            } catch (error) {
                safeLog('❌ Error rendering unit ' + unit.id + ': ' + error.message, 'error');
            }
        });
        
        safeLog('✅ Rendered ' + units.length + ' units in table');
    }

    renderCards(units) {
        const container = document.getElementById('unitsCards');
        container.innerHTML = '';
        
        units.forEach(unit => {
            const card = document.createElement('div');
            card.className = 'unit-card' + (unit.status === 'SPRZEDANE' ? ' sold' : '');
            
            const dodatki = unit.dodatki ? '<div class="unit-card-details"><p><strong>Dodatki:</strong> ' + unit.dodatki + '</p></div>' : '';
            const planButton = unit.plan_url ? '<a href="' + encodeURI(unit.plan_url) + '" target="_blank" class="btn btn-outline btn-sm">Zobacz plan</a>' : '';
            
            card.innerHTML = 
                '<div class="unit-card-header">' +
                    '<div class="unit-card-id">Lokal ' + unit.id + '</div>' +
                    '<span class="status-chip ' + this.getStatusClass(unit.status) + '">' + unit.status + '</span>' +
                '</div>' +
                '<div class="unit-card-info">' +
                    '<div class="unit-card-field">' +
                        '<div class="label">Budynek / Lokal</div>' +
                        '<div class="value">' + unit.nr_budynku + ' / ' + unit.nr_lokalu + '</div>' +
                    '</div>' +
                    '<div class="unit-card-field">' +
                        '<div class="label">Piętro</div>' +
                        '<div class="value">' + (unit.pietro == 0 ? 'Parter' : unit.pietro) + '</div>' +
                    '</div>' +
                    '<div class="unit-card-field">' +
                        '<div class="label">Powierzchnia</div>' +
                        '<div class="value">' + unit.powierzchnia + ' m²</div>' +
                    '</div>' +
                    '<div class="unit-card-field price">' +
                        '<div class="label">Cena</div>' +
                        '<div class="value">' + this.formatPrice(unit.cena) + ' zł</div>' +
                    '</div>' +
                    '<div class="unit-card-field status">' +
                        '<div class="label">Cena za m²</div>' +
                        '<div class="value">' + this.formatPrice(unit.cena_m2) + ' zł/m²</div>' +
                    '</div>' +
                '</div>' +
                dodatki +
                '<div class="unit-card-actions">' +
                    planButton +
                    '<a href="#contact" class="btn btn-primary btn-sm">Kontakt</a>' +
                '</div>';
            
            container.appendChild(card);
        });
    }

    renderPagination() {
        const container = document.getElementById('pagination');
        if (!container) return;
        
        const totalPages = Math.ceil(this.filteredUnits.length / this.perPage);
        
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }
        
        let html = '';
        
        // Previous button
        const prevDisabled = this.currentPage === 1 ? 'disabled' : '';
        html += '<button ' + prevDisabled + ' onclick="app.goToPage(' + (this.currentPage - 1) + ')">‹ Poprzednia</button>';
        
        // Page numbers
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, this.currentPage + 2);
        
        if (startPage > 1) {
            html += '<button onclick="app.goToPage(1)">1</button>';
            if (startPage > 2) html += '<span>...</span>';
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const currentClass = i === this.currentPage ? 'current-page' : '';
            html += '<button class="' + currentClass + '" onclick="app.goToPage(' + i + ')">' + i + '</button>';
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) html += '<span>...</span>';
            html += '<button onclick="app.goToPage(' + totalPages + ')">' + totalPages + '</button>';
        }
        
        // Next button
        const nextDisabled = this.currentPage === totalPages ? 'disabled' : '';
        html += '<button ' + nextDisabled + ' onclick="app.goToPage(' + (this.currentPage + 1) + ')">Następna ›</button>';
        
        container.innerHTML = html;
    }

    goToPage(page) {
        const totalPages = Math.ceil(this.filteredUnits.length / this.perPage);
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.renderUnits();
        }
    }

    // UI Components
    setupHeroSlider() {
        const slides = document.querySelectorAll('.hero-slide');
        const dots = document.querySelectorAll('.hero-dot');
        const prevBtn = document.getElementById('heroPrev');
        const nextBtn = document.getElementById('heroNext');
        
        if (!slides.length) {
            console.warn('No hero slides found');
            return;
        }
        
        const showSlide = (index) => {
            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
        };
        
        const nextSlide = () => {
            this.currentSlide = (this.currentSlide + 1) % slides.length;
            showSlide(this.currentSlide);
        };
        
        const prevSlide = () => {
            this.currentSlide = (this.currentSlide - 1 + slides.length) % slides.length;
            showSlide(this.currentSlide);
        };
        
        // Event listeners
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);
        
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                this.currentSlide = index;
                showSlide(this.currentSlide);
            });
        });
        
        // Auto-play
        setInterval(nextSlide, 5000);
        
        // Touch/swipe support for mobile
        let startX = 0;
        const heroElement = document.querySelector('.hero');
        
        if (heroElement) {
            heroElement.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
            }, { passive: true });
            
            heroElement.addEventListener('touchend', (e) => {
                const endX = e.changedTouches[0].clientX;
                const diff = startX - endX;
                
                if (Math.abs(diff) > 50) {
                    if (diff > 0) {
                        nextSlide();
                    } else {
                        prevSlide();
                    }
                }
            }, { passive: true });
        }
    }

    setupGallery() {
        const mainImage = document.querySelector('#galleryMain img');
        const thumbs = document.querySelectorAll('.gallery-thumb');
        
        thumbs.forEach((thumb, index) => {
            thumb.addEventListener('click', () => {
                // Update main image
                const newImage = thumb.dataset.image;
                const newAlt = thumb.dataset.alt;
                
                if (mainImage) {
                    mainImage.src = newImage;
                    mainImage.alt = newAlt;
                }
                
                // Update active thumb
                thumbs.forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
                
                this.galleryCurrentImage = index;
            });
        });
    }

    setupStickyHeader() {
        const header = document.getElementById('header');
        let lastScrollTop = 0;
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            if (scrollTop > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            lastScrollTop = scrollTop;
        });
    }

    setupMobileMenu() {
        const menuToggle = document.getElementById('menuToggle');
        const nav = document.getElementById('nav');
        
        if (!menuToggle) {
            console.error('❌ Menu toggle button not found');
            return;
        }
        
        if (!nav) {
            console.error('❌ Navigation element not found');
            return;
        }
        
        console.log('✅ Mobile menu elements found:', { menuToggle, nav });
        
        menuToggle.addEventListener('click', () => {
            console.log('🔄 Menu toggle clicked');
            nav.classList.toggle('active');
            menuToggle.classList.toggle('active');
            console.log('📱 Menu state:', nav.classList.contains('active') ? 'open' : 'closed');
        });
        
        // Close menu when clicking on links
        nav.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                nav.classList.remove('active');
                menuToggle.classList.remove('active');
                console.log('🔗 Menu closed by link click');
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!nav.contains(e.target) && !menuToggle.contains(e.target)) {
                nav.classList.remove('active');
                menuToggle.classList.remove('active');
                console.log('🔗 Menu closed by outside click');
            }
        });
        
        console.log('✅ Mobile menu setup complete');
    }

    setupProspectButton() {
        const prospectBtn = document.getElementById('prospectBtn');
        if (prospectBtn) {
            prospectBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.downloadProspect();
            });
        }
    }

    downloadProspect() {
        try {
            // Sprawdź czy mamy ustawienia strony z plikiem prospektu
            if (!this.siteSettings || !this.siteSettings.prospekt_file) {
                console.warn('⚠️ Brak pliku prospektu w ustawieniach strony');
                this.showToast('Prospekt informacyjny nie jest dostępny. Skontaktuj się z administratorem.', 'warning');
                return;
            }

            // Pobieranie prospektu z ustawień CMS
            const link = document.createElement('a');
            link.href = this.siteSettings.prospekt_file;
            
            // Wyciągnij nazwę pliku z URL
            const fileName = this.siteSettings.prospekt_file.split('/').pop() || 'prospekt-harmonia-rzaska.pdf';
            link.download = fileName;
            link.target = '_blank';
            
            // Dodaj link do DOM, kliknij i usuń
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showToast('Prospekt informacyjny został pobrany!', 'success');
            console.log('📄 Prospect downloaded successfully from CMS:', this.siteSettings.prospekt_file);
        } catch (error) {
            console.error('❌ Error downloading prospect:', error);
            this.showToast('Błąd podczas pobierania prospektu. Spróbuj ponownie.', 'error');
        }
    }

    setupEventListeners() {
        // Table sorting
        document.querySelectorAll('.units-table th.sortable').forEach(th => {
            th.addEventListener('click', () => {
                const column = th.dataset.sort;
                if (column) {
                    this.sortUnits(column);
                }
            });
        });
        
        // Filters - with error handling
        ['searchInput', 'statusFilter', 'floorFilter', 'areaMin', 'areaMax', 'priceMin', 'priceMax'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => this.applyFilters());
                console.log('✅ Filter attached:', id);
            } else {
                console.warn(`⚠️ Element with id '${id}' not found`);
            }
        });
        
        // Per page selector
        const perPageElement = document.getElementById('perPage');
        if (perPageElement) {
            perPageElement.addEventListener('change', () => {
                this.currentPage = 1;
                this.renderUnits();
            });
            console.log('✅ Per-page selector attached');
        } else {
            console.warn('⚠️ Per-page selector not found');
        }
        
        // Responsive table/cards toggle
        this.setupResponsiveTable();
        
        console.log('✅ All event listeners setup complete');
    }

    setupResponsiveTable() {
        const checkScreen = () => {
            const tableContainer = document.getElementById('unitsTableContainer');
            const cardsContainer = document.getElementById('unitsCards');
            
            if (window.innerWidth <= 576) {
                tableContainer.classList.add('hidden');
                cardsContainer.classList.remove('hidden');
            } else {
                tableContainer.classList.remove('hidden');
                cardsContainer.classList.add('hidden');
            }
        };
        
        window.addEventListener('resize', checkScreen);
        checkScreen(); // Initial check
    }

    setupCookieBanner() {
        const banner = document.getElementById('cookieBanner');
        const acceptBtn = document.getElementById('acceptCookies');
        const settingsBtn = document.getElementById('cookieSettings');
        
        if (!banner) return;
        
        // Check if cookies were already accepted
        const cookiesAccepted = this.getCookie('cookiesAccepted');
        
        if (!cookiesAccepted) {
            // Show banner after 2 seconds
            setTimeout(() => {
                banner.classList.add('show');
            }, 2000);
        }
        
        // Accept cookies
        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => {
                this.setCookie('cookiesAccepted', 'true', 365);
                banner.classList.remove('show');
                this.showToast('Ustawienia cookies zostały zapisane', 'success');
            });
        }
        
        // Cookie settings (placeholder - you can expand this)
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showToast('Funkcja ustawień cookies będzie dostępna wkrótce', 'info');
            });
        }
    }

    setupContactForm() {
        const form = document.getElementById('contactForm');
        const submitBtn = document.getElementById('contactSubmit');
        
        if (!form || !submitBtn) return;
        
        // Add reCAPTCHA token before submission
        form.addEventListener('submit', async (e) => {
            // Validate form first
            if (!this.validateContactForm()) {
                e.preventDefault();
                return;
            }
            
            // Show loading state
            const btnText = submitBtn.querySelector('.btn-text');
            const btnLoading = submitBtn.querySelector('.btn-loading');
            
            if (btnText) btnText.classList.add('hidden');
            if (btnLoading) btnLoading.classList.remove('hidden');
            submitBtn.disabled = true;
            
            try {
                // Get reCAPTCHA v3 token
                if (typeof grecaptcha !== 'undefined') {
                    try {
                        const recaptchaToken = await grecaptcha.execute('6Lc1sK8rAAAAAFvcqHK72bEpkcT7xUtbowTMD4f7', {action: 'contact_form'});
                        // Add reCAPTCHA response to form
                        const recaptchaInput = document.getElementById('recaptchaResponse');
                        if (recaptchaInput) {
                            recaptchaInput.value = recaptchaToken;
                        }
                    } catch (recaptchaError) {
                        console.warn('reCAPTCHA error:', recaptchaError);
                    }
                }
                
                // Let Netlify Forms handle the submission naturally
                // Form will submit to / and Netlify will process it
                
            } catch (error) {
                console.error('Contact form error:', error);
                this.showToast('Wystąpił błąd podczas wysyłania wiadomości. Spróbuj ponownie lub skontaktuj się telefonicznie.', 'error');
                e.preventDefault();
            } finally {
                // Restore button state
                if (btnText) btnText.classList.remove('hidden');
                if (btnLoading) btnLoading.classList.add('hidden');
                submitBtn.disabled = false;
            }
        });
    }

    validateContactForm() {
        const form = document.getElementById('contactForm');
        if (!form) return false;
        
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        // Clear previous errors
        form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        form.querySelectorAll('.error-message').forEach(el => el.remove());
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                this.showFieldError(field, 'To pole jest wymagane');
                isValid = false;
            } else if (field.type === 'email' && !this.isValidEmail(field.value)) {
                this.showFieldError(field, 'Wprowadź poprawny adres e-mail');
                isValid = false;
            } else if (field.type === 'tel' && !this.isValidPhone(field.value)) {
                this.showFieldError(field, 'Wprowadź poprawny numer telefonu');
                isValid = false;
            }
        });
        
        return isValid;
    }

    showFieldError(field, message) {
        field.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{9,}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    // Netlify Forms handles form submission automatically
    // No need for custom submitContactForm function

    // Cookie management
    setCookie(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    }

    getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    // Utility Functions
    formatPrice(price) {
        return new Intl.NumberFormat('pl-PL').format(price);
    }

    getStatusClass(status) {
        switch (status) {
            case 'WOLNE': return 'available';
            case 'REZERWACJA': return 'reserved';
            case 'SPRZEDANE': return 'sold';
            default: return '';
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        const container = document.getElementById('toastContainer');
        container.appendChild(toast);
        
        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
        
        // Auto remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (container.contains(toast)) {
                    container.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    // PWA Methods
    async setupPWA() {
        if ('serviceWorker' in navigator) {
            try {
                console.log('🔧 Setting up PWA...');
                
                // Rejestracja Service Worker
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('✅ Service Worker zarejestrowany:', registration);
                
                // Sprawdzanie aktualizacji
                registration.addEventListener('updatefound', () => {
                    console.log('🔄 Nowa wersja Service Worker dostępna');
                    this.showUpdateNotification();
                });
                
                // Sprawdzanie czy PWA jest zainstalowane
                this.checkPWAInstallation();
                
                // Setup push notifications
                await this.setupPushNotifications(registration);
                
                console.log('✅ PWA setup complete');
            } catch (error) {
                console.error('❌ PWA setup error:', error);
            }
        } else {
            console.log('⚠️ Service Worker nie jest wspierany');
        }
    }

    showUpdateNotification() {
        const updateBanner = document.createElement('div');
        updateBanner.className = 'pwa-update-banner';
        updateBanner.innerHTML = `
            <div class="pwa-update-content">
                <span>🔄 Dostępna nowa wersja aplikacji</span>
                <button onclick="app.updatePWA()" class="btn btn-primary btn-sm">Aktualizuj</button>
                <button onclick="this.parentElement.parentElement.remove()" class="btn btn-outline btn-sm">Później</button>
            </div>
        `;
        
        document.body.appendChild(updateBanner);
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (document.body.contains(updateBanner)) {
                updateBanner.remove();
            }
        }, 10000);
    }

    updatePWA() {
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
        }
    }

    checkPWAInstallation() {
        // Sprawdzanie czy PWA jest zainstalowane
        if (window.matchMedia('(display-mode: standalone)').matches) {
            console.log('📱 PWA działa w trybie standalone');
            document.body.classList.add('pwa-installed');
        }
        
        // Sprawdzanie czy można zainstalować
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('📱 PWA install prompt available');
            this.showInstallPrompt(e);
        });
    }

    showInstallPrompt(event) {
        const installBanner = document.createElement('div');
        installBanner.className = 'pwa-install-banner';
        installBanner.innerHTML = `
            <div class="pwa-install-content">
                <span>📱 Zainstaluj aplikację Harmonia Rząska</span>
                <button onclick="app.installPWA(event)" class="btn btn-primary btn-sm">Zainstaluj</button>
                <button onclick="this.parentElement.parentElement.remove()" class="btn btn-outline btn-sm">Później</button>
            </div>
        `;
        
        document.body.appendChild(installBanner);
        
        // Store event for later use
        this.installPromptEvent = event;
        
        // Auto-hide after 15 seconds
        setTimeout(() => {
            if (document.body.contains(installBanner)) {
                installBanner.remove();
            }
        }, 15000);
    }

    async installPWA() {
        if (this.installPromptEvent) {
            this.installPromptEvent.prompt();
            const result = await this.installPromptEvent.userChoice;
            
            if (result.outcome === 'accepted') {
                console.log('✅ PWA zainstalowane');
                this.showToast('Aplikacja została zainstalowana!', 'success');
            } else {
                console.log('❌ PWA instalacja anulowana');
            }
            
            this.installPromptEvent = null;
        }
    }

    async setupPushNotifications(registration) {
        try {
            // Sprawdzanie uprawnień
            const permission = await Notification.requestPermission();
            
            if (permission === 'granted') {
                console.log('✅ Push notifications enabled');
                
                // Subskrypcja push notifications
                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: this.urlBase64ToUint8Array('YOUR_VAPID_PUBLIC_KEY') // Do zmiany
                });
                
                console.log('📱 Push subscription:', subscription);
                
                // Tutaj możesz wysłać subscription do serwera
                // await this.sendSubscriptionToServer(subscription);
                
            } else {
                console.log('⚠️ Push notifications not granted');
            }
        } catch (error) {
            console.error('❌ Push notifications setup error:', error);
        }
    }

    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    // Offline form handling
    async handleOfflineForm(formData) {
        try {
            // Cache form data
            const cache = await caches.open('harmonia-dynamic-v1.0.0');
            const request = new Request('/.netlify/functions/contact-form', {
                method: 'POST',
                body: formData
            });
            
            await cache.put(request, new Response('Offline - Form saved'));
            
            // Register background sync
            if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
                const registration = await navigator.serviceWorker.ready;
                await registration.sync.register('contact-form-sync');
            }
            
            this.showToast('Formularz zapisany - zostanie wysłany gdy połączenie zostanie przywrócone', 'info');
        } catch (error) {
            console.error('❌ Offline form handling error:', error);
            this.showToast('Błąd podczas zapisywania formularza offline', 'error');
        }
    }

    setupOfflineIndicator() {
        const offlineIndicator = document.getElementById('offlineIndicator');
        
        if (!offlineIndicator) return;
        
        // Sprawdź czy użytkownik wyłączył komunikat offline
        const offlineIndicatorDisabled = this.getCookie('offlineIndicatorDisabled');
        if (offlineIndicatorDisabled === 'true') {
            return; // Nie pokazuj komunikatu
        }
        
        // Dodaj przycisk zamknięcia
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '&times;';
        closeButton.className = 'offline-close-btn';
        closeButton.style.cssText = `
            background: none; border: none; color: white; 
            font-size: 18px; cursor: pointer; margin-left: 10px;
            padding: 0; width: 20px; height: 20px; display: flex;
            align-items: center; justify-content: center;
        `;
        offlineIndicator.appendChild(closeButton);
        
        // Funkcja sprawdzania połączenia z internetem
        const checkConnection = async () => {
            try {
                // Sprawdź czy jest połączenie z internetem
                const response = await fetch('/data/site_settings/site-settings.json', {
                    method: 'HEAD',
                    cache: 'no-cache',
                    timeout: 3000
                });
                return response.ok;
            } catch (error) {
                return false;
            }
        };
        
        const updateOnlineStatus = async () => {
            // Sprawdź zarówno navigator.onLine jak i rzeczywiste połączenie
            const isOnline = navigator.onLine && await checkConnection();
            
            if (isOnline) {
                offlineIndicator.classList.remove('show');
            } else {
                offlineIndicator.classList.add('show');
            }
        };
        
        // Obsługa zamknięcia komunikatu
        closeButton.addEventListener('click', () => {
            offlineIndicator.classList.remove('show');
            // Zapisz preferencję użytkownika
            this.setCookie('offlineIndicatorDisabled', 'true', 30); // 30 dni
        });
        
        // Initial check z opóźnieniem
        setTimeout(updateOnlineStatus, 1000);
        
        // Listen for online/offline events
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        
        // Dodatkowe sprawdzanie co 30 sekund
        setInterval(updateOnlineStatus, 30000);
    }

    // Initialize Lucide icons
    initLucideIcons() {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
            console.log('🎨 Lucide icons initialized');
        } else {
            console.log('⚠️ Lucide not loaded yet, retrying...');
            setTimeout(() => this.initLucideIcons(), 100);
        }
    }
}

// Initialize app when DOM is loaded
let app;

// Console fallback for older browsers or environments
if (typeof console === 'undefined' || !console.log) {
    window.console = {
        log: function() {},
        warn: function() {},
        error: function() {},
        info: function() {},
        debug: function() {}
    };
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        safeLog('🌟 Starting Harmonia Rząska website...');
        app = new HarmoniaApp();
        safeLog('✅ Harmonia Rząska app initialized successfully');
    } catch (error) {
        safeLog('❌ Error initializing app: ' + error.message, 'error');
        
        // Show user-friendly error message
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed; top: 20px; left: 20px; right: 20px; 
            background: #EF4444; color: white; padding: 1rem; 
            border-radius: 8px; z-index: 9999; text-align: center;
            font-family: Arial, sans-serif;
        `;
        errorDiv.innerHTML = `
            <strong>Błąd inicjalizacji strony</strong><br>
            Proszę odświeżyć stronę lub skontaktować się z administratorem.
        `;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (document.body.contains(errorDiv)) {
                document.body.removeChild(errorDiv);
            }
        }, 10000);
        
        // Try to show basic content without JavaScript
        const unitsTable = document.getElementById('unitsTableBody');
        if (unitsTable) {
            unitsTable.innerHTML = `
                <tr>
                    <td colspan="10" style="text-align: center; padding: 2rem; color: #666;">
                        <p>Tabela lokali jest obecnie niedostępna.</p>
                        <p>Proszę skontaktować się telefonicznie: <strong>730 090 030</strong></p>
                    </td>
                </tr>
            `;
        }
    }
});

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    event.preventDefault();
});

// Smooth scrolling for anchor links with error handling
document.addEventListener('click', (e) => {
    try {
        if (e.target.matches('a[href^="#"]')) {
            e.preventDefault();
            const href = e.target.getAttribute('href');
            const target = href ? document.querySelector(href) : null;
            
            if (target) {
                const header = document.getElementById('header');
                const headerHeight = header ? header.offsetHeight : 80;
                const targetPosition = target.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: Math.max(0, targetPosition),
                    behavior: 'smooth'
                });
            } else {
                console.warn(`Target element not found for href: ${href}`);
            }
        }
    } catch (error) {
        console.error('Error in smooth scroll handler:', error);
    }
});

// Debug functions for troubleshooting
window.debugUnits = async () => {
    console.log('🔧 Debug: Sprawdzanie stanu aplikacji...');
    console.log('📊 App instance:', app);
    console.log('📋 Units array:', app?.units);
    console.log('🔍 Filtered units:', app?.filteredUnits);
    
    if (app) {
        console.log('🔄 Próba ponownego załadowania jednostek...');
        await app.loadUnits();
        console.log('✅ Po ponownym załadowaniu:', app.units.length, 'jednostek');
    }
};

window.testFetch = async () => {
    console.log('🧪 Test: Sprawdzanie dostępności plików JSON...');
    const testFiles = ['1-a-1.json', '2-a-2.json', '3-a-3.json'];
    
    for (const file of testFiles) {
        try {
            const timestamp = Date.now();
            const response = await fetch(`data/units/${file}?t=${timestamp}`);
            console.log(`📁 ${file}:`, response.status, response.statusText);
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ ${file} data:`, data);
            }
        } catch (error) {
            console.error(`❌ ${file} error:`, error);
        }
    }
};

// Funkcja do resetowania ustawień offline indicator - poprawiona
window.resetOfflineIndicator = () => {
    console.log('🔄 Resetowanie ustawień offline indicator...');
    
    // Usuń cookie
    document.cookie = 'offlineIndicatorDisabled=false; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    console.log('✅ Offline indicator settings reset');
    
    // Pokaż toast jeśli aplikacja jest dostępna
    if (window.app && window.app.showToast) {
        window.app.showToast('Ustawienia komunikatu offline zostały zresetowane', 'success');
    } else {
        console.log('ℹ️ Toast nie dostępny - aplikacja nie zainicjalizowana');
    }
    
    // Przeładuj stronę aby zastosować zmiany
    setTimeout(() => {
        console.log('🔄 Przeładowanie strony...');
        window.location.reload();
    }, 1000);
};

// Funkcja do sprawdzania stanu połączenia
window.checkConnectionStatus = async () => {
    console.log('🌐 Sprawdzanie stanu połączenia...');
    console.log('📱 navigator.onLine:', navigator.onLine);
    
    try {
        const response = await fetch('/data/site_settings/site-settings.json', {
            method: 'HEAD',
            cache: 'no-cache',
            timeout: 3000
        });
        console.log('✅ Połączenie z serwerem:', response.ok, response.status);
        return response.ok;
    } catch (error) {
        console.log('❌ Błąd połączenia:', error.message);
        return false;
    }
};

// Funkcja emergency render - dostępna zawsze
window.emergencyRender = () => {
    console.log('🚨 Emergency render - próba naprawy...');
    
    const tbody = document.getElementById('unitsTableBody');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align: center; padding: 2rem; color: #666;">
                    <p>🔧 Aplikacja w trybie naprawy</p>
                    <p>Sprawdź połączenie: <button onclick="checkConnectionStatus()" style="background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Sprawdź połączenie</button></p>
                    <p>Kontakt: <strong>730 090 030</strong></p>
                </td>
            </tr>
        `;
        console.log('✅ Emergency render wykonany');
    } else {
        console.error('❌ Nie znaleziono tbody do emergency render');
    }
};

// Funkcja do sprawdzania stanu aplikacji
window.checkAppStatus = () => {
    console.log('🔍 Sprawdzanie stanu aplikacji...');
    console.log('📱 navigator.onLine:', navigator.onLine);
    console.log('🌐 window.app:', window.app);
    console.log('📄 document.readyState:', document.readyState);
    console.log('🔧 Service Worker:', 'serviceWorker' in navigator);
    
    // Sprawdź czy elementy DOM istnieją
    const requiredElements = [
        'unitsTableBody',
        'unitsCards', 
        'pagination',
        'searchInput',
        'statusFilter',
        'floorFilter',
        'perPage'
    ];
    
    console.log('📋 Sprawdzanie elementów DOM:');
    requiredElements.forEach(id => {
        const element = document.getElementById(id);
        console.log(`  ${id}: ${element ? '✅' : '❌'}`);
    });
    
    // Sprawdź błędy w konsoli
    console.log('⚠️ Sprawdź czy są błędy w konsoli powyżej');
    
    return {
        online: navigator.onLine,
        appInitialized: !!window.app,
        domReady: document.readyState === 'complete',
        serviceWorkerSupported: 'serviceWorker' in navigator
    };
};

// Funkcja do testowania ładowania danych
window.testDataLoading = async () => {
    console.log('🧪 Test: Sprawdzanie ładowania danych...');
    
    try {
        // Test pojedynczego pliku
        const response = await fetch('/data/units/1-a-1.json');
        console.log('📁 Status 1-a-1.json:', response.status, response.statusText);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Dane 1-a-1.json:', data);
        } else {
            console.error('❌ Błąd ładowania 1-a-1.json');
        }
        
        // Test wszystkich plików
        const files = ['1-a-1.json', '2-a-2.json', '3-a-3.json', '4-b-1.json', '5-b-2.json'];
        const results = [];
        
        for (const file of files) {
            try {
                const resp = await fetch(`/data/units/${file}`);
                results.push({
                    file,
                    status: resp.status,
                    ok: resp.ok
                });
            } catch (error) {
                results.push({
                    file,
                    status: 'ERROR',
                    ok: false,
                    error: error.message
                });
            }
        }
        
        console.log('📊 Wyniki testu wszystkich plików:', results);
        
        // Sprawdź czy aplikacja ma dane
        if (window.app) {
            console.log('📋 App units count:', window.app.units.length);
            console.log('🔍 App filtered units count:', window.app.filteredUnits.length);
            
            if (window.app.units.length === 0) {
                console.log('🔄 Próba ponownego załadowania...');
                await window.app.loadUnits();
                console.log('✅ Po ponownym załadowaniu:', window.app.units.length, 'jednostek');
            }
        }
        
    } catch (error) {
        console.error('❌ Błąd testu ładowania danych:', error);
    }
};

// Funkcja do sprawdzania CMS Netlify
window.checkCMSStatus = async () => {
    console.log('🔍 Sprawdzanie statusu CMS Netlify...');
    
    try {
        // Sprawdź ustawienia strony
        const settingsResponse = await fetch('/data/site_settings/site-settings.json');
        console.log('📋 Site settings status:', settingsResponse.status, settingsResponse.statusText);
        
        if (settingsResponse.ok) {
            const settings = await settingsResponse.json();
            console.log('✅ Site settings:', settings);
        }
        
        // Sprawdź dostępność admin panel
        const adminResponse = await fetch('/admin/');
        console.log('🔧 Admin panel status:', adminResponse.status, adminResponse.statusText);
        
        // Sprawdź przykładowy plik lokalu
        const unitResponse = await fetch('/data/units/1-a-1.json');
        console.log('🏠 Sample unit status:', unitResponse.status, unitResponse.statusText);
        
        if (unitResponse.ok) {
            const unit = await unitResponse.json();
            console.log('✅ Sample unit data:', unit);
            console.log('📊 Status mapping:', {
                original: unit.status,
                normalized: window.app ? window.app.normalizeStatus(unit.status) : 'N/A'
            });
        }
        
        // Sprawdź konfigurację CMS
        const configResponse = await fetch('/admin/config.yml');
        console.log('⚙️ CMS config status:', configResponse.status, configResponse.statusText);
        
        return {
            siteSettings: settingsResponse.ok,
            adminPanel: adminResponse.ok,
            sampleUnit: unitResponse.ok,
            cmsConfig: configResponse.ok
        };
        
    } catch (error) {
        console.error('❌ Błąd sprawdzania CMS:', error);
        return { error: error.message };
    }
};

// Funkcja do testowania dostępności plików JSON
window.testJSONFiles = async () => {
    console.log('🧪 Test: Sprawdzanie dostępności plików JSON...');
    
    const files = ['1-a-1.json', '2-a-2.json', '3-a-3.json', '4-b-1.json', '5-b-2.json'];
    const results = [];
    
    for (const file of files) {
        try {
            console.log(`📁 Testuję: ${file}`);
            const response = await fetch(`/data/units/${file}`);
            const result = {
                file,
                status: response.status,
                ok: response.ok,
                statusText: response.statusText
            };
            
            if (response.ok) {
                const data = await response.json();
                result.data = data;
                console.log(`✅ ${file}:`, data);
            } else {
                console.error(`❌ ${file}:`, response.status, response.statusText);
            }
            
            results.push(result);
        } catch (error) {
            console.error(`💥 ${file} error:`, error);
            results.push({
                file,
                status: 'ERROR',
                ok: false,
                error: error.message
            });
        }
    }
    
    console.log('📊 Wyniki testu:', results);
    return results;
};

// Funkcja do wymuszenia ładowania danych
window.forceLoadData = async () => {
    console.log('🚀 Wymuszanie ładowania danych...');

    if (!window.app) {
        console.error('❌ Aplikacja nie jest zainicjalizowana');
        console.log('🔍 Sprawdzanie stanu aplikacji...');
        console.log('window.app:', window.app);
        console.log('document.readyState:', document.readyState);
        console.log('HarmoniaApp:', typeof HarmoniaApp);
        return;
    }

    try {
        // Wyczyść dane
        window.app.units = [];
        window.app.filteredUnits = [];

        // Załaduj ponownie
        await window.app.loadUnits();

        console.log('✅ Dane załadowane:', window.app.units.length, 'jednostek');

        // Renderuj
        window.app.renderUnits();

        console.log('✅ Renderowanie zakończone');

    } catch (error) {
        console.error('❌ Błąd wymuszania ładowania:', error);
    }
};

// Funkcja do sprawdzenia inicjalizacji aplikacji
window.checkAppInit = () => {
    console.log('🔍 Sprawdzanie inicjalizacji aplikacji...');
    console.log('window.app:', window.app);
    console.log('document.readyState:', document.readyState);
    console.log('HarmoniaApp:', typeof HarmoniaApp);
    console.log('safeLog:', typeof safeLog);
    
    if (window.app) {
        console.log('✅ Aplikacja zainicjalizowana');
        console.log('📊 Liczba jednostek:', window.app.units.length);
        console.log('📊 Liczba przefiltrowanych:', window.app.filteredUnits.length);
    } else {
        console.log('❌ Aplikacja nie zainicjalizowana');
    }
};

/*
FUNKCJE DEBUG DLA ADMINISTRATORÓW:
- checkConnectionStatus() - sprawdza stan połączenia z internetem
- resetOfflineIndicator() - resetuje ustawienia komunikatu offline
- debugUnits() - sprawdza stan załadowanych jednostek
- testFetch() - testuje dostępność plików JSON
- emergencyRender() - awaryjne renderowanie tabeli
- checkAppStatus() - sprawdza stan aplikacji i elementów DOM
- testDataLoading() - testuje ładowanie danych lokali
- checkCMSStatus() - sprawdza status CMS Netlify
- testJSONFiles() - testuje dostępność plików JSON
- forceLoadData() - wymusza ponowne ładowanie danych
- checkAppInit() - sprawdza inicjalizację aplikacji

Użycie w konsoli przeglądarki (F12):
checkConnectionStatus()
resetOfflineIndicator()
debugUnits()
testFetch()
emergencyRender()
checkAppStatus()
testDataLoading()
checkCMSStatus()
testJSONFiles()
forceLoadData()
checkAppInit()
*/
