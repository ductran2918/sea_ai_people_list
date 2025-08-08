// mobile-friendly-app.js - Sanitizer-safe version

// Data and state
let peopleData = [];
let filteredData = [];
let countryChoice = null;
let classChoice = null;
let searchInput = null;

// Debounce helper
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Flag assets mapping by country name
const FLAG_ASSETS = {
    Vietnam: 'assets/flags/vn_flag.svg',
    Singapore: 'assets/flags/sg_flag.svg',
    Thailand: 'assets/flags/th_flag.svg',
    Malaysia: 'assets/flags/my_flag.svg',
    Indonesia: 'assets/flags/id_flag.svg',
    Philippines: 'assets/flags/ph_flag.svg'
};

function getFlagFor(country) {
    return FLAG_ASSETS[country] ?? null;
}

// Load external CSS dynamically (sanitizer-safe)
function loadChoicesCSS() {
    return new Promise((resolve, reject) => {
        fetch('https://cdn.jsdelivr.net/npm/choices.js/public/assets/styles/choices.min.css')
            .then(response => response.text())
            .then(css => {
                const styleElement = document.createElement('style');
                styleElement.textContent = css;
                document.head.appendChild(styleElement);
                resolve();
            })
            .catch(reject);
    });
}

// Load Google Font dynamically
function loadGoogleFont() {
    const fontCSS = `
        @import url('https://fonts.googleapis.com/css2?family=Lato:wght@300;400;500;600;700&display=swap');
    `;
    const styleElement = document.createElement('style');
    styleElement.textContent = fontCSS;
    document.head.appendChild(styleElement);
}

