//Declare variables
mapboxgl.accessToken = 'pk.eyJ1IjoiZmVpa2VzY2hvbHRlbnMiLCJhIjoiY2t1aDlpZWEwMGhkYTJwbm02Zmt0Y21sOCJ9.PA3iy-3LQhjCkfxhxL2zUw';
let markersLats = [];
let markersLons = [];

//Fetch locations from the server
fetch("/locations").then(response => response.json()).then(data => {

  //Define map
  const map = new mapboxgl.Map({
    container: "locations",
    style: "mapbox://styles/feikescholtens/ckuhc8nha9jft18s0muhoy0zf",
    center: [5.160544, 52.182725],
    zoom: 6
  });

  //Loop though every location
  for (item of data) {

    //Define variable
    let popupId;

    //Add coordinates of the locations to arrays, exept for the text location
    if (item.id !== "1919" && item.id !== "8971" && item.id !== "2417" && item.id !== "2367" && item.id !== "8287" && item.id !== "5643") {
      markersLats.push(item.lat);
      markersLons.push(item.lon);
    }

    //Marker options, in the if statements check what datasets are available for the spots and add an ID to the element
    const marker = document.createElement("div");
    marker.className = "marker";
    if (item.datasets.KNMI) {
      marker.id = "KNMI";
      popupId = "popupKNMI";
    } else if (item.datasets.Rijkswaterstaat) {
      marker.id = "RWS";
      popupId = "popupRWS";
    } else if (item.datasets.MVB) {
      marker.id = "MVB";
      popupId = "popupMVB";
    }

    //Bind markers and popups to the map
    new mapboxgl.Marker(marker).setLngLat([item.lon, item.lat]).setPopup(
      new mapboxgl.Popup({
        offset: 13
      }).setHTML(`<button class="windPageButton ${popupId}" onClick="wind_page('${item.id}')">${item.name}</button>`)
    ).addTo(map);
  }

  //Sorts the coordinates array and set bouds to the smallest and largest values in each direction
  markersLats.sort();
  markersLons.sort();
  map.fitBounds([
    [markersLons.at(-1), markersLats[0]], // southwestern corner of the bounds
    [markersLons[0], markersLats.at(-1)] // northeastern corner of the bounds
  ], {
    padding: 40
  });

  //When the map is loaded, add the Openseamap tiles
  map.on('load', function () {
    map.addLayer({
      'id': 'openseamap',
      'type': 'raster',
      'source': {
        'type': "raster",
        'tiles': ['https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png'],
        'tileSize': 256
      },
      "minzoom": 0,
      "maxzoom": 22,
      "paint": {
        "raster-opacity": .8
      }
    }, 'waterway-label')
  });

  //If an error occurs, give an error
}).catch((error) => {
  if (error == "SyntaxError: Unexpected token < in JSON at position 0") {
    window.location.href = `${window.location.origin}/error?e=37`;
  }
});

//Function to redirect to the wind_page when popup is clicked
function wind_page(id) {
  window.location.assign(`${window.location.protocol}//${window.location.host}/wind/${id}`);
}