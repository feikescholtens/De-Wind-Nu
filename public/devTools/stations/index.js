const locations = L.map('locations').setView([52.182725, 5.160544], 7);
const attribution = "&copy; <a href='https://openstreetmap.org/copyright'>OpenStreetMap</a> constributors";
const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const tiles = L.tileLayer(tileUrl, {
  attribution
});
tiles.addTo(locations);

const dataRWS = [{
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": ["3.66987", "51.92575"]
  },
  "properties": {
    "label": ["Lichteiland Goeree", "Lichteiland Goeree", "Lichteiland Goeree"],
    "snelpeil": "",
    "content": [
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "LEG1",
        "locname": "Lichteiland Goeree"
      }],
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "LEG2",
        "locname": "Lichteiland Goeree"
      }],
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "LEG",
        "locname": "Lichteiland Goeree"
      }]
    ],
    "color": "#776A79",
    "radius": 6,
    "set": "windrozen",
    "basedir": "\/wbviewer"
  }
}, {
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": ["4.08137", "51.98140"]
  },
  "properties": {
    "label": ["Lage Licht default sensor", "Lage Licht backup sensor", "Lage Licht"],
    "snelpeil": "",
    "content": [
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "LGL11",
        "locname": "Lage Licht default sensor"
      }],
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "LGL12",
        "locname": "Lage Licht backup sensor"
      }],
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "LGL1",
        "locname": "Lage Licht"
      }]
    ],
    "color": "#776A79",
    "radius": 6,
    "set": "windrozen",
    "basedir": "\/wbviewer"
  }
}, {
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": ["3.27507", "51.99780"]
  },
  "properties": {
    "label": ["Euro platform 1", "Euro platform 2", "Euro platform"],
    "snelpeil": "",
    "content": [
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "EPL1",
        "locname": "Euro platform 1"
      }],
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "EPL2",
        "locname": "Euro platform 2"
      }],
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "EPL",
        "locname": "Euro platform"
      }]
    ],
    "color": "#776A79",
    "radius": 6,
    "set": "windrozen",
    "basedir": "\/wbviewer"
  }
}, {
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": ["4.15036", "52.92534"]
  },
  "properties": {
    "label": ["Q11 PLATFORM NOORDZEE", "Q11 PLATFORM NOORDZEE"],
    "snelpeil": "",
    "content": [
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "Q11",
        "locname": "Q11 PLATFORM NOORDZEE"
      }],
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "Q1",
        "locname": "Q11 PLATFORM NOORDZEE"
      }]
    ],
    "color": "#776A79",
    "radius": 6,
    "set": "windrozen",
    "basedir": "\/wbviewer"
  }
}, {
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": ["1.16610", "61.33819"]
  },
  "properties": {
    "label": ["North Cormorant 1 (Noordzee)", "North Cormorant   (Noordzee)"],
    "snelpeil": "",
    "content": [
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "NC1",
        "locname": "North Cormorant 1 (Noordzee)"
      }],
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "NC",
        "locname": "North Cormorant   (Noordzee)"
      }]
    ],
    "color": "#776A79",
    "radius": 6,
    "set": "windrozen",
    "basedir": "\/wbviewer"
  }
}, {
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": ["5.76046", "53.42997"]
  },
  "properties": {
    "label": ["Nes Ameland", "Nes Ameland"],
    "snelpeil": "",
    "content": [
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "NESS",
        "locname": "Nes Ameland"
      }],
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "NES",
        "locname": "Nes Ameland"
      }]
    ],
    "color": "#776A79",
    "radius": 6,
    "set": "windrozen",
    "basedir": "\/wbviewer"
  }
}, {
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": ["4.96667", "53.61667"]
  },
  "properties": {
    "label": ["L9 PLATFORM NOORDZEE", "L9 PLATFORM NOORDZEE"],
    "snelpeil": "",
    "content": [
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "L91",
        "locname": "L9 PLATFORM NOORDZEE"
      }],
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "L9",
        "locname": "L9 PLATFORM NOORDZEE"
      }]
    ],
    "color": "#776A79",
    "radius": 6,
    "set": "windrozen",
    "basedir": "\/wbviewer"
  }
}, {
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": ["3.63333", "53.26667"]
  },
  "properties": {
    "label": ["K14 PLATFORM 1", "K14 PLATFORM"],
    "snelpeil": "",
    "content": [
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "K141",
        "locname": "K14 PLATFORM 1"
      }],
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "K14",
        "locname": "K14 PLATFORM"
      }]
    ],
    "color": "#776A79",
    "radius": 6,
    "set": "windrozen",
    "basedir": "\/wbviewer"
  }
}, {
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": ["3.21879", "53.21598"]
  },
  "properties": {
    "label": ["K13 Alpha 2e", "K13 Alpha"],
    "snelpeil": "",
    "content": [
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "K132",
        "locname": "K13 Alpha 2e"
      }],
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "K13",
        "locname": "K13 Alpha"
      }]
    ],
    "color": "#776A79",
    "radius": 6,
    "set": "windrozen",
    "basedir": "\/wbviewer"
  }
}, {
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": ["2.95001", "53.81663"]
  },
  "properties": {
    "label": ["J6 PLATFORM NOORDZEE", "J6 PLATFORM NOORDZEE"],
    "snelpeil": "",
    "content": [
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "J61",
        "locname": "J6 PLATFORM NOORDZEE"
      }],
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "J6",
        "locname": "J6 PLATFORM NOORDZEE"
      }]
    ],
    "color": "#776A79",
    "radius": 6,
    "set": "windrozen",
    "basedir": "\/wbviewer"
  }
}, {
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": ["2.93333", "54.31666"]
  },
  "properties": {
    "label": ["D15 PLATFORM NOORDZEE", "D15 PLATFORM NOORDZEE"],
    "snelpeil": "",
    "content": [
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "D151",
        "locname": "D15 PLATFORM NOORDZEE"
      }],
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "D15",
        "locname": "D15 PLATFORM NOORDZEE"
      }]
    ],
    "color": "#776A79",
    "radius": 6,
    "set": "windrozen",
    "basedir": "\/wbviewer"
  }
}, {
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": ["3.81669", "55.41666"]
  },
  "properties": {
    "label": ["A12 PLATFORM NOORDZEE", "A12 PLATFORM NOORDZEE"],
    "snelpeil": "",
    "content": [
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "A121",
        "locname": "A12 PLATFORM NOORDZEE"
      }],
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "A12",
        "locname": "A12 PLATFORM NOORDZEE"
      }]
    ],
    "color": "#776A79",
    "radius": 6,
    "set": "windrozen",
    "basedir": "\/wbviewer"
  }
}, {
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": ["3.91778", "51.62860"]
  },
  "properties": {
    "label": ["Zeelandbrug windlocatie"],
    "snelpeil": "",
    "content": [
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "ZBWI",
        "locname": "Zeelandbrug windlocatie"
      }]
    ],
    "color": "#776A79",
    "radius": 6,
    "set": "windrozen",
    "basedir": "\/wbviewer"
  }
}, {
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": ["5.95826", "53.51583"]
  },
  "properties": {
    "label": ["Wierumergronden (Noordzee)"],
    "snelpeil": "",
    "content": [
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "WIER",
        "locname": "Wierumergronden (Noordzee)"
      }]
    ],
    "color": "#776A79",
    "radius": 6,
    "set": "windrozen",
    "basedir": "\/wbviewer"
  }
}, {
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": ["3.59453", "51.44056"]
  },
  "properties": {
    "label": ["Vlissingen windlocatie (Westerschelde, KNMI)"],
    "snelpeil": "",
    "content": [
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "vlwi",
        "locname": "Vlissingen windlocatie (Westerschelde, KNMI)"
      }]
    ],
    "color": "#776A79",
    "radius": 6,
    "set": "windrozen",
    "basedir": "\/wbviewer"
  }
}, {
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": ["3.21972", "51.33527"]
  },
  "properties": {
    "label": ["VLB Meteopark Zeebrugge (B)"],
    "snelpeil": "",
    "content": [
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "MEZB",
        "locname": "VLB Meteopark Zeebrugge (B)"
      }]
    ],
    "color": "#776A79",
    "radius": 6,
    "set": "windrozen",
    "basedir": "\/wbviewer"
  }
}, {
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": ["2.43917", "51.38944"]
  },
  "properties": {
    "label": ["VLB Meetpaal 7 (B)"],
    "snelpeil": "",
    "content": [
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "MP7",
        "locname": "VLB Meetpaal 7 (B)"
      }]
    ],
    "color": "#776A79",
    "radius": 6,
    "set": "windrozen",
    "basedir": "\/wbviewer"
  }
}, {
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": ["3.04722", "51.39527"]
  },
  "properties": {
    "label": ["VLB Meetpaal 0 (B)"],
    "snelpeil": "",
    "content": [
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "MP0",
        "locname": "VLB Meetpaal 0 (B)"
      }]
    ],
    "color": "#776A79",
    "radius": 6,
    "set": "windrozen",
    "basedir": "\/wbviewer"
  }
}, {
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": ["3.17294", "51.35418"]
  },
  "properties": {
    "label": ["VLB Daminstrumentatie van Zeebrugge (B)"],
    "snelpeil": "",
    "content": [
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "ZDI",
        "locname": "VLB Daminstrumentatie van Zeebrugge (B)"
      }]
    ],
    "color": "#776A79",
    "radius": 6,
    "set": "windrozen",
    "basedir": "\/wbviewer"
  }
}, {
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": ["5.33303", "53.44249"]
  },
  "properties": {
    "label": ["Terschelling Noordzee"],
    "snelpeil": "",
    "content": [
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "TERS",
        "locname": "Terschelling Noordzee"
      }]
    ],
    "color": "#776A79",
    "radius": 6,
    "set": "windrozen",
    "basedir": "\/wbviewer"
  }
}, {
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": ["3.81621", "51.32778"]
  },
  "properties": {
    "label": ["Terneuzen Westsluis windlocatie"],
    "snelpeil": "",
    "content": [
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "TNWS",
        "locname": "Terneuzen Westsluis windlocatie"
      }]
    ],
    "color": "#776A79",
    "radius": 6,
    "set": "windrozen",
    "basedir": "\/wbviewer"
  }
}, {
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": ["4.51860", "52.46444"]
  },
  "properties": {
    "label": ["Stroompaal IJmond 1 (Noordzee)"],
    "snelpeil": "",
    "content": [
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "SPY1",
        "locname": "Stroompaal IJmond 1 (Noordzee)"
      }]
    ],
    "color": "#776A79",
    "radius": 6,
    "set": "windrozen",
    "basedir": "\/wbviewer"
  }
}, {
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": ["5.38333", "52.89660"]
  },
  "properties": {
    "label": ["Stavoren"],
    "snelpeil": "",
    "content": [
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "STVO",
        "locname": "Stavoren"
      }]
    ],
    "color": "#776A79",
    "radius": 6,
    "set": "windrozen",
    "basedir": "\/wbviewer"
  }
}, {
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": ["4.00601", "51.59541"]
  },
  "properties": {
    "label": ["Stavenisse (Oosterschelde)"],
    "snelpeil": "",
    "content": [
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "STAV",
        "locname": "Stavenisse (Oosterschelde)"
      }]
    ],
    "color": "#776A79",
    "radius": 6,
    "set": "windrozen",
    "basedir": "\/wbviewer"
  }
}, {
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": ["3.05670", "51.69993"]
  },
  "properties": {
    "label": ["Platform Borssele Alpha"],
    "snelpeil": "",
    "content": [
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "BSA",
        "locname": "Platform Borssele Alpha"
      }]
    ],
    "color": "#776A79",
    "radius": 6,
    "set": "windrozen",
    "basedir": "\/wbviewer"
  }
}, {
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": ["3.69395", "51.65588"]
  },
  "properties": {
    "label": ["O\\'SCHELDE ZEEZIJDE SCHAAR"],
    "snelpeil": "",
    "content": [
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "OS4",
        "locname": "O\\'SCHELDE ZEEZIJDE SCHAAR"
      }]
    ],
    "color": "#776A79",
    "radius": 6,
    "set": "windrozen",
    "basedir": "\/wbviewer"
  }
}, {
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": ["4.08413", "51.98669"]
  },
  "properties": {
    "label": ["Noorderdam Hoek van Holland"],
    "snelpeil": "",
    "content": [
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "NRD1",
        "locname": "Noorderdam Hoek van Holland"
      }]
    ],
    "color": "#776A79",
    "radius": 6,
    "set": "windrozen",
    "basedir": "\/wbviewer"
  }
}, {
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": ["1.14725", "57.66832"]
  },
  "properties": {
    "label": ["Nelson platform"],
    "snelpeil": "",
    "content": [
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "NLS1",
        "locname": "Nelson platform"
      }]
    ],
    "color": "#776A79",
    "radius": 6,
    "set": "windrozen",
    "basedir": "\/wbviewer"
  }
}, {
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": ["5.88738", "52.70191"]
  },
  "properties": {
    "label": ["Marknesse"],
    "snelpeil": "",
    "content": [
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "MARK",
        "locname": "Marknesse"
      }]
    ],
    "color": "#776A79",
    "radius": 6,
    "set": "windrozen",
    "basedir": "\/wbviewer"
  }
}, {
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": ["5.24215", "52.53207"]
  },
  "properties": {
    "label": ["Markermeer Midden NAP -3,4m"],
    "snelpeil": "",
    "content": [
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "FL42",
        "locname": "Markermeer Midden NAP -3,4m"
      }]
    ],
    "color": "#776A79",
    "radius": 6,
    "set": "windrozen",
    "basedir": "\/wbviewer"
  }
}, {
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": ["3.85926", "51.54397"]
  },
  "properties": {
    "label": ["Kats wind (Zandkreeksluis VM zijde)"],
    "snelpeil": "",
    "content": [
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "KAWI",
        "locname": "Kats wind (Zandkreeksluis VM zijde)"
      }]
    ],
    "color": "#776A79",
    "radius": 6,
    "set": "windrozen",
    "basedir": "\/wbviewer"
  }
}, {
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": ["5.55995", "52.74935"]
  },
  "properties": {
    "label": ["IJsselmeer, Rotterdamse hoek"],
    "snelpeil": "",
    "content": [
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "FL02",
        "locname": "IJsselmeer, Rotterdamse hoek"
      }]
    ],
    "color": "#776A79",
    "radius": 6,
    "set": "windrozen",
    "basedir": "\/wbviewer"
  }
}, {
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": ["4.55482", "52.46228"]
  },
  "properties": {
    "label": ["IJmuiden haven"],
    "snelpeil": "",
    "content": [
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "IJMH",
        "locname": "IJmuiden haven"
      }]
    ],
    "color": "#776A79",
    "radius": 6,
    "set": "windrozen",
    "basedir": "\/wbviewer"
  }
}, {
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": ["4.53228", "52.46369"]
  },
  "properties": {
    "label": ["IJmuiden buitenhaven (zuid pier)"],
    "snelpeil": "",
    "content": [
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "IJZ1",
        "locname": "IJmuiden buitenhaven (zuid pier)"
      }]
    ],
    "color": "#776A79",
    "radius": 6,
    "set": "windrozen",
    "basedir": "\/wbviewer"
  }
}, {
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": ["6.39843", "53.57375"]
  },
  "properties": {
    "label": ["Huibertgat"],
    "snelpeil": "",
    "content": [
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "HUIB",
        "locname": "Huibertgat"
      }]
    ],
    "color": "#776A79",
    "radius": 6,
    "set": "windrozen",
    "basedir": "\/wbviewer"
  }
}, {
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": ["5.41719", "52.63527"]
  },
  "properties": {
    "label": ["Houtribdijk"],
    "snelpeil": "",
    "content": [
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "HOUD",
        "locname": "Houtribdijk"
      }]
    ],
    "color": "#776A79",
    "radius": 6,
    "set": "windrozen",
    "basedir": "\/wbviewer"
  }
}, {
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": ["5.34865", "53.39926"]
  },
  "properties": {
    "label": ["Hoorn Terschelling"],
    "snelpeil": "",
    "content": [
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "HOTE",
        "locname": "Hoorn Terschelling"
      }]
    ],
    "color": "#776A79",
    "radius": 6,
    "set": "windrozen",
    "basedir": "\/wbviewer"
  }
}, {
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": ["4.05438", "51.83617"]
  },
  "properties": {
    "label": ["Haringvlietsluis schuif 1"],
    "snelpeil": "",
    "content": [
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "HVS01",
        "locname": "Haringvlietsluis schuif 1"
      }]
    ],
    "color": "#776A79",
    "radius": 6,
    "set": "windrozen",
    "basedir": "\/wbviewer"
  }
}, {
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": ["3.99745", "51.44571"]
  },
  "properties": {
    "label": ["Hansweert Windmeetpaal"],
    "snelpeil": "",
    "content": [
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "HAWI",
        "locname": "Hansweert Windmeetpaal"
      }]
    ],
    "color": "#776A79",
    "radius": 6,
    "set": "windrozen",
    "basedir": "\/wbviewer"
  }
}, {
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": ["4.09566", "51.66661"]
  },
  "properties": {
    "label": ["Grevelingensluis windlocatie"],
    "snelpeil": "",
    "content": [
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "GRWI",
        "locname": "Grevelingensluis windlocatie"
      }]
    ],
    "color": "#776A79",
    "radius": 6,
    "set": "windrozen",
    "basedir": "\/wbviewer"
  }
}, {
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": ["1.00180", "57.19150"]
  },
  "properties": {
    "label": ["Gannet Alpha"],
    "snelpeil": "",
    "content": [
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "GAN1",
        "locname": "Gannet Alpha"
      }]
    ],
    "color": "#776A79",
    "radius": 6,
    "set": "windrozen",
    "basedir": "\/wbviewer"
  }
}, {
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": ["3.37905", "51.37989"]
  },
  "properties": {
    "label": ["Cadzand windmeetpaal"],
    "snelpeil": "",
    "content": [
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "CAWI",
        "locname": "Cadzand windmeetpaal"
      }]
    ],
    "color": "#776A79",
    "radius": 6,
    "set": "windrozen",
    "basedir": "\/wbviewer"
  }
}, {
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": ["3.62175", "51.76653"]
  },
  "properties": {
    "label": ["Brouwershavensegat 02"],
    "snelpeil": "",
    "content": [
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "BG2",
        "locname": "Brouwershavensegat 02"
      }]
    ],
    "color": "#776A79",
    "radius": 6,
    "set": "windrozen",
    "basedir": "\/wbviewer"
  }
}, {
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": ["4.17390", "51.51020"]
  },
  "properties": {
    "label": ["Bergse Diepsluis windlocatie"],
    "snelpeil": "",
    "content": [
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "BDWI",
        "locname": "Bergse Diepsluis windlocatie"
      }]
    ],
    "color": "#776A79",
    "radius": 6,
    "set": "windrozen",
    "basedir": "\/wbviewer"
  }
}, {
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": ["5.95000", "53.50000"]
  },
  "properties": {
    "label": ["AWG PLATFORM NOORDZEE"],
    "snelpeil": "",
    "content": [
      [{
        "label": "Windroos",
        "type": "windroos",
        "id": 1,
        "location": "AWG1",
        "locname": "AWG PLATFORM NOORDZEE"
      }]
    ],
    "color": "#776A79",
    "radius": 6,
    "set": "windrozen",
    "basedir": "\/wbviewer"
  }
}]