// Main CSS styles injection - sanitizer safe
function injectStyles() {
    const cssText = `
        :root {
            --main-font: 'Lato', sans-serif;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: var(--main-font), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: transparent;
            color: #333;
            line-height: 1.5;
        }
        
        .loading {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 200px;
            font-size: 18px;
            color: #666;
        }
        
        .hidden {
            display: none !important;
        }

        .app-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        .filters-section {
            background: transparent !important;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }

        .filter-box {
            background: transparent !important;
        }

        .filter-group {
            margin-bottom: 16px;
        }

        .filter-label {
            display: none;
            margin-bottom: 8px;
            font-weight: 600;
            color: #333;
            font-size: 14px;
        }

        .search-input {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e1e5e9;
            border-radius: 6px;
            font-family: var(--main-font), sans-serif;
            font-size: 16px;
            transition: border-color 0.2s;
            background: transparent !important;
        }

        input[type="search"] {
            background: transparent !important;
        }

        .search-input:focus {
            outline: none;
            border-color: #007bff;
        }

        .people-grid {
            display: grid;
            gap: 16px;
            grid-template-columns: 1fr;
        }

        @media (min-width: 768px) {
            .people-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        @media (min-width: 1024px) {
            .people-grid {
                grid-template-columns: repeat(3, 1fr);
            }
        }

        .person-card {
            background: transparent !important;
            border-radius: 12px;
            padding: 20px;
            box-shadow: none;
            transition: transform 0.2s;
            border: none;
        }

        .person-card:hover {
            transform: translateY(-2px);
        }

        .card-header {
            display: flex;
            align-items: flex-start;
            gap: 16px;
            margin-bottom: 16px;
        }

        .person-image {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid #f0f0f0;
            flex-shrink: 0;
        }

        .person-info {
            flex: 1;
            min-width: 0;
        }

        .person-name {
            font-size: 18px;
            font-weight: 600;
            color: #333;
            margin-bottom: 4px;
            line-height: 1.3;
        }

        .person-role {
            font-size: 14px;
            color: #666;
            margin-bottom: 2px;
        }

        .person-company {
            font-size: 14px;
            color: #007bff;
            text-decoration: none;
            font-weight: 500;
        }

        .person-company:hover {
            text-decoration: underline;
        }

        .card-meta {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
        }

        .country-flag {
            width: 20px;
            height: 15px;
            object-fit: cover;
            border-radius: 2px;
        }

        .person-class {
            background: #e8f4fd;
            color: #0366d6;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
        }

        .short-description {
            color: #555;
            line-height: 1.5;
            margin-bottom: 16px;
            font-size: 14px;
        }

        .long-description {
            color: #555;
            line-height: 1.6;
            margin: 16px 0;
            padding: 16px;
            background: #f8f9fa;
            border-radius: 6px;
            font-size: 14px;
            border-left: 3px solid #007bff;
        }

        .card-actions {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
        }

        .expand-btn {
            background: #007bff;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-family: var(--main-font), sans-serif;
            font-size: 14px;
            font-weight: 500;
            transition: background-color 0.2s;
            flex: 1;
        }

        .expand-btn:hover {
            background: #0056b3;
        }

        .linkedin-link {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            background: #0077b5;
            border-radius: 6px;
            transition: background-color 0.2s;
        }

        .linkedin-link:hover {
            background: #005885;
        }

        .linkedin-icon {
            width: 18px;
            height: 18px;
            fill: white;
        }

        .lnk-btn[aria-disabled="true"] {
            pointer-events: none;
            opacity: 0.4;
        }

        .map-footer {
            margin-top: 40px;
            padding: 20px;
            background: transparent;
            border-radius: 8px;
        }

        .source-attribution {
            text-align: center;
            color: #666;
            font-size: 14px;
        }

        .source-attribution a {
            color: #007bff;
            text-decoration: none;
        }

        .source-attribution a:hover {
            text-decoration: underline;
        }

        .choices {
            margin-bottom: 0;
        }

        .choices__inner {
            background: transparent !important;
            border: 2px solid #e1e5e9;
            border-radius: 6px;
            min-height: 44px;
            padding: 6px 12px;
            font-family: var(--main-font), sans-serif;
            font-size: 16px;
        }

        .choices__list--dropdown {
            background: transparent !important;
        }

        .choices__list--dropdown,
        .choices__list[role='listbox'] {
            background: #ffffff !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
            z-index: 9999 !important;
        }

        .choices__inner:focus {
            border-color: #007bff;
        }

        .choices__item--choice {
            font-family: var(--main-font), sans-serif;
        }

        .no-results-state {
            text-align: center;
            padding: 60px 20px;
            color: #666;
        }

        .no-results-state h3 {
            margin-bottom: 16px;
            color: #333;
        }

        .clear-filters-btn {
            background: #007bff;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-family: var(--main-font), sans-serif;
            font-size: 16px;
            font-weight: 500;
            transition: background-color 0.2s;
        }

        .clear-filters-btn:hover {
            background: #0056b3;
        }

        /* Mobile optimizations */
        @media (max-width: 767px) {
            .app-container {
                padding: 10px;
            }
            
            .person-card {
                padding: 15px;
            }
            
            .card-header {
                gap: 12px;
            }
            
            .person-image {
                width: 50px;
                height: 50px;
            }
            
            .person-name {
                font-size: 16px;
            }
        }
    `;

    const styleTag = document.createElement('style');
    styleTag.textContent = cssText;
    document.head.appendChild(styleTag);
}

// Parse CSV data
async function parseCsv(url) {
    try {
        const response = await fetch(url);
        const csvText = await response.text();
        
        return new Promise((resolve, reject) => {
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    if (results.errors.length > 0) {
                        console.warn('CSV parsing warnings:', results.errors);
                    }
                    resolve(results.data);
                },
                error: (error) => {
                    reject(error);
                }
            });
        });
    } catch (error) {
        throw new Error(`Failed to load CSV data: ${error.message}`);
    }
}

