# RWS Wind Data Locations Map

Interactive map showing all RWS (Rijkswaterstaat) measurement locations that have wind data available.

## Purpose

Visualize RWS locations with active wind measurements (WINDSHD) and identify which locations are already in the project's `locations.json` file versus new locations that could be added (these could already be in the project as KNMI locations though).

## How It Works

1. Loads all RWS locations from OphalenCatalogus API
2. Checks each location via RWS API for wind data availability in the last 30 days with CheckWaarnemingenAanwezig
3. Compares locations with existing entries in `locations.json`
4. Generates a static HTML file with all data embedded
5. Color-coded markers:
   - **Green markers**: New locations with wind data (not in locations.json)
   - **Orange markers**: Existing locations (already in locations.json)

## Usage

1. Generate the static map:
   ```bash
   node generate-map.js
   ```

2. Open the generated file:
   ```
   map-static.html
   ```

The generated HTML file is completely standalone and can be shared or opened directly in any browser without needing a server.