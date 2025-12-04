import { readFileSync, writeFileSync } from 'fs';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper function to get dates
function getDate30DaysAgo() {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('.')[0] + '.000+01:00';
}

function getTodayDate() {
    const date = new Date();
    return date.toISOString().split('.')[0] + '.000+01:00';
}

// Check if location has wind data
async function checkWindData(location) {
    try {
        const response = await fetch(
            'https://waterwebservices.rijkswaterstaat.nl/ONLINEWAARNEMINGENSERVICES_DBO/CheckWaarnemingenAanwezig',
            {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "AquoMetadataLijst": [{
                        "Grootheid": {
                            "Code": "WINDSHD"
                        }
                    }],
                    "LocatieLijst": [{
                        "X": location.X,
                        "Y": location.Y,
                        "Code": location.Code
                    }],
                    "Periode": {
                        "Begindatumtijd": getDate30DaysAgo(),
                        "Einddatumtijd": getTodayDate()
                    }
                })
            }
        );

        const data = await response.json();
        return data.Succesvol && data.WaarnemingenAanwezig.toLowerCase() === "true";
    } catch (error) {
        console.error('Error checking wind data for', location.Code, error.message);
        return false;
    }
}

// Load existing locations
function loadExistingLocations() {
    const locationsPath = join(__dirname, '../../../..', 'locations.json');
    const data = JSON.parse(readFileSync(locationsPath, 'utf-8'));
    const existingLocations = new Map();

    Object.values(data).forEach(location => {
        if (location.measurements && location.measurements.source === 'RWS') {
            const code = location.measurements.API_ID;
            const coords = location.measurements.API_Coordinates;
            if (code && coords && coords.length === 2) {
                existingLocations.set(code, {
                    X: coords[0],
                    Y: coords[1]
                });
            }
        }
    });

    console.log(`✓ Loaded ${existingLocations.size} existing RWS locations from locations.json`);
    return existingLocations;
}

// Check if location exists
function isExistingLocation(location, existingLocations) {
    const existing = existingLocations.get(location.Code);
    if (!existing) return false;
    return existing.X === location.X && existing.Y === location.Y;
}

// Fetch locations from RWS API
async function fetchLocations() {
    console.log('📡 Fetching locations from RWS API...');
    
    try {
        const response = await fetch(
            'https://waterwebservices.rijkswaterstaat.nl/METADATASERVICES_DBO/OphalenCatalogus/',
            {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "CatalogusFilter": { 
                        "Grootheden": true,
                        "Parameters": false,
                        "Compartimenten": false,
                        "Hoedanigheden": false,
                        "Eenheden": false,
                        "BemonsteringsApparaten": false,
                        "BemonsteringsMethoden": false,
                        "BemonsteringsSoorten": false,
                        "BioTaxon": false,
                        "BioTaxon_Compartimenten": false,
                        "MeetApparaten": false,
                        "MonsterBewerkingsMethoden": false,
                        "Organen": false,
                        "PlaatsBepalingsApparaten": false,
                        "Typeringen": false,
                        "WaardeBepalingstechnieken": false,
                        "WaardeBepalingsmethoden": false,
                        "WaardeBewerkingsmethoden": false
                    }
                })
            }
        );

        const data = await response.json();
        console.log('✓ Successfully fetched catalog data\n');
        return data;
    } catch (error) {
        console.error('❌ Error fetching locations:', error.message);
        throw error;
    }
}