// Create filter dropdowns
function renderFilters(data) {
    const filtersContainer = document.getElementById('filters-container');
    
    // Extract unique values
    const countries = [...new Set(data.map(person => person.country).filter(Boolean))].sort();
    const classes = [...new Set(data.map(person => person.class).filter(Boolean))].sort();
    
    filtersContainer.innerHTML = `
        <div class="app-container">
            <div class="filters-section">
                <div class="filter-group">
                    <label class="filter-label" for="country-filter">Filter by Country</label>
                    <select id="country-filter" multiple></select>
                </div>
                
                <div class="filter-group">
                    <label class="filter-label" for="class-filter">Filter by Type</label>
                    <select id="class-filter" multiple></select>
                </div>
                
                <div class="filter-group">
                    <label class="filter-label" for="search-input">Search</label>
                    <input 
                        type="search" 
                        id="search-input" 
                        class="search-input" 
                        placeholder="Search by name, company, role, or description..."
                        aria-label="Search people"
                    />
                </div>
            </div>
        </div>
    `;

    // Initialize Choices.js dropdowns
    const countrySelect = document.getElementById('country-filter');
    const classSelect = document.getElementById('class-filter');
    searchInput = document.getElementById('search-input');

    // Populate options
    countries.forEach(country => {
        const option = new Option(country, country);
        countrySelect.appendChild(option);
    });

    classes.forEach(cls => {
        const option = new Option(cls, cls);
        classSelect.appendChild(option);
    });

    // Initialize Choices.js
    countryChoice = new Choices(countrySelect, {
        removeItemButton: true,
        placeholder: true,
        placeholderValue: 'Select countries...',
        searchPlaceholderValue: 'Search countries...'
    });

    classChoice = new Choices(classSelect, {
        removeItemButton: true,
        placeholder: true,
        placeholderValue: 'Select types...',
        searchPlaceholderValue: 'Search types...'
    });

    // Event listeners
    countrySelect.addEventListener('change', applyFilters);
    classSelect.addEventListener('change', applyFilters);
    searchInput.addEventListener('input', debounce(applyFilters, 300));

    // Clear filters button
    const clearBtn = document.getElementById('clear-filters-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearAllFilters);
    }
}

// Apply all active filters
function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedCountries = countryChoice.getValue(true);
    const selectedClasses = classChoice.getValue(true);

    filteredData = peopleData.filter(person => {
        // Country filter
        if (selectedCountries.length > 0 && !selectedCountries.includes(person.country)) {
            return false;
        }

        // Class filter
        if (selectedClasses.length > 0 && !selectedClasses.includes(person.class)) {
            return false;
        }

        // Search filter
        if (searchTerm) {
            const searchFields = [
                person.class,
                person.name_plain,
                person.company_plain,
                person.role,
                person.country,
                person.short_description
            ].map(field => (field || '').toLowerCase());

            if (!searchFields.some(field => field.includes(searchTerm))) {
                return false;
            }
        }

        return true;
    });

    renderList(filteredData);
}

// Render the people list
function renderList(data) {
    const container = document.getElementById('people-container');
    const noResults = document.getElementById('no-results');
    
    if (data.length === 0) {
        container.innerHTML = '';
        noResults.classList.remove('hidden');
        return;
    }

    noResults.classList.add('hidden');
    
    const html = `
        <div class="app-container">
            <div class="people-grid">
                ${data.map((person, index) => createPersonCard(person, index)).join('')}
            </div>
        </div>
    `;
    
    container.innerHTML = html;

    // Add event listeners for expand/collapse buttons
    container.querySelectorAll('.expand-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            toggleCard(index);
        });
    });
}

