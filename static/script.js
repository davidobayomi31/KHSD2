// labels for the panel

const AMENITIES = {
    gas:                '⛽ Gas',
    pump_out:           '🚿 Pump-Out',
    electricity_30amp:  '⚡ Hydro',
    mechanic_on_site:   '🔧 Mechanic',
    marine_store:       '🏪 Marine Store',
    ice_available:      '🧊 Ice',
    launch_ramp:        '🚤 Launch Ramp',
    boat_rentals:       '🛥 Boat Rentals',
    boat_sales:         '🚢 Boat Sales',
    winter_storage:     '❄️ Winter Storage',
    on_site_restaurant: '🍽 Restaurant',
    washrooms:          '🚻 Washrooms',
    showers:            '🚿 Showers',
    wifi:               '📶 WiFi',
    pet_friendly:       '🐾 Pet Friendly',
    bait_and_tackle:    '🎣 Bait & Tackle',
}
// Initialize map
const map = L.map('map', {zoomControl: false}).setView([44.67, -79.38], 11);
L.control.zoom({position: 'bottomright'}).addTo(map);
// add zoom
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

let allMarinas = [];
let allEntries = []; 
let selectedName = null;

function makeIcon(marina, isSelected) {
    const featured = marina.featured === 'true';
    if (featured) {
        return L.divIcon({
            className: '',
            html: `<div class="map-pin-featured ${isSelected ? 'map-pin-selected' : ''}">⭐</div>`,
            iconSize: [36, 36],
            iconAnchor: [18, 18]
        });
    }
    return L.divIcon({
        className: '', 
        html: `<div class="map-pin ${isSelected ? 'map-pin-selected' : ''}"></div>`, 
        iconSize: [22,22], 
        iconAnchor: [11,11]
    });
}

function badge(val) {
    const v = (val || '').trim();
    if (v === 'Yes') return '<span class="badge-yes">✓</span>';
    if (v === 'No')  return '<span class="badge-no">✗</span>';
    return '<span class="badge-na">—</span>';
}

function chip(val, label) {
    const cls = val === 'Yes' ? 'chip chip-yes' : 'chip chip-no';
    return `<span class="${cls}">${label}</span>`;
}
 
//  Build the detail panel for a marina 
function showDetail(marina) {
    const featuredBadge = marina.featured === 'true'
        ? '<span class="detail-featured-badge">⭐ Featured Marina</span><br>' : '';
 
    // Build amenity grid rows
    let amenityHTML = '';
    for (const [col, label] of Object.entries(AMENITIES)) {
        const val = (marina[col] || '').trim();
        amenityHTML += `<div class="amenity-row">${label} ${badge(val)}</div>`;
    }
 
    document.getElementById('detail-content').innerHTML = `
        ${featuredBadge}
        <div class="detail-name">${marina.name}</div>
        <div class="detail-lake">🌊 ${marina.lake}</div>
        <div class="detail-desc">${marina.description}</div>
        <div class="amenity-grid">${amenityHTML}</div>
        <div class="detail-contact">
            <span>📍 ${marina.address}</span>
            <span>📞 ${marina.phone}</span>
            <span>💰 ${marina.price_range || '—'}</span>
        </div>
        <a class="website-btn" href="${marina.website}" target="_blank">🌐 Visit Website</a>
    `;
}
 
// ── Build a sidebar card for a marina 
function buildCard(marina) {
    const div = document.createElement('div');
    div.className = `marina-card ${marina.featured === 'true' ? 'featured-card' : ''}`;
    div.dataset.name = marina.name;
 
    const featuredBadge = marina.featured === 'true'
        ? '<span class="featured-badge">⭐ Featured</span><br>' : '';
 
    // Show 4 key amenity chips
    const quickCols = ['gas', 'pump_out', 'electricity_30amp', 'mechanic_on_site'];
    const chips = quickCols
        .map(col => chip((marina[col] || '').trim(), AMENITIES[col]))
        .join('');
 
    div.innerHTML = `
        ${featuredBadge}
        <div class="card-name">${marina.name}</div>
        <div class="card-lake">🌊 ${marina.lake}</div>
        <div class="card-phone">📞 ${marina.phone}</div>
        <div class="card-chips">${chips}</div>
    `;
 
    // Clicking a card selects the marina
    div.addEventListener('click', () => selectMarina(marina.name));
    return div;
}
 