// Main function
async function generateMap() {
    console.log('🚀 Starting RWS Wind Data Locations Map Generator\n');

    // Fetch all locations from API
    const responseData = await fetchLocations();
    const allLocations = responseData.LocatieLijst;
    console.log(`📍 Total locations to check: ${allLocations.length}\n`);

    // Load existing locations
    const existingLocations = loadExistingLocations();

    // Check wind data for all locations
    const locationsWithWind = [];
    const batchSize = 10;
    const delayBetweenBatches = 500;

    for (let i = 0; i < allLocations.length; i += batchSize) {
        const batch = allLocations.slice(i, Math.min(i + batchSize, allLocations.length));
        
        const results = await Promise.all(batch.map(async (location) => {
            const hasWind = await checkWindData(location);
            const isExisting = isExistingLocation(location, existingLocations);
            
            if (hasWind) {
                return { location, isExisting };
            }
            return null;
        }));

        results.forEach(result => {
            if (result) {
                locationsWithWind.push(result);
                const status = result.isExisting ? '🟠 existing' : '🟢 new';
                console.log(`  ${status} ${result.location.Code} - ${result.location.Naam}`);
            }
        });

        console.log(`Progress: ${Math.min(i + batchSize, allLocations.length)}/${allLocations.length}`);
        
        if (i + batchSize < allLocations.length) {
            await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
        }
    }

    console.log(`\n✓ Found ${locationsWithWind.length} locations with wind data\n`);

    // Generate HTML
    const html = generateHTML(locationsWithWind);
    writeFileSync(join(__dirname, 'map-static.html'), html, 'utf-8');

    console.log('✅ Generated map-static.html');
    console.log('📂 You can now open map-static.html in any browser\n');
}