// Create individual person card HTML
function createPersonCard(person, index) {
    const flagSrc = getFlagFor(person.country);
    const imageSrc = person.image || 'assets/placeholder_person.svg';
    const companyLink = person.company_link ? 
        `<a href="${person.company_link}" target="_blank" rel="noopener" class="person-company">${person.company_plain || 'Unknown Company'}</a>` :
        `<span class="person-company">${person.company_plain || 'Unknown Company'}</span>`;

    const isExpanded = document.querySelector(`[data-card-index="${index}"]`)?.dataset.expanded === 'true';

    return `
        <div class="person-card" data-card-index="${index}" data-expanded="${isExpanded}">
            <div class="card-header">
                <img 
                    src="${imageSrc}" 
                    alt="${person.name_plain || 'Person'}" 
                    class="person-image"
                    loading="lazy"
                    onerror="handleImgError(this)"
                />
                <div class="person-info">
                    <h3 class="person-name">${person.name_plain || 'Unknown Name'}</h3>
                    <div class="person-role">${person.role || 'Unknown Role'}</div>
                    ${companyLink}
                </div>
            </div>
            
            <div class="card-meta">
                ${flagSrc ? `<img src="${flagSrc}" alt="${person.country} flag" class="country-flag" onerror="this.style.display='none'" />` : ''}
                <span class="person-class">${person.class || 'Unknown'}</span>
            </div>
            
            <div class="short-description">
                ${person.short_description || 'No description available.'}
            </div>
            
            ${isExpanded && person.long_description ? `
                <div class="long-description">
                    ${person.long_description}
                </div>
            ` : ''}
            
            <div class="card-actions">
                <button 
                    class="expand-btn" 
                    data-index="${index}"
                    aria-label="${isExpanded ? 'Collapse' : 'Expand'} ${person.name_plain}'s details"
                >
                    ${isExpanded ? 'Collapse' : 'Expand'}
                </button>
                
                <a 
                    class="lnk-btn linkedin-link"
                    href="${person.linkedin_url || '#'}"
                    target="${person.linkedin_url ? '_blank' : ''}"
                    rel="${person.linkedin_url ? 'noopener' : ''}"
                    aria-disabled="${!person.linkedin_url}"
                    aria-label="View ${person.name_plain}'s LinkedIn profile"
                >
                    <svg class="linkedin-icon" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                </a>
            </div>
        </div>
    `;
}

// Toggle card expansion
function toggleCard(index) {
    const card = document.querySelector(`[data-card-index="${index}"]`);
    if (!card) return;

    const isExpanded = card.dataset.expanded === 'true';
    card.dataset.expanded = (!isExpanded).toString();

    // Re-render just this card
    const person = filteredData[index];
    if (person) {
        const newCardHtml = createPersonCard(person, index);
        card.outerHTML = newCardHtml;
        
        // Re-attach event listener
        const newCard = document.querySelector(`[data-card-index="${index}"]`);
        const expandBtn = newCard.querySelector('.expand-btn');
        expandBtn.addEventListener('click', (e) => {
            const idx = parseInt(e.target.dataset.index);
            toggleCard(idx);
        });
    }
}

// Handle image loading errors
window.handleImgError = function(img) {
    img.src = 'assets/placeholder_person.svg';
    img.onerror = null; // Prevent infinite error loop
};

// Clear all filters
function clearAllFilters() {
    countryChoice.removeActiveItems();
    classChoice.removeActiveItems();
    searchInput.value = '';
    applyFilters();
}

// Initialize the application
async function init() {
    try {
        // Load Google Font
        loadGoogleFont();
        
        // Load Choices.js CSS
        await loadChoicesCSS();
        
        // Inject our styles
        injectStyles();

        // Load data
        const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTRiNh4w92XdVXeRlBtrlSk9LcgFhLMNz97Ry0h34gfElPeZ4ZH-Kx_7CkjnYJfDmADti7sKO7cLExX/pub?gid=928970532&single=true&output=csv';
        peopleData = await parseCsv(csvUrl);
        filteredData = [...peopleData];

        // Setup UI
        renderFilters(peopleData);
        renderList(filteredData);

        // Show app, hide loading
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');

    } catch (error) {
        console.error('Failed to initialize app:', error);
        document.getElementById('loading').innerHTML = `
            <div style="text-align: center; color: #d32f2f;">
                <h3>Failed to load data</h3>
                <p style="margin-top: 8px; color: #666;">${error.message}</p>
                <button onclick="location.reload()" style="margin-top: 16px; padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Retry
                </button>
            </div>
        `;
    }
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
