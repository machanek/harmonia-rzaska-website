// App.js - Complete functionality for Harmonia Rząska website

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
        console.log('🚀 Initializing Harmonia Rząska app...');
        
        try {
            await this.loadUnits();
            await this.loadSiteSettings();
            await this.setupPWA();
            console.log('📊 Units and settings loaded, setting up components...');
            
            this.setupEventListeners();
            this.setupMobileMenu();
            this.setupHeroSlider();
            this.setupGallery();
            this.setupStickyHeader();
            this.setupCookieBanner();
            this.setupContactForm();
            this.setupOfflineIndicator();
            
            console.log('🎨 Components setup complete, rendering...');
            this.renderUnits();
            this.updateFloorFilter();
            
            // Show success message with units count
            this.showToast(`Załadowano ${this.units.length} lokali`, 'success');
            console.log('✅ App initialization complete. Units:', this.units.length);
        } catch (error) {
            console.error('❌ Error during initialization:', error);
            this.showToast('Błąd podczas ładowania danych', 'error');
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
        // Lista plików jednostek w folderze data/units/
        const unitFiles = [
            '1-a-1.json',
            '2-a-2.json', 
            '3-a-3.json',
            '4-b-1.json',
            '5-b-2.json'
        ];
        
        console.log('🔍 Próba ładowania plików z folderu data/units/');
        
        for (const filename of unitFiles) {
            try {
                console.log(`📁 Ładowanie: ${filename}`);
                const timestamp = Date.now();
                const response = await fetch(`data/units/${filename}?t=${timestamp}`);
                console.log(`📊 Status dla ${filename}:`, response.status, response.statusText);
                
                if (response.ok) {
                    const unit = await response.json();
                    units.push(unit);
                    console.log(`✅ Załadowano: ${filename}`, unit);
                } else {
                    console.error(`❌ Błąd dla ${filename}:`, response.status, response.statusText);
                }
            } catch (error) {
                console.error(`💥 Wyjątek dla ${filename}:`, error);
                // Ignoruj błędy dla nieistniejących plików
                continue;
            }
        }
        
        console.log(`📋 Łącznie załadowano: ${units.length} jednostek`);
        return units.sort((a, b) => a.id - b.id);
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
        
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
        
        // Close menu when clicking on links
        nav.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                nav.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!nav.contains(e.target) && !menuToggle.contains(e.target)) {
                nav.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        });
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
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!this.validateContactForm()) {
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
                let recaptchaToken = '';
                if (typeof grecaptcha !== 'undefined') {
                    try {
                        recaptchaToken = await grecaptcha.execute('6Lc1sK8rAAAAAFvcqHK72bEpkcT7xUtbowTMD4f7', {action: 'contact_form'});
                    } catch (recaptchaError) {
                        console.warn('reCAPTCHA error:', recaptchaError);
                    }
                }
                
                // Prepare form data
                const formData = new FormData(form);
                
                // Add reCAPTCHA response
                if (recaptchaToken) {
                    formData.append('g-recaptcha-response', recaptchaToken);
                }
                
                // Submit to Netlify Function
                try {
                    const response = await fetch('/.netlify/functions/contact-form', {
                        method: 'POST',
                        body: formData
                    });
                    
                    const result = await response.json();
                    
                    if (response.ok) {
                        this.showToast('Wiadomość została wysłana pomyślnie! Skontaktujemy się z Tobą wkrótce.', 'success');
                        form.reset();
                    } else {
                        throw new Error(result.error || 'Błąd serwera');
                    }
                } catch (fetchError) {
                    // Jeśli nie ma połączenia, zapisz offline
                    if (!navigator.onLine) {
                        await this.handleOfflineForm(formData);
                        form.reset();
                    } else {
                        throw fetchError;
                    }
                }
                
            } catch (error) {
                console.error('Contact form error:', error);
                this.showToast('Wystąpił błąd podczas wysyłania wiadomości. Spróbuj ponownie lub skontaktuj się telefonicznie.', 'error');
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
        
        const updateOnlineStatus = () => {
            if (navigator.onLine) {
                offlineIndicator.classList.remove('show');
            } else {
                offlineIndicator.classList.add('show');
            }
        };
        
        // Initial check
        updateOnlineStatus();
        
        // Listen for online/offline events
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
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