const dataKNMI = {
  "0": {
    "$id": "4",
    "stationid": 6391,
    "stationname": "Meetstation Arcen",
    "lat": 51.5,
    "lon": 6.2,
    "regio": "Venlo",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Zwaar bewolkt",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/cc.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/cc",
    "winddirection": "ZO",
    "temperature": 14.4,
    "groundtemperature": 13.0,
    "feeltemperature": 14.4,
    "windgusts": 3.8,
    "windspeed": 2.1,
    "windspeedBft": 2,
    "humidity": 77.0,
    "precipitation": 0.0,
    "sunpower": 0.0,
    "rainFallLast24Hour": 0.0,
    "rainFallLastHour": 0.0,
    "winddirectiondegrees": 130
  },
  "1": {
    "$id": "5",
    "stationid": 6275,
    "stationname": "Meetstation Arnhem",
    "lat": 52.07,
    "lon": 5.88,
    "regio": "Arnhem",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Mix van opklaringen en middelbare of lage bewolking",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/bb.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/bb",
    "winddirection": "OZO",
    "airpressure": 1019.4,
    "temperature": 12.4,
    "groundtemperature": 10.9,
    "feeltemperature": 12.4,
    "visibility": 23200.0,
    "windgusts": 3.3,
    "windspeed": 2.7,
    "windspeedBft": 2,
    "humidity": 84.0,
    "precipitation": 0.0,
    "sunpower": 0.0,
    "rainFallLast24Hour": 0.0,
    "rainFallLastHour": 0.0,
    "winddirectiondegrees": 112
  },
  "2": {
    "$id": "6",
    "stationid": 6249,
    "stationname": "Meetstation Berkhout",
    "lat": 52.65,
    "lon": 4.98,
    "regio": "Berkhout",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Zwaar bewolkt",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/cc.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/cc",
    "winddirection": "ZZO",
    "temperature": 15.5,
    "groundtemperature": 14.4,
    "feeltemperature": 15.5,
    "visibility": 26800.0,
    "windgusts": 6.7,
    "windspeed": 4.7,
    "windspeedBft": 3,
    "humidity": 72.0,
    "precipitation": 0.0,
    "sunpower": 0.0,
    "rainFallLast24Hour": 0.3,
    "rainFallLastHour": 0.0,
    "winddirectiondegrees": 159
  },
  "3": {
    "$id": "7",
    "stationid": 6308,
    "stationname": "Meetstation Cadzand",
    "lat": 51.38,
    "lon": 3.38,
    "regio": "Cadzand",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Zwaar bewolkt",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/cc.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/cc",
    "winddirection": "ZZO",
    "windgusts": 6.0,
    "windspeed": 4.2,
    "windspeedBft": 3,
    "winddirectiondegrees": 163
  },
  "4": {
    "$id": "8",
    "stationid": 6260,
    "stationname": "Meetstation De Bilt",
    "lat": 52.1,
    "lon": 5.18,
    "regio": "Utrecht",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Mix van opklaringen en middelbare of lage bewolking",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/bb.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/bb",
    "winddirection": "ZO",
    "airpressure": 1018.5,
    "temperature": 13.5,
    "groundtemperature": 9.7,
    "feeltemperature": 13.5,
    "visibility": 47300.0,
    "windgusts": 3.9,
    "windspeed": 2.4,
    "windspeedBft": 2,
    "humidity": 78.0,
    "precipitation": 0.0,
    "sunpower": 0.0,
    "rainFallLast24Hour": 0.0,
    "rainFallLastHour": 0.0,
    "winddirectiondegrees": 144
  },
  "5": {
    "$id": "9",
    "stationid": 6235,
    "stationname": "Meetstation Den Helder",
    "lat": 52.92,
    "lon": 4.78,
    "regio": "Den Helder",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Zwaar bewolkt",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/cc.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/cc",
    "winddirection": "ZO",
    "airpressure": 1017.6,
    "temperature": 14.6,
    "groundtemperature": 13.5,
    "feeltemperature": 13.9,
    "visibility": 49900.0,
    "windgusts": 5.3,
    "windspeed": 3.4,
    "windspeedBft": 2,
    "humidity": 73.0,
    "precipitation": 0.0,
    "sunpower": 0.0,
    "rainFallLast24Hour": 3.5,
    "rainFallLastHour": 0.0,
    "winddirectiondegrees": 142
  },
  "6": {
    "$id": "10",
    "stationid": 6370,
    "stationname": "Meetstation Eindhoven",
    "lat": 51.45,
    "lon": 5.42,
    "regio": "Eindhoven",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Zwaar bewolkt",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/cc.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/cc",
    "winddirection": "ZZO",
    "airpressure": 1019.1,
    "temperature": 13.5,
    "groundtemperature": 10.0,
    "feeltemperature": 13.5,
    "visibility": 42000.0,
    "windgusts": 2.6,
    "windspeed": 1.8,
    "windspeedBft": 2,
    "humidity": 78.0,
    "precipitation": 0.0,
    "sunpower": 0.0,
    "rainFallLast24Hour": 0.0,
    "rainFallLastHour": 0.0,
    "winddirectiondegrees": 154
  },
  "7": {
    "$id": "11",
    "stationid": 6377,
    "stationname": "Meetstation Ell",
    "lat": 51.2,
    "lon": 5.77,
    "regio": "Weert",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Vrijwel onbewolkt (zonnig/helder)",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/aa.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/aa",
    "winddirection": "ZO",
    "temperature": 10.4,
    "groundtemperature": 6.5,
    "feeltemperature": 10.4,
    "visibility": 61500.0,
    "windgusts": 2.0,
    "windspeed": 1.6,
    "windspeedBft": 1,
    "humidity": 90.0,
    "precipitation": 0.0,
    "sunpower": 0.0,
    "rainFallLastHour": 0.0,
    "winddirectiondegrees": 130
  },
  "8": {
    "$id": "12",
    "stationid": 6321,
    "stationname": "Meetstation Euro platform",
    "lat": 52.0,
    "lon": 3.28,
    "regio": "Noordzee",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Zwaar bewolkt",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/cc.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/cc",
    "winddirection": "ZZO",
    "airpressure": 1016.2,
    "visibility": 49000.0,
    "windgusts": 12.5,
    "windspeed": 10.0,
    "windspeedBft": 5,
    "winddirectiondegrees": 164
  },
  "9": {
    "$id": "13",
    "stationid": 6350,
    "stationname": "Meetstation Gilze Rijen",
    "lat": 51.57,
    "lon": 4.93,
    "regio": "Gilze Rijen",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Zwaar bewolkt",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/cc.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/cc",
    "winddirection": "ZO",
    "airpressure": 1018.6,
    "temperature": 13.4,
    "groundtemperature": 11.5,
    "feeltemperature": 13.4,
    "visibility": 46200.0,
    "windgusts": 3.6,
    "windspeed": 2.6,
    "windspeedBft": 2,
    "humidity": 79.0,
    "precipitation": 0.0,
    "sunpower": 0.0,
    "rainFallLast24Hour": 0.0,
    "rainFallLastHour": 0.0,
    "winddirectiondegrees": 135
  },
  "10": {
    "$id": "14",
    "stationid": 6323,
    "stationname": "Meetstation Goes",
    "lat": 51.53,
    "lon": 3.9,
    "regio": "Goes",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Zwaar bewolkt",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/cc.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/cc",
    "winddirection": "ZZO",
    "airpressure": 1017.5,
    "temperature": 15.2,
    "groundtemperature": 14.4,
    "feeltemperature": 15.2,
    "windgusts": 6.4,
    "windspeed": 3.2,
    "windspeedBft": 2,
    "humidity": 74.0,
    "precipitation": 0.0,
    "sunpower": 0.0,
    "rainFallLast24Hour": 0.0,
    "rainFallLastHour": 0.0,
    "winddirectiondegrees": 161
  },
  "11": {
    "$id": "15",
    "stationid": 6283,
    "stationname": "Meetstation Groenlo-Hupsel",
    "lat": 52.07,
    "lon": 6.65,
    "regio": "Oost-Overijssel",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Zwaar bewolkt",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/cc.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/cc",
    "winddirection": "ZO",
    "temperature": 12.3,
    "groundtemperature": 7.7,
    "feeltemperature": 12.3,
    "windgusts": 2.9,
    "windspeed": 2.0,
    "windspeedBft": 2,
    "humidity": 86.0,
    "precipitation": 0.0,
    "sunpower": 0.0,
    "rainFallLast24Hour": 0.0,
    "rainFallLastHour": 0.0,
    "winddirectiondegrees": 124
  },
  "12": {
    "$id": "16",
    "stationid": 6280,
    "stationname": "Meetstation Groningen",
    "lat": 53.13,
    "lon": 6.58,
    "regio": "Groningen",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Mix van opklaringen en middelbare of lage bewolking",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/bb.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/bb",
    "winddirection": "ZZO",
    "airpressure": 1019.7,
    "temperature": 12.8,
    "groundtemperature": 10.1,
    "feeltemperature": 12.8,
    "visibility": 30900.0,
    "windgusts": 3.5,
    "windspeed": 2.5,
    "windspeedBft": 2,
    "humidity": 82.0,
    "precipitation": 0.0,
    "sunpower": 0.0,
    "rainFallLast24Hour": 0.0,
    "rainFallLastHour": 0.0,
    "winddirectiondegrees": 152
  },
  "13": {
    "$id": "17",
    "stationid": 6315,
    "stationname": "Meetstation Hansweert",
    "lat": 51.45,
    "lon": 4.0,
    "regio": "Oost-Zeeland",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Zwaar bewolkt",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/cc.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/cc",
    "winddirection": "ZZO",
    "windgusts": 7.4,
    "windspeed": 6.1,
    "windspeedBft": 4,
    "winddirectiondegrees": 159
  },
  "14": {
    "$id": "18",
    "stationid": 6278,
    "stationname": "Meetstation Heino",
    "lat": 52.43,
    "lon": 6.27,
    "regio": "Zwolle",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Zwaar bewolkt",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/cc.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/cc",
    "winddirection": "ZO",
    "temperature": 11.6,
    "groundtemperature": 8.1,
    "feeltemperature": 11.6,
    "windgusts": 2.3,
    "windspeed": 1.3,
    "windspeedBft": 1,
    "humidity": 91.0,
    "precipitation": 0.0,
    "sunpower": 0.0,
    "rainFallLast24Hour": 0.0,
    "rainFallLastHour": 0.0,
    "winddirectiondegrees": 124
  },
  "15": {
    "$id": "19",
    "stationid": 6356,
    "stationname": "Meetstation Herwijnen",
    "lat": 51.87,
    "lon": 5.15,
    "regio": "Gorinchem",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Zwaar bewolkt",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/cc.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/cc",
    "winddirection": "ZZO",
    "airpressure": 1018.7,
    "temperature": 13.8,
    "groundtemperature": 12.7,
    "feeltemperature": 12.8,
    "windgusts": 5.4,
    "windspeed": 3.7,
    "windspeedBft": 3,
    "humidity": 77.0,
    "precipitation": 0.0,
    "sunpower": 0.0,
    "rainFallLast24Hour": 0.0,
    "rainFallLastHour": 0.0,
    "winddirectiondegrees": 147
  },
  "16": {
    "$id": "20",
    "stationid": 6330,
    "stationname": "Meetstation Hoek van Holland",
    "lat": 51.98,
    "lon": 4.1,
    "regio": "Hoek van Holland",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Zwaar bewolkt",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/cc.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/cc",
    "winddirection": "Z",
    "airpressure": 1017.5,
    "temperature": 15.9,
    "groundtemperature": 15.4,
    "feeltemperature": 15.9,
    "windgusts": 9.6,
    "windspeed": 7.3,
    "windspeedBft": 4,
    "humidity": 67.0,
    "precipitation": 0.0,
    "sunpower": 0.0,
    "rainFallLast24Hour": 0.3,
    "rainFallLastHour": 0.0,
    "winddirectiondegrees": 174
  },
  "17": {
    "$id": "21",
    "stationid": 6279,
    "stationname": "Meetstation Hoogeveen",
    "lat": 52.73,
    "lon": 6.52,
    "regio": "Hoogeveen",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Vrijwel onbewolkt (zonnig/helder)",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/aa.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/aa",
    "winddirection": "ZO",
    "airpressure": 1019.9,
    "temperature": 11.9,
    "groundtemperature": 9.3,
    "feeltemperature": 11.9,
    "visibility": 6860.0,
    "windgusts": 3.2,
    "windspeed": 2.3,
    "windspeedBft": 2,
    "humidity": 86.0,
    "precipitation": 0.0,
    "sunpower": 0.0,
    "rainFallLast24Hour": 0.0,
    "rainFallLastHour": 0.0,
    "winddirectiondegrees": 136
  },
  "18": {
    "$id": "22",
    "stationid": 6251,
    "stationname": "Meetstation Hoorn Terschelling",
    "lat": 53.38,
    "lon": 5.35,
    "regio": "Wadden",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Zwaar bewolkt",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/cc.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/cc",
    "winddirection": "ZO",
    "airpressure": 1018.2,
    "temperature": 15.0,
    "groundtemperature": 14.4,
    "feeltemperature": 15.0,
    "visibility": 28400.0,
    "windgusts": 7.4,
    "windspeed": 5.8,
    "windspeedBft": 4,
    "humidity": 82.0,
    "precipitation": 0.0,
    "sunpower": 0.0,
    "rainFallLast24Hour": 0.3,
    "rainFallLastHour": 0.0,
    "winddirectiondegrees": 143
  },
  "19": {
    "$id": "23",
    "stationid": 6258,
    "stationname": "Meetstation Houtribdijk",
    "lat": 52.65,
    "lon": 5.4,
    "regio": "Enkhuizen-Lelystad",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Zwaar bewolkt",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/cc.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/cc",
    "winddirection": "ZZO",
    "windgusts": 8.4,
    "windspeed": 6.2,
    "windspeedBft": 4,
    "winddirectiondegrees": 149
  },
  "20": {
    "$id": "24",
    "stationid": 6285,
    "stationname": "Meetstation Huibertgat",
    "lat": 53.57,
    "lon": 6.4,
    "regio": "Schiermonnikoog",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Zwaar bewolkt",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/cc.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/cc",
    "winddirection": "ZO",
    "windgusts": 7.3,
    "windspeed": 5.7,
    "windspeedBft": 4,
    "winddirectiondegrees": 144
  },
  "21": {
    "$id": "25",
    "stationid": 6209,
    "stationname": "Meetstation IJmond",
    "lat": 52.47,
    "lon": 4.52,
    "regio": "IJmond",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Zwaar bewolkt",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/cc.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/cc",
    "winddirection": "ZZO",
    "windgusts": 8.9,
    "windspeed": 7.1,
    "windspeedBft": 4,
    "winddirectiondegrees": 162
  },
  "22": {
    "$id": "26",
    "stationid": 6225,
    "stationname": "Meetstation IJmuiden",
    "lat": 52.47,
    "lon": 4.57,
    "regio": "IJmuiden",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Zwaar bewolkt",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/cc.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/cc",
    "winddirection": "ZO",
    "windgusts": 5.8,
    "windspeed": 3.9,
    "windspeedBft": 3,
    "winddirectiondegrees": 146
  },
  "23": {
    "$id": "27",
    "stationid": 6277,
    "stationname": "Meetstation Lauwersoog",
    "lat": 53.42,
    "lon": 6.2,
    "regio": "Noord-Groningen",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Zwaar bewolkt",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/cc.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/cc",
    "winddirection": "ZO",
    "temperature": 14.2,
    "groundtemperature": 13.2,
    "feeltemperature": 13.1,
    "windgusts": 5.5,
    "windspeed": 4.2,
    "windspeedBft": 3,
    "humidity": 79.0,
    "precipitation": 0.0,
    "sunpower": 0.0,
    "rainFallLast24Hour": 0.0,
    "rainFallLastHour": 0.0,
    "winddirectiondegrees": 145
  },
  "24": {
    "$id": "28",
    "stationid": 6320,
    "stationname": "Meetstation LE Goeree",
    "lat": 51.93,
    "lon": 3.67,
    "regio": "Goeree",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Zwaar bewolkt",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/cc.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/cc",
    "winddirection": "Z",
    "airpressure": 1017.0,
    "visibility": 36600.0,
    "windgusts": 10.5,
    "windspeed": 7.8,
    "windspeedBft": 4,
    "winddirectiondegrees": 177
  },
  "25": {
    "$id": "29",
    "stationid": 6270,
    "stationname": "Meetstation Leeuwarden",
    "lat": 53.22,
    "lon": 5.77,
    "regio": "Leeuwarden",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Zwaar bewolkt",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/cc.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/cc",
    "winddirection": "ZO",
    "airpressure": 1018.8,
    "temperature": 14.5,
    "groundtemperature": 12.9,
    "feeltemperature": 13.6,
    "visibility": 47400.0,
    "windgusts": 6.1,
    "windspeed": 3.9,
    "windspeedBft": 3,
    "humidity": 76.0,
    "precipitation": 0.0,
    "sunpower": 0.0,
    "rainFallLast24Hour": 0.1,
    "rainFallLastHour": 0.0,
    "winddirectiondegrees": 136
  },
  "26": {
    "$id": "30",
    "stationid": 6269,
    "stationname": "Meetstation Lelystad",
    "lat": 52.45,
    "lon": 5.53,
    "regio": "Lelystad",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Zwaar bewolkt",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/cc.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/cc",
    "winddirection": "ZO",
    "airpressure": 1018.8,
    "temperature": 13.6,
    "groundtemperature": 12.0,
    "feeltemperature": 13.6,
    "visibility": 45700.0,
    "windgusts": 4.1,
    "windspeed": 2.7,
    "windspeedBft": 2,
    "humidity": 80.0,
    "precipitation": 0.0,
    "sunpower": 0.0,
    "rainFallLast24Hour": 0.0,
    "rainFallLastHour": 0.0,
    "winddirectiondegrees": 135
  },
  "27": {
    "$id": "31",
    "stationid": 6348,
    "stationname": "Meetstation Lopik-Cabauw",
    "lat": 51.97,
    "lon": 4.93,
    "regio": "West-Utrecht",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Zwaar bewolkt",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/cc.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/cc",
    "winddirection": "ZO",
    "airpressure": 1018.3,
    "temperature": 13.4,
    "groundtemperature": 12.5,
    "feeltemperature": 12.4,
    "visibility": 45100.0,
    "windgusts": 4.7,
    "windspeed": 3.4,
    "windspeedBft": 2,
    "humidity": 81.0,
    "precipitation": 0.0,
    "sunpower": 0.0,
    "rainFallLast24Hour": 0.0,
    "rainFallLastHour": 0.0,
    "winddirectiondegrees": 140
  },
  "28": {
    "$id": "32",
    "stationid": 6380,
    "stationname": "Meetstation Maastricht",
    "lat": 50.92,
    "lon": 5.78,
    "regio": "Maastricht",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Zwaar bewolkt",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/cc.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/cc",
    "winddirection": "ZO",
    "airpressure": 1019.8,
    "temperature": 13.0,
    "groundtemperature": 10.9,
    "feeltemperature": 13.0,
    "visibility": 42900.0,
    "windgusts": 3.9,
    "windspeed": 2.7,
    "windspeedBft": 2,
    "humidity": 79.0,
    "precipitation": 0.0,
    "sunpower": 0.0,
    "rainFallLast24Hour": 0.0,
    "rainFallLastHour": 0.0,
    "winddirectiondegrees": 139
  },
  "29": {
    "$id": "33",
    "stationid": 6273,
    "stationname": "Meetstation Marknesse",
    "lat": 52.7,
    "lon": 5.88,
    "regio": "Noordoostpolder",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Zwaar bewolkt",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/cc.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/cc",
    "winddirection": "ZO",
    "temperature": 13.8,
    "groundtemperature": 12.6,
    "feeltemperature": 12.5,
    "visibility": 31300.0,
    "windgusts": 6.1,
    "windspeed": 4.6,
    "windspeedBft": 3,
    "humidity": 80.0,
    "precipitation": 0.0,
    "sunpower": 0.0,
    "rainFallLast24Hour": 0.0,
    "rainFallLastHour": 0.0,
    "winddirectiondegrees": 143
  },
  "30": {
    "$id": "34",
    "stationid": 6286,
    "stationname": "Meetstation Nieuw Beerta",
    "lat": 53.2,
    "lon": 7.15,
    "regio": "Oost-Groningen",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Zwaar bewolkt",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/cc.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/cc",
    "winddirection": "ZO",
    "temperature": 12.7,
    "groundtemperature": 11.7,
    "feeltemperature": 12.7,
    "windgusts": 4.5,
    "windspeed": 3.3,
    "windspeedBft": 2,
    "humidity": 88.0,
    "precipitation": 0.0,
    "sunpower": 0.0,
    "rainFallLast24Hour": 0.0,
    "rainFallLastHour": 0.0,
    "winddirectiondegrees": 141
  },
  "31": {
    "$id": "35",
    "stationid": 6312,
    "stationname": "Meetstation Oosterschelde",
    "lat": 51.77,
    "lon": 3.62,
    "regio": "Oosterschelde",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Zwaar bewolkt",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/cc.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/cc",
    "winddirection": "Z",
    "windgusts": 10.8,
    "windspeed": 9.0,
    "windspeedBft": 5,
    "winddirectiondegrees": 174
  },
  "32": {
    "$id": "38",
    "stationid": 6316,
    "stationname": "Meetstation Schaar",
    "lat": 51.65,
    "lon": 3.7,
    "regio": "Schaar",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Zwaar bewolkt",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/cc.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/cc",
    "winddirection": "ZZO",
    "windgusts": 7.3,
    "windspeed": 5.4,
    "windspeedBft": 3,
    "winddirectiondegrees": 167
  },
  "33": {
    "$id": "36",
    "stationid": 6344,
    "stationname": "Meetstation Rotterdam",
    "lat": 51.95,
    "lon": 4.45,
    "regio": "Rotterdam",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Zwaar bewolkt",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/cc.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/cc",
    "winddirection": "ZZO",
    "airpressure": 1017.8,
    "temperature": 15.9,
    "groundtemperature": 14.7,
    "feeltemperature": 15.9,
    "visibility": 49500.0,
    "windgusts": 5.3,
    "windspeed": 3.7,
    "windspeedBft": 3,
    "humidity": 67.0,
    "precipitation": 0.0,
    "sunpower": 0.0,
    "rainFallLast24Hour": 0.0,
    "rainFallLastHour": 0.0,
    "winddirectiondegrees": 165
  },
  "34": {
    "$id": "37",
    "stationid": 6343,
    "stationname": "Meetstation Rotterdam Geulhaven",
    "lat": 51.88,
    "lon": 4.32,
    "regio": "Rotterdam Haven",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Zwaar bewolkt",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/cc.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/cc",
    "winddirection": "ZZO",
    "windgusts": 5.5,
    "windspeed": 2.5,
    "windspeedBft": 2,
    "winddirectiondegrees": 166
  },
  "35": {
    "$id": "38",
    "stationid": 6316,
    "stationname": "Meetstation Schaar",
    "lat": 51.65,
    "lon": 3.7,
    "regio": "Schaar",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Zwaar bewolkt",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/cc.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/cc",
    "winddirection": "ZZO",
    "windgusts": 7.3,
    "windspeed": 5.4,
    "windspeedBft": 3,
    "winddirectiondegrees": 167
  },
  "36": {
    "$id": "39",
    "stationid": 6240,
    "stationname": "Meetstation Schiphol",
    "lat": 52.3,
    "lon": 4.77,
    "regio": "Amsterdam",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Zwaar bewolkt",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/cc.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/cc",
    "winddirection": "ZO",
    "airpressure": 1017.9,
    "temperature": 14.6,
    "groundtemperature": 12.8,
    "feeltemperature": 13.4,
    "visibility": 49400.0,
    "windgusts": 7.0,
    "windspeed": 4.9,
    "windspeedBft": 3,
    "humidity": 74.0,
    "precipitation": 0.0,
    "sunpower": 0.0,
    "rainFallLast24Hour": 0.0,
    "rainFallLastHour": 0.0,
    "winddirectiondegrees": 141
  },
  "37": {
    "$id": "40",
    "stationid": 6324,
    "stationname": "Meetstation Stavenisse",
    "lat": 51.6,
    "lon": 4.0,
    "regio": "Midden-Zeeland",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Zwaar bewolkt",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/cc.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/cc",
    "winddirection": "ZZO",
    "windgusts": 8.3,
    "windspeed": 5.3,
    "windspeedBft": 3,
    "winddirectiondegrees": 166
  },
  "38": {
    "$id": "41",
    "stationid": 6267,
    "stationname": "Meetstation Stavoren",
    "lat": 52.88,
    "lon": 5.38,
    "regio": "West-Friesland",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Zwaar bewolkt",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/cc.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/cc",
    "winddirection": "ZO",
    "temperature": 15.3,
    "groundtemperature": 13.7,
    "feeltemperature": 15.3,
    "visibility": 42100.0,
    "windgusts": 7.2,
    "windspeed": 4.8,
    "windspeedBft": 3,
    "humidity": 78.0,
    "precipitation": 0.0,
    "sunpower": 1.0,
    "rainFallLast24Hour": 0.0,
    "rainFallLastHour": 0.0,
    "winddirectiondegrees": 144
  },
  "39": {
    "$id": "42",
    "stationid": 6229,
    "stationname": "Meetstation Texelhors",
    "lat": 53.0,
    "lon": 4.75,
    "regio": "Texel",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Zwaar bewolkt",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/cc.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/cc",
    "winddirection": "ZZO",
    "windgusts": 8.0,
    "windspeed": 6.1,
    "windspeedBft": 4,
    "winddirectiondegrees": 147
  },
  "40": {
    "$id": "43",
    "stationid": 6331,
    "stationname": "Meetstation Tholen",
    "lat": 51.52,
    "lon": 4.13,
    "regio": "Tholen",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Zwaar bewolkt",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/cc.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/cc"
  },
  "41": {
    "$id": "44",
    "stationid": 6290,
    "stationname": "Meetstation Twente",
    "lat": 52.27,
    "lon": 6.9,
    "regio": "Twente",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Zwaar bewolkt",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/cc.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/cc",
    "winddirection": "ZO",
    "airpressure": 1020.2,
    "temperature": 10.0,
    "groundtemperature": 5.9,
    "feeltemperature": 9.6,
    "visibility": 14200.0,
    "windgusts": 2.1,
    "windspeed": 1.5,
    "windspeedBft": 1,
    "humidity": 98.0,
    "precipitation": 0.0,
    "sunpower": 0.0,
    "rainFallLast24Hour": 0.0,
    "rainFallLastHour": 0.0,
    "winddirectiondegrees": 129
  },
  "42": {
    "$id": "45",
    "stationid": 6313,
    "stationname": "Meetstation Vlakte aan de Raan",
    "lat": 51.5,
    "lon": 3.25,
    "regio": "West-Zeeland",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Zwaar bewolkt",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/cc.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/cc",
    "winddirection": "Z",
    "windgusts": 10.0,
    "windspeed": 8.4,
    "windspeedBft": 5,
    "winddirectiondegrees": 172
  },
  "43": {
    "$id": "46",
    "stationid": 6242,
    "stationname": "Meetstation Vlieland",
    "lat": 53.25,
    "lon": 4.92,
    "regio": "Vlieland",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Zwaar bewolkt",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/cc.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/cc",
    "winddirection": "ZZO",
    "airpressure": 1017.8,
    "temperature": 15.5,
    "groundtemperature": 14.4,
    "feeltemperature": 15.5,
    "visibility": 31900.0,
    "windgusts": 7.8,
    "windspeed": 6.3,
    "windspeedBft": 4,
    "humidity": 77.0,
    "winddirectiondegrees": 159
  },
  "44": {
    "$id": "47",
    "stationid": 6310,
    "stationname": "Meetstation Vlissingen",
    "lat": 51.45,
    "lon": 3.6,
    "regio": "Vlissingen",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Zwaar bewolkt",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/cc.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/cc",
    "winddirection": "ZO",
    "airpressure": 1017.2,
    "temperature": 16.3,
    "groundtemperature": 15.2,
    "feeltemperature": 16.3,
    "visibility": 44600.0,
    "windgusts": 7.9,
    "windspeed": 6.8,
    "windspeedBft": 4,
    "humidity": 74.0,
    "precipitation": 0.0,
    "sunpower": 0.0,
    "rainFallLast24Hour": 0.0,
    "rainFallLastHour": 0.0,
    "winddirectiondegrees": 143
  },
  "45": {
    "$id": "48",
    "stationid": 6375,
    "stationname": "Meetstation Volkel",
    "lat": 51.65,
    "lon": 5.7,
    "regio": "Uden",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Zwaar bewolkt",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/cc.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/cc",
    "winddirection": "ZO",
    "airpressure": 1019.3,
    "temperature": 13.4,
    "groundtemperature": 9.6,
    "feeltemperature": 13.4,
    "visibility": 42600.0,
    "windgusts": 3.4,
    "windspeed": 2.2,
    "windspeedBft": 2,
    "humidity": 78.0,
    "precipitation": 0.0,
    "sunpower": 0.0,
    "rainFallLast24Hour": 0.0,
    "rainFallLastHour": 0.0,
    "winddirectiondegrees": 142
  },
  "46": {
    "$id": "49",
    "stationid": 6215,
    "stationname": "Meetstation Voorschoten",
    "lat": 52.12,
    "lon": 4.43,
    "regio": "Voorschoten",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Zwaar bewolkt",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/cc.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/cc",
    "winddirection": "ZZO",
    "airpressure": 1017.6,
    "temperature": 14.5,
    "groundtemperature": 12.8,
    "feeltemperature": 14.5,
    "visibility": 49900.0,
    "windgusts": 4.5,
    "windspeed": 2.9,
    "windspeedBft": 2,
    "humidity": 74.0,
    "precipitation": 0.0,
    "sunpower": 0.0,
    "rainFallLast24Hour": 0.9,
    "rainFallLastHour": 0.0,
    "winddirectiondegrees": 156
  },
  "47": {
    "$id": "50",
    "stationid": 6319,
    "stationname": "Meetstation Westdorpe",
    "lat": 51.23,
    "lon": 3.83,
    "regio": "Terneuzen",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Zwaar bewolkt",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/cc.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/cc",
    "winddirection": "ZO",
    "airpressure": 1017.7,
    "temperature": 14.4,
    "groundtemperature": 13.5,
    "feeltemperature": 14.4,
    "visibility": 55200.0,
    "windgusts": 3.3,
    "windspeed": 1.3,
    "windspeedBft": 1,
    "humidity": 79.0,
    "precipitation": 0.0,
    "sunpower": 0.0,
    "rainFallLast24Hour": 0.0,
    "rainFallLastHour": 0.0,
    "winddirectiondegrees": 140
  },
  "48": {
    "$id": "51",
    "stationid": 6248,
    "stationname": "Meetstation Wijdenes",
    "lat": 52.63,
    "lon": 5.17,
    "regio": "Hoorn",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Zwaar bewolkt",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/cc.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/cc",
    "winddirection": "ZZO",
    "windgusts": 9.0,
    "windspeed": 7.3,
    "windspeedBft": 4,
    "winddirectiondegrees": 150
  },
  "49": {
    "$id": "52",
    "stationid": 6257,
    "stationname": "Meetstation Wijk aan Zee",
    "lat": 52.5,
    "lon": 4.6,
    "regio": "Wijk aan Zee",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Zwaar bewolkt",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/cc.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/cc",
    "temperature": 15.7,
    "groundtemperature": 15.1,
    "humidity": 71.0,
    "precipitation": 0.0,
    "sunpower": 0.0,
    "rainFallLast24Hour": 0.0,
    "rainFallLastHour": 0.0
  },
  "50": {
    "$id": "53",
    "stationid": 6340,
    "stationname": "Meetstation Woensdrecht",
    "lat": 51.45,
    "lon": 4.33,
    "regio": "Woensdrecht",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Zwaar bewolkt",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/cc.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/cc",
    "winddirection": "OZO",
    "airpressure": 1018.1,
    "temperature": 12.2,
    "groundtemperature": 8.8,
    "feeltemperature": 12.2,
    "visibility": 45200.0,
    "windgusts": 2.1,
    "windspeed": 1.2,
    "windspeedBft": 1,
    "humidity": 84.0,
    "precipitation": 0.0,
    "rainFallLast24Hour": 0.0,
    "rainFallLastHour": 0.0,
    "winddirectiondegrees": 123
  },
  "51": {
    "$id": "54",
    "stationid": 6239,
    "stationname": "Meetstation Zeeplatform F-3",
    "lat": 54.85,
    "lon": 4.73,
    "regio": "Noordzee",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Zwaar bewolkt",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/cc.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/cc",
    "winddirection": "Z",
    "airpressure": 1016.4,
    "temperature": 16.4,
    "feeltemperature": 14.6,
    "visibility": 31500.0,
    "windgusts": 12.3,
    "windspeed": 10.7,
    "windspeedBft": 5,
    "humidity": 70.0,
    "winddirectiondegrees": 174
  },
  "52": {
    "$id": "55",
    "stationid": 6252,
    "stationname": "Meetstation Zeeplatform K13",
    "lat": 53.22,
    "lon": 3.22,
    "regio": "Noordzee",
    "timestamp": "2021-09-28T20:50:00",
    "weatherdescription": "Zwaar bewolkt",
    "iconurl": "https://www.buienradar.nl/resources/images/icons/weather/30x30/cc.png",
    "graphUrl": "https://www.buienradar.nl/nederland/weerbericht/weergrafieken/cc",
    "winddirection": "Z",
    "windgusts": 17.2,
    "windspeed": 12.2,
    "windspeedBft": 6,
    "winddirectiondegrees": 180
  }
};

var redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

var blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

for (item of Object.keys(dataKNMI)) {
  const txt = `<p>${dataKNMI[item].stationname}, ${dataKNMI[item].stationid}<br>${dataKNMI[item].lat}, ${dataKNMI[item].lon}</p>`;
  const marker = L.marker([dataKNMI[item].lat, dataKNMI[item].lon], {
    icon: blueIcon
  }).addTo(locations);

  marker.bindPopup(txt);
}

for (let i = 0; i < dataRWS.length; i++) {
  const txt = `<p>${dataRWS[i].properties.label[0]}, ${dataRWS[i].properties.content[0][0].location}<br>${dataRWS[i].geometry.coordinates[1]}, ${dataRWS[i].geometry.coordinates[0]}</p>`;
  const marker = L.marker([dataRWS[i].geometry.coordinates[1], dataRWS[i].geometry.coordinates[0]], {
    icon: redIcon
  }).addTo(locations);

  marker.bindPopup(txt);
}

document.getElementById("fetch").addEventListener("click", function() {
  let IDRWS = document.getElementById("RWS_ID").value;
  let IDKNMI = document.getElementById("KNMI_ID").value;

  window.open(`http://localhost:3000/devTools/compareKNMI&RWS?RWS=${IDRWS}&KNMI=${IDKNMI}`, '_blank').focus();
});