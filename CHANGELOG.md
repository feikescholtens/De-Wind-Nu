# Change log

## 3.5.8

- Updated Node to version 20, site should be functioning now

## 3.5.7

Bugfixes:
- KNMI changed their API endpoint

## 3.5.6

- KNMI overview measurements are not behind anymore and fixed that some locations didn't have any overview measurement at all. See backend work for reasoning
- Added locations D15 platform KNMI sensor, P11 platform KNMI sensor, K14 platform KNMI sensor, A12 platform KNMI sensor, L9 platform KNMI sensor, AWG platform KNMI sensor, J6 platform KNMI sensor, HKZA platform KNMI sensor, Assendelft, Muiden, Nieuw-Vennep, Nieuwkoop and Borssele Alpha platform KNMI sensor
- Changed data source Stroommeetpaal IJgeul, Huibertgat, Cadzand, Brouwershavense Gat, Vlakte van de Raan, Hansweert, Oosterschelde zeezijde (Schaar), Stavenisse and Marollegat from Rijkswaterstaat to KNMI
- Updated GitHub pages (readme) images

Bugfixes:
- Fixed some values not getting converted to Bft (for measurements between 56 and 63 knots, Bft force 11)

Backend work:
- Replaced Buienradar API with official KNMI EDR API for the overview page. Site is now completely independent of Buienradar and only uses the most direct, official and fastest API's :)
- Cleaned up locations.json file, lot less lines now. Code is now consistent with the use of RWS and not mixing up Rijkswaterstaat and RWS together (except for comments or quoted strings)

---

## v3.5.5

Bugfixes:
- Fixed site crashing due to timezone switch (DST) error

---

## v3.5.4

Bugfixes:
- Fixed forecast parse script crashing! Caused by missing forecast GRIB files from the Euros website, but the fault remained mainly by my not so great code

Backend work:
- Fixed the analytics not getting any updates. This was because I bundled the analytics script into the main Javascript file. Because this script changes via the URL, it didn't work. Now it is installed like it's supposed to be

---

## v3.5.3
- Improved performance by bundling even more stylesheets and scripts and using inline SVG icons instead of the big Material Symbols library

- Improved visibility of the popups by blurring and darkening the background

- Updated the coordinates of the Rijkswaterstaat locations using this sheet: https://rijkswaterstaatdata.nl/publish/pages/199518/locatiecodes_waswordt.xlsx. Affected locations: HKZA 1, HKZA 2 and Q1 platform

- Labels of the x-axis are now more logical, being either steps of 1 or 2 hours instead of labels going like this: 00:00, 00:50, 01:40, etc (thanks Ton Albers for the feedback/suggestion)

- Showing a visual indication when the high accuracy location on the map is being updated

- Improved popup visibility by giving it a shadow

- Showing a popup at the closest location to the user's location to hint the user to click a windsack and navigate towards the windPage 

Bugfixes:
- Fixed URL hashes when displaying / closing popups

---

## v3.5.2
- Site functioning again (see bugfixes), loading times should have increased by quite a bit

Bugfixes:
- Fixed uncached browsers error due to update 2.30.0 of date-fns (see backend work)

Backend work:
- Finally implemented a bundler (Rollup) which probably prevented the site from not functioning

---

## v3.5.1
- Added a windrose background to the current wind screen, giving the drawn arrows on the canvas instantly more meaning

- Switching dates doesn't require pressing the 'query' button anymore. The API's seem reliable enough that the data can instantly be requested as the date is changed with the arrows

- Using different API's for some locations now, so that gusts are available or so that the data updates faster. Modified locations: Houtribdijk, IJmuiden Buitenhaven, Vlieland, Wijdenes, Lauwersoog, Europlatform and Geulhaven radarpost

- Added locations: Buitengaats platform, F3-FB1 platform, Lichteiland Goeree KNMI sensor, Saba (Juancho E. Yrausquin Airport), Sint Eustatius (F. D. Roosevelt Airport) and Bonaire (Flamingo Airport)

- Some visual footer improvements: replaced checkboxes with sliders / switches

- Made settings button larger and added shadow

- Now showing a user an alert notifing them that their time zone differs from the 'Europe/Amsterdam' one on which the site is build on

Bugfixes:
- Finally wind gusts have returned by switching an API (see 'Backend work' down below)
- Wrong label 'Windvlagen' instead of 'Windsterkte verwachting' in tooltip windspeed chart, can't go wrong anymore now (knock knock) (thanks for the bugreport Lars)
- Fixed RWS locations requesting the same data for the first day of summertime (day when it switches) and second day of summertime. Additional (search) tags: DST, summertime, request, dates
- Fixed (new) KNMI API, MVB and VLINDER locations requesting wrong data of the day of switching to summertime. Added an explaination for it
- Fixed site not updating when changing theme from 'Dark' to 'Automatic' when Automatic resolves to be a light mode
- Fixed current wind box values and labels not resizing on very small screens

Backend work:
- Used some technically better operators in if-statements
- Replaced Buienradar API with official KNMI EDR API for the wind page

---

## v3.5.0
- Big update on location handling homepage. Now shows user's approximate location based on IP-address (except when user's on a VPN). Then show user popup or message in a newly added top bar to change the location preference to choose GPS based location

- Implemented high resolution (Retina) map tiles. Limit 5000 API requests per day, after that limit clients automatically fall back on non-retina tiles as before

- Using 'verwachting' now instead of 'voorspelling'. We don't have crystal balls unfortunately

- When going back from windpage to homepage, the pan and zoom of map are now 'remembered'. This was already the case in most browsers, but some browsers (Edge and Opera) reload the page when clicking back

Bugfixes:
- Small bug on a spot (Borsele Alpha) where only wind direction measurements are available
- Replace decimal points by decimal comma's in wind direction's chart y-ticks

Backend work:
- Cleaned up code both on the front- and backend
- Reorganized 'Project files' folder. Stuff in 'archive' now has no future potential anymore but the code may still be useful. Deletes old code is not going to be used again
- Added some experimentation notebooks for parsing the wind archive of the KNMI (where data goes back to 2003) and parsing NetCDF files of the KNMI measurements to these folders
- Some small preparations for switching to official KNMI API

---

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
- Fixed negative relative time overview data Buienradar

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