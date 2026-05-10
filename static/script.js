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
const map = l.map('map', {zoomControl: false}).setView([44.67, -79.38], 11);
L.control.zoom({position: 'buttomright' }).addTO(map);
// add zoom
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