// ── Select a marina (highlight card, fly map, show detail) ─
function selectMarina(name) {
    selectedName = name;
 
    // Update card highlighting
    document.querySelectorAll('.marina-card').forEach(c => {
        c.classList.toggle('active', c.dataset.name === name);
    });
 
    // Update map pins and fly to selected
    allEntries.forEach(entry => {
        const isSelected = entry.marina.name === name;
        entry.marker.setIcon(makeIcon(entry.marina, isSelected));
        if (isSelected) {
            map.flyTo([entry.marina.lat, entry.marina.lng], 15, { duration: 1 });
            entry.marker.openPopup();
            showDetail(entry.marina);
        }
    });
}
 
// ── Apply the amenity filter 
function applyFilter(filterKey) {
    const list = document.getElementById('marina-list');
    list.innerHTML = '';
    let count = 0;
 
    // Sort: featured first
    const sorted = [...allMarinas].sort((a, b) =>
        (b.featured === 'true') - (a.featured === 'true')
    );
 
    sorted.forEach(marina => {
        const passes = filterKey === 'all' || (marina[filterKey] || '').trim() === 'Yes';
 
        // Show/hide marker
        const entry = allEntries.find(e => e.marina.name === marina.name);
        if (!entry) return;
 
        if (passes) {
            entry.marker.addTo(map);
            list.appendChild(buildCard(marina));
            count++;
        } else {
            map.removeLayer(entry.marker);
        }
    });
 
    // Re-highlight selected card if it's still visible
    if (selectedName) {
        document.querySelectorAll('.marina-card').forEach(c => {
            c.classList.toggle('active', c.dataset.name === selectedName);
        });
    }
 
    document.getElementById('count-label').textContent =
        `${count} marina${count !== 1 ? 's' : ''} found`;
}
 
// ── Fetch data from Flask and set everything up 
fetch('/api/marinas')
    .then(response => response.json())
    .then(data => {
        allMarinas = data;
 
        data.forEach(marina => {
            // Build popup (appears on hover)
            const popupHTML = `
                <div class="popup-name">${marina.name}</div>
                <div class="popup-lake">🌊 ${marina.lake}</div>
                <div class="popup-address">📍 ${marina.address}</div>
                <div class="popup-address">📞 ${marina.phone}</div>
            `;
 
            const marker = L.marker([marina.lat, marina.lng], {
                icon: makeIcon(marina, false)
            });
 
            marker.bindPopup(popupHTML, { maxWidth: 220 });
            marker.on('mouseover', function () { this.openPopup(); });
            marker.on('click', () => selectMarina(marina.name));
            marker.addTo(map);
 
            allEntries.push({ marina, marker });
        });
 
        // show all marinas
        applyFilter('all');
 
        // Auto-select the first featured marina (Blue Beacon)
        const featured = data.find(m => m.featured === 'true');
        if (featured) selectMarina(featured.name);
    })
    .catch(err => {
        document.getElementById('count-label').textContent = 'Error loading data.';
        console.error('Failed to load marina data:', err);
    });
 
//  filter dropdown 
document.getElementById('filter-select').addEventListener('change', function () {
    applyFilter(this.value);
});
 
// ── Search bar logic ──────────────────────────────
const searchInput  = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');

searchInput.addEventListener('input', function () {
    const query = this.value.trim().toLowerCase();

    // Hide dropdown if empty
    if (!query) {
        searchResults.style.display = 'none';
        searchResults.innerHTML = '';
        return;
    }

    // Filter marinas by name or lake
    const matches = allMarinas.filter(m =>
        m.name.toLowerCase().includes(query) ||
        m.lake.toLowerCase().includes(query)
    );

    if (matches.length === 0) {
        searchResults.innerHTML = '<div class="search-result-item">No marinas found</div>';
        searchResults.style.display = 'block';
        return;
    }

    // Build dropdown results
    searchResults.innerHTML = matches.map(m => `
        <div class="search-result-item" onclick="pickResult('${m.name}')">
            <div>${m.name}</div>
            <div class="search-result-lake">🌊 ${m.lake}</div>
        </div>
    `).join('');

    searchResults.style.display = 'block';
});

// When a result is clicked — fly to marina and clear search
function pickResult(name) {
    selectMarina(name);
    searchInput.value = '';
    searchResults.style.display = 'none';
    searchResults.innerHTML = '';
}

// Close dropdown if user clicks anywhere else on the page
document.addEventListener('click', function (e) {
    if (!document.getElementById('search-container').contains(e.target)) {
        searchResults.style.display = 'none';
    }
});