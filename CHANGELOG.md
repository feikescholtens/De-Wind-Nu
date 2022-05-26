# Change log

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