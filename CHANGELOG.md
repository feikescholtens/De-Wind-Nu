# Change log

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