function generateHTML(locationsWithWind) {
    const locationsJSON = JSON.stringify(locationsWithWind);
    
    return `<!DOCTYPE html>
<html>
<head>
    <title>RWS Wind Data Locations Map</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/proj4@2.9.2/dist/proj4.js"></script>
    
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
        }
        #map {
            position: absolute;
            top: 0;
            bottom: 0;
            width: 100%;
        }
        .info-panel {
            position: absolute;
            top: 10px;
            right: 10px;
            background: white;
            padding: 15px;
            border-radius: 5px;
            box-shadow: 0 0 15px rgba(0,0,0,0.2);
            z-index: 1000;
            max-width: 300px;
        }
        .info-panel h3 {
            margin: 0 0 10px 0;
            font-size: 16px;
        }
        .info-panel p {
            margin: 5px 0;
            font-size: 14px;
        }
        .leaflet-popup-content {
            font-size: 13px;
        }
        .leaflet-popup-content strong {
            display: inline-block;
            width: 120px;
        }
        .copy-btn {
            display: inline-block;
            margin-left: 5px;
            padding: 2px 6px;
            background: #2196F3;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-size: 11px;
            vertical-align: middle;
        }
        .copy-btn:hover {
            background: #1976D2;
        }
        .copy-btn:active {
            background: #0D47A1;
        }
        .coord-line {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        .coord-value {
            font-family: monospace;
            background: #f5f5f5;
            padding: 2px 5px;
            border-radius: 3px;
        }
    </style>
</head>
<body>
    <div id="map"></div>
    <div class="info-panel">
        <h3>RWS Wind Data Locations</h3>
        <p><strong>Total locations:</strong> <span id="location-count">0</span></p>
        <p style="font-size: 12px; margin-top: 10px;">Wind data available in last 30 days</p>
        <hr style="margin: 10px 0; border: none; border-top: 1px solid #ddd;">
        <p style="font-size: 12px; margin: 5px 0;"><span style="color: #4caf50;">●</span> New location</p>
        <p style="font-size: 12px; margin: 5px 0;"><span style="color: #ff9800;">●</span> Already in locations.json</p>
    </div>

    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    
    <script>
        // Embedded location data
        const locationsWithWind = ${locationsJSON};
        
        // Define projections
        proj4.defs("EPSG:25831", "+proj=utm +zone=31 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
        
        // Initialize map
        const map = L.map('map').setView([52.1326, 5.2913], 7);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(map);
        
        function convertToLatLon(x, y) {
            const converted = proj4("EPSG:25831", "EPSG:4326", [x, y]);
            return [converted[1], converted[0]];
        }
        
        function formatRDCoords(x, y) {
            return \`X: \${x}m, Y: \${y}m\`;
        }
        
        // Add markers
        const markers = L.layerGroup().addTo(map);
        
        locationsWithWind.forEach(({ location, isExisting }) => {
            const latLon = convertToLatLon(location.X, location.Y);
            
            const marker = L.circleMarker(latLon, {
                radius: 6,
                fillColor: isExisting ? "#ff9800" : "#4caf50",
                color: isExisting ? "#f57c00" : "#2e7d32",
                weight: 2,
                opacity: 1,
                fillOpacity: 0.7
            });
            
            const statusColor = isExisting ? "#ff9800" : "#4caf50";
            const statusText = isExisting ? "✓ Wind data available (Already in locations.json)" : "✓ Wind data available (New location)";
            
            const popupContent = \`
                <div>
                    <h4 style="margin: 0 0 10px 0;">\${location.Naam}</h4>
                    <p style="margin: 5px 0;">
                        <strong>Code:</strong> 
                        <span class="coord-value">\${location.Code}</span>
                        <button class="copy-btn" onclick="copyToClipboard('\${location.Code}', this)">Copy</button>
                    </p>
                    <p style="margin: 5px 0;"><strong>Location ID:</strong> \${location.Locatie_MessageID}</p>
                    <p style="margin: 5px 0;"><strong>Coordinate System:</strong> EPSG:\${location.Coordinatenstelsel}</p>
                    <p style="margin: 5px 0;"><strong>RD Coordinates:</strong></p>
                    <div class="coord-line" style="margin: 5px 0 5px 20px;">
                        <span>X:</span>
                        <span class="coord-value">\${location.X}</span>
                        <button class="copy-btn" onclick="copyToClipboard('\${location.X}', this)">Copy</button>
                    </div>
                    <div class="coord-line" style="margin: 5px 0 5px 20px;">
                        <span>Y:</span>
                        <span class="coord-value">\${location.Y}</span>
                        <button class="copy-btn" onclick="copyToClipboard('\${location.Y}', this)">Copy</button>
                    </div>
                    <p style="margin: 5px 0;"><strong>Lat/Lon:</strong></p>
                    <div class="coord-line" style="margin: 5px 0 5px 20px;">
                        <span>Lat:</span>
                        <span class="coord-value">\${latLon[0].toFixed(6)}</span>
                        <button class="copy-btn" onclick="copyToClipboard('\${latLon[0].toFixed(6)}', this)">Copy</button>
                    </div>
                    <div class="coord-line" style="margin: 5px 0 5px 20px;">
                        <span>Lon:</span>
                        <span class="coord-value">\${latLon[1].toFixed(6)}</span>
                        <button class="copy-btn" onclick="copyToClipboard('\${latLon[1].toFixed(6)}', this)">Copy</button>
                    </div>
                    <p style="margin: 5px 0; color: \${statusColor};"><strong>\${statusText}</strong></p>
                </div>
            \`;
            
            marker.bindPopup(popupContent);
            marker.addTo(markers);
        });
        
        document.getElementById('location-count').textContent = locationsWithWind.length;
        
        L.control.scale({ imperial: false, metric: true }).addTo(map);
        
        // Copy to clipboard function
        function copyToClipboard(text, button) {
            navigator.clipboard.writeText(text).then(() => {
                const originalText = button.textContent;
                button.textContent = 'Copied!';
                button.style.background = '#4caf50';
                setTimeout(() => {
                    button.textContent = originalText;
                    button.style.background = '#2196F3';
                }, 1500);
            }).catch(err => {
                console.error('Failed to copy:', err);
                button.textContent = 'Failed';
                setTimeout(() => {
                    button.textContent = 'Copy';
                }, 1500);
            });
        }
        
        console.log('Loaded', locationsWithWind.length, 'locations with wind data');
    </script>
</body>
</html>`;
}

// Run
generateMap().catch(console.error);
