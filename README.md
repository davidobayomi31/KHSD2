# Simcoe Marina Finder

A full-stack web application that helps boaters in the Simcoe County and Orillia region find marinas, compare amenities, and plan their trips.

## Live Demo
Coming soon 

## What It Does

- Displays all major marinas in the Simcoe County / Orillia area on an interactive map
- Filter marinas by amenity (gas, pump-out, mechanic, boat rentals, launch ramp, etc.)
- Click any marina card or map pin to see full details in the side panel
- Blue Beacon Marina featured as a highlighted location
- Hover over map pins for quick popup info

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Backend | Python / Flask | Serves the app and marina data API |
| Data | CSV | Stores verified marina information |
| Frontend | HTML | Page structure and layout |
| Styling | CSS | Visual design and responsive layout |
| Interactivity | JavaScript | Map logic, filters, and UI behaviour |
| Map | Leaflet.js + OpenStreetMap | Interactive map rendering |


```

## How to Run Locally

**1. Clone the repository**
```bash
git clone https://github.com/yourusername/marina-finder.git
cd marina-finder
```

**2. Create and activate a virtual environment**
```bash
python3 -m venv venv
source venv/bin/activate
```

**3. Install dependencies**
```bash
pip install -r requirements.txt
```

**4. Run the app**
```bash
python3 app.py
```

**5. Open in your browser**
```
http://127.0.0.1:5000
```

## Marina Data

The dataset covers 9 verified marinas across:
- Lake Couchiching (Orillia, Rama, Washago)
- Lake Simcoe (Ramara)
- Sparrow Lake / Trent-Severn Waterway

Each marina entry includes: gas availability, pump-out, hydro/electricity, mechanic on site, marine store, launch ramp, boat rentals, boat sales, winter storage, restaurant, washrooms, showers, WiFi, pet friendly, bait and tackle, price range, address, phone, and website.

Data was researched and verified from each marina's official website.


## About
Built by David Obayomi. 
