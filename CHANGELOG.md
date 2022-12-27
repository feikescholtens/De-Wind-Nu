# Change log

## v3.4.0
- Lot of UI work with bigger buttons and more icons

- Fixed preloading of icons as soon as page loads

- Added a settings button to make it more clear that there's a lot of customization possible

Bugfixes:
- Fixed map having wrong width and height due to using vw and vh which can vary a lot on mobile (now they won't)

---

## v3.3.0
- Switched to Google App Engine from Heroku, seems to load a lot faster now

- Map now shows user's location and zooms to that place. This results in less panning of the map. Tapping the logo switches between an overview of the locations and a zoomed in view to the user's location of the spots nearby

- By default the map tiles now change automatically based on the theme. This can be overwritten by changing the settings.

- Improved navigation with the logo and title, now uses browsers 'back' feature which doesn't require a reload

- Updated the locations: deleted double locations Vlissingen and Q1-A platform (Hoorn) and Marker Wadden, added Markermeer midden, Marollegat, HKZA platform 2, HKZA platform 1 and North Cormorant platform

Bugfixes:
- Finally fixed issue where Rijkswaterstaat's overview data doesn't update in the markers on the map
- Fixed site crashing when giving invalid ID in URL
- Fixed alt text of icons showing before loaded. Now shows the 'unknown icon' symbol
- Fixed changing interpolation setting requires a reload
- Fixed decimal points showing instead of commas when users browser was set to English. To be inline with the Dutch content, I fixed this
- Fixed last timezone switch issues

Backend work:
- Started experimenting with Rijkswaterstaat's WTZ viewer to look at the opportunity of implementing currents
- Prepared for the timezone change on October 30th

---

## v3.2.2

Bugfixes:
- Fixed MVB API unreachable & lack of forecast crashing site
- Small UI bug fixed
- Removed addLocation dev route

---

## v3.2.1

Bugfixes:
- Fixed negative relative time overview data KNMI

---

## v3.2.0
- Added a list overview for the locations, sorted by distance

- Added more info about the latest measurement in the map view form

Bugfixes:
- Red closing cross is now red on Safari mobile
- Proper error handling when MVB and VLINDER API's fail
- Scrollable body on Safari which is annoying scrolling through graphs
- Logo click to go home now works on Safari
- Some other small UI issues

---

## v3.1.2

Bugfixes:
- Fixed text displaying not correct on IOS devices
- Fixed table headings not being updated
- Fixed dispaymode error on Safari
- Fixed error where forecast would not get updated on scedule

---

## v3.1.1

Bugfixes:
- Fixed ALL API's requesting wrong data

---

## v3.1.0
- Darkmode!

- Made a satellite map available

- Made site faster by reducing HTTP requests for .json files and 'compressing' .svg logo

- Hiding datasets in graphs are now 'remembered'

Bugfixes:
- Fixed VLINDER requesting wrong times

---

## v3.0.1

Bugfixes:
- Fixed crashing site when date not specified in request query params

---

## v3.0.0
- Added support for retrieving measurements from the past, forecast from the past, which is archived in Cloud Firestore, and the forecast of the next day(s)

- Added explanation for getting the right forecast for the requested date

- Switched to CSS grid for settings sections

Bugfixes:
- Fixed interpolated colour
- Fixed 2 decimals in dataset labels when unit is Bft
- Incorrect wind direction in letters fixed
- Error when converting forecast to Bft when is wasn't available

---

## Previous versions see commit messages