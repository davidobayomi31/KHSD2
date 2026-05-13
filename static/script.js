// ── Amenity labels ────────────────────────────────
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
};

// ── Initialise map ────────────────────────────────
const map = L.map('map', { zoomControl: false }).setView([44.67, -79.38], 11);
L.control.zoom({ position: 'bottomright' }).addTo(map);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// ── State ─────────────────────────────────────────
let allMarinas = [];
let allEntries = [];
let selectedName = null;
let routeLayer = null;

// ── Icons ─────────────────────────────────────────
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
        iconSize: [22, 22],
        iconAnchor: [11, 11]
    });
}

// ── Badge and chip helpers ────────────────────────
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

// ── Detail panel ──────────────────────────────────
function showDetail(marina) {
    const featuredBadge = marina.featured === 'true'
        ? '<span class="detail-featured-badge">⭐ Featured Marina</span><br>' : '';

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

// ── Sidebar card ──────────────────────────────────
function buildCard(marina) {
    const div = document.createElement('div');
    div.className = `marina-card ${marina.featured === 'true' ? 'featured-card' : ''}`;
    div.dataset.name = marina.name;

    const featuredBadge = marina.featured === 'true'
        ? '<span class="featured-badge">⭐ Featured</span><br>' : '';

    const quickCols = ['gas', 'pump_out', 'electricity_30amp', 'mechanic_on_site'];
    const chips = quickCols
        .map(col => chip((marina[col] || '').trim(), AMENITIES[col]))
        .join('');

    const safeName = marina.name.replace(/'/g, "\\'");

    div.innerHTML = `
        ${featuredBadge}
        <div class="card-name">${marina.name}</div>
        <div class="card-lake">🌊 ${marina.lake}</div>
        <div class="card-address">📍 ${marina.address}</div>
        <div class="card-phone">📞 ${marina.phone}</div>
        <div class="card-chips">${chips}</div>
        <button class="card-directions-btn" onclick="event.stopPropagation(); promptMode(${marina.lat}, ${marina.lng}, '${safeName}')">
            🧭 Get Directions
        </button>
    `;

    div.addEventListener('click', () => selectMarina(marina.name));
    return div;
}

// ── Select a marina ───────────────────────────────
function selectMarina(name) {
    selectedName = name;

    document.querySelectorAll('.marina-card').forEach(c => {
        c.classList.toggle('active', c.dataset.name === name);
    });

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

// ── Filter logic ──────────────────────────────────
function applyFilter(filterKey) {
    const list = document.getElementById('marina-list');
    list.innerHTML = '';
    let count = 0;

    const sorted = [...allMarinas].sort((a, b) =>
        (b.featured === 'true') - (a.featured === 'true')
    );

    sorted.forEach(marina => {
        const passes = filterKey === 'all' || (marina[filterKey] || '').trim() === 'Yes';
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

    if (selectedName) {
        document.querySelectorAll('.marina-card').forEach(c => {
            c.classList.toggle('active', c.dataset.name === selectedName);
        });
    }

    document.getElementById('count-label').textContent =
        `${count} marina${count !== 1 ? 's' : ''} found`;
}

// ── Fetch data from Flask ─────────────────────────
fetch('/api/marinas')
    .then(response => response.json())
    .then(data => {
        allMarinas = data;

        data.forEach(marina => {
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

        applyFilter('all');

        const featured = data.find(m => m.featured === 'true');
        if (featured) selectMarina(featured.name);
    })
    .catch(err => {
        document.getElementById('count-label').textContent = 'Error loading data.';
        console.error('Failed to load marina data:', err);
    });

// ── Filter dropdown ───────────────────────────────
document.getElementById('filter-select').addEventListener('change', function () {
    applyFilter(this.value);
});

// ── Mode selection modal ──────────────────────────
function promptMode(lat, lng, name) {
    const existing = document.getElementById('mode-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'mode-modal';
    const safeName = name.replace(/'/g, "\\'");
    modal.innerHTML = `
        <div id="mode-modal-box">
            <p id="mode-modal-title">How are you getting there?</p>
            <p id="mode-modal-sub">🧭 Directions to ${name}</p>
            <div id="mode-modal-buttons">
                <button class="mode-btn" onclick="getDirections(${lat}, ${lng}, '${safeName}', 'driving')">
                    🚗 Driving
                </button>
                <button class="mode-btn" onclick="getDirections(${lat}, ${lng}, '${safeName}', 'walking')">
                    🚶 Walking
                </button>
            </div>
            <button id="mode-cancel" onclick="document.getElementById('mode-modal').remove()">Cancel</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// ── Routing ───────────────────────────────────────
function getDirections(destLat, destLng, marinaName, mode) {
    const modal = document.getElementById('mode-modal');
    if (modal) modal.remove();

    const profile = mode === 'walking' ? 'foot' : 'driving';

    if (!navigator.geolocation) {
        alert('Your browser does not support location access.');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        function (position) {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;

            const url = `https://router.project-osrm.org/route/v1/${profile}/${userLng},${userLat};${destLng},${destLat}?overview=full&geometries=geojson&steps=true`;

            fetch(url)
                .then(r => r.json())
                .then(data => {
                    if (!data.routes || data.routes.length === 0) {
                        alert('Could not find a route.');
                        return;
                    }

                    const route = data.routes[0];
                    const distanceKm = (route.distance / 1000).toFixed(1);
                    const durationMin = Math.round(route.duration / 60);
                    const hours = Math.floor(durationMin / 60);
                    const mins = durationMin % 60;
                    const timeStr = hours > 0 ? `${hours}h ${mins}min` : `${mins} min`;

                    if (routeLayer) map.removeLayer(routeLayer);
                    routeLayer = L.geoJSON(route.geometry, {
                        style: { color: '#1a56a0', weight: 5, opacity: 0.85 }
                    }).addTo(map);

                    map.fitBounds(routeLayer.getBounds(), { padding: [60, 60] });

                    const existing = document.getElementById('route-panel');
                    if (existing) existing.remove();

                    const steps = route.legs[0].steps;
                    const stepHTML = steps.map(s => `
                        <div class="route-step">
                            <span class="route-step-icon">${getManeuverIcon(s.maneuver.type)}</span>
                            <span>${s.name ? s.name : s.maneuver.type}</span>
                            <span class="route-step-dist">${(s.distance).toFixed(0)}m</span>
                        </div>
                    `).join('');

                    const panel = document.createElement('div');
                    panel.id = 'route-panel';
                    panel.innerHTML = `
                        <div id="route-panel-header">
                            <div id="route-summary">
                                <span>${mode === 'walking' ? '🚶' : '🚗'} ${timeStr}</span>
                                <span>📏 ${distanceKm} km</span>
                                <span>📍 ${marinaName}</span>
                            </div>
                            <button id="route-close" onclick="closeRoute()">✕ Close</button>
                        </div>
                        <div id="route-steps">${stepHTML}</div>
                    `;
                    document.body.appendChild(panel);
                })
                .catch(() => alert('Routing service unavailable. Try again.'));
        },
        function () {
            alert('Location access denied. Please allow location in your browser settings.');
        }
    );
}

// ── Maneuver icons ────────────────────────────────
function getManeuverIcon(type) {
    const icons = {
        'turn': '↩️', 'new name': '⬆️', 'depart': '🟢',
        'arrive': '🏁', 'merge': '↗️', 'on ramp': '↗️',
        'off ramp': '↘️', 'fork': '⬆️', 'end of road': '⬆️',
        'roundabout': '🔄', 'rotary': '🔄', 'roundabout turn': '🔄',
        'continue': '⬆️', 'notification': '⬆️'
    };
    return icons[type] || '⬆️';
}

// ── Close route ───────────────────────────────────
function closeRoute() {
    if (routeLayer) map.removeLayer(routeLayer);
    routeLayer = null;
    const panel = document.getElementById('route-panel');
    if (panel) panel.remove();
}

// ── Search bar ────────────────────────────────────
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');

searchInput.addEventListener('input', function () {
    const query = this.value.trim().toLowerCase();

    if (!query) {
        searchResults.style.display = 'none';
        searchResults.innerHTML = '';
        return;
    }

    const matches = allMarinas.filter(m =>
        m.name.toLowerCase().includes(query) ||
        m.lake.toLowerCase().includes(query)
    );

    if (matches.length === 0) {
        searchResults.innerHTML = '<div class="search-result-item">No marinas found</div>';
        searchResults.style.display = 'block';
        return;
    }

    searchResults.innerHTML = matches.map(m => `
        <div class="search-result-item" onclick="pickResult('${m.name.replace(/'/g, "\\'")}')">
            <div>${m.name}</div>
            <div class="search-result-lake">🌊 ${m.lake}</div>
        </div>
    `).join('');

    searchResults.style.display = 'block';
});

function pickResult(name) {
    selectMarina(name);
    searchInput.value = '';
    searchResults.style.display = 'none';
    searchResults.innerHTML = '';
}

document.addEventListener('click', function (e) {
    if (!document.getElementById('search-container').contains(e.target)) {
        searchResults.style.display = 'none';
    }
});