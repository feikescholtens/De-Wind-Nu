import { contentUpdate } from "./contentUpdate.js"
import { tooltipLine } from "../js/objects/chartData.js"
import {
  addHours,
  differenceInCalendarDays,
  isYesterday,
  isTomorrow,
  isToday,
  addDays,
  format,
  subDays,
  parse,
  startOfDay
} from "date-fns"
import nl from "date-fns/locale/nl"

export function changeDataForm(selector, e) {

  let clickedOption
  if (e) clickedOption = e.target.textContent.substring(1) //When using tabs
  else clickedOption = selector.value //When using selector in settings

  //Check if the dataForm is changed at all
  if (["Grafieken", "graphs"].includes(clickedOption) && localStorage.getItem("dataForm") == "graphs") return
  if (["Tabel", "table"].includes(clickedOption) && localStorage.getItem("dataForm") == "table") return

  if (["Grafieken", "graphs"].includes(clickedOption)) {
    selector.value = "graphs"
    document.querySelector("[data-graphs]").classList.add("active")
    document.querySelector("[data-table]").classList.remove("active")
    document.querySelector(".tabIndicator").style.left = `calc(0 * 120px)`
  }
  if (["Tabel", "table"].includes(clickedOption)) {
    selector.value = "table"
    document.querySelector("[data-graphs]").classList.remove("active")
    document.querySelector("[data-table]").classList.add("active")
    document.querySelector(".tabIndicator").style.left = `calc(1 * 120px + 5px)`
  }

  localStorage.setItem("dataForm", selector.value)

  contentUpdate()

}

export function changeInterpolation(interpolationSelector) {
  let value
  if (interpolationSelector.checked == false) {
    value = "0"
  } else {
    value = "1"
  }

  localStorage.setItem("interpolation", value)
  globalThis.interpolation = value

  contentUpdate()
}

export async function formulateErrorMessage(dataFetched) {
  let message
  const errorMessages = {
    "400": "Geen of foute ID in de URL gevonden, of er bestaat geen locatie bij de gegeven ID!",
    "204": "Er zijn geen gegevens beschikbaar voor deze locatie en deze datum!",
    "504": "De API heeft geen reactie verzonden (Gateway Timeout server)! Probeer het opnieuw."
  }
  const errorID = JSON.stringify(dataFetched.errorCode)

  if (Object.keys(errorMessages).includes(errorID)) {
    message = `Er is een fout opgetreden (error ${errorID}): ${errorMessages[errorID]}`
  } else if (errorID[0] == 5)
    message = `Er is een fout opgetreden (error ${errorID}): Server fout`
  else {
    message = `Er is een onbekende fout opgetreden!`
  }
  return message
}

export function showErrorMessage() {
  document.querySelector("[data-errorFetching]").classList.remove("noDisplay")
}

export function hideErrorMessage() {
  document.querySelector("[data-errorFetching]").classList.add("noDisplay")
}


export function hideMain() {
  document.getElementsByTagName("main")[0].classList.add("hidden")
}

export function showMain() {
  document.getElementsByTagName("main")[0].classList.remove("hidden")
}

export function showLoader() {
  document.querySelector("[data-markerContainer]").style.display = "block"
  document.querySelector("[data-loaderText]").style.display = "block"
}

export function hideLoader() {
  document.querySelector("[data-markerContainer]").style.display = "none"
  document.querySelector("[data-loaderText]").style.display = "none"
}

export function setNewNumber() {
  const latestNumber = document.getElementsByClassName("marker")[0].innerText
  const newNumber = parseInt(String(Math.random())[2])

  if (latestNumber !== newNumber) {
    document.getElementsByClassName("marker")[0].innerText = parseInt(String(Math.random())[2])
  } else {
    setNewNumber()
  }
}

export function showCurrentWindBox() {
  document.querySelector("[data-headingcurrentwind]").classList.remove("noDisplay")
  document.querySelector("[data-currentwindbox]").classList.remove("noDisplay")
  document.querySelector("[data-compass]").classList.remove("noDisplay")
}

export function hideCurrentWindBox() {
  document.querySelector("[data-headingcurrentwind]").classList.add("noDisplay")
  document.querySelector("[data-currentwindbox]").classList.add("noDisplay")
  document.querySelector("[data-compass]").classList.add("noDisplay")
}

export function calcInterpolation() {

  let interpolatedData = { windSpeed: [], windGusts: [], windDirection: [] },
    interpolatedIndices = { windSpeed: [], windGusts: [], windDirection: [] }

  const arraysToInterpolate = ["windSpeed", "windGusts", "windDirection"]
  arraysToInterpolate.forEach(dataType => {
    for (let i = 0; i < data[dataType].length; i++) {
      let j

      if (data[dataType][i] < 0) {
        for (j = i + 1; j < data[dataType].length; j++) {
          if (data[dataType][j] >= 0) break
        }

        const startIndex = i - 1,
          stopIndex = j

        for (let k = startIndex; k < stopIndex - 1; k++) {
          const startValue = parseFloat(data[dataType][startIndex]),
            stopValue = parseFloat(data[dataType][stopIndex])
          const value = startValue + ((stopValue - startValue) / (stopIndex - startIndex)) * (k + 1 - startIndex)

          interpolatedData[dataType].push({ time: times[k + 1], index: k + 1, value: value })
          interpolatedIndices[dataType].push((k + 1))
        }
        i = j
      }
    }
  })

  return { interpolatedData: interpolatedData, interpolatedIndices: interpolatedIndices }
}

export function checkInterpolated(ctx, dataType, value) {
  if (interpolatedIndices[dataType].includes(ctx.p0DataIndex + 1) || interpolatedIndices[dataType].includes(ctx.p0DataIndex)) return value
}

export function newChartOptions(datasets, options) {
  return {
    type: "line",
    data: {
      labels: times,
      datasets: datasets
    },
    options: options,
    plugins: [tooltipLine]
  }
}

export function setLabelPostitions(labels, percentages) {
  for (let i = 0; i < labels.length; i++) {
    labels[i].style.top = percentages[i] + "%"
  }
}

export function changeTableSort(tableSort) {

  if (localStorage.getItem("tableSort") == "ascending") {
    localStorage.setItem("tableSort", "descending")
    tableSort.innerHTML = `Tijd <span id="sortArrow">▲</span>`
  } else if (localStorage.getItem("tableSort") == "descending") {
    localStorage.setItem("tableSort", "ascending")
    tableSort.innerHTML = `Tijd <span id="sortArrow">▼</span>`
  }

  contentUpdate()

}

export function getAbsoluteDate(date) {
  if (date == "Eergisteren") return subDays(new Date(), 2)
  else if (date == "Gisteren") return subDays(new Date(), 1)
  else if (date == "Vandaag") return new Date()
  else if (date == "Morgen") return addDays(new Date(), 1)
  else if (date == "Overmorgen") return addDays(new Date(), 2)
  else return parse(date.substring(4), "d MMM yyyy", new Date(), { locale: nl })
}

export function getRelativeDate(date) {
  if (differenceInCalendarDays(date, new Date()) == -2) return "Eergisteren"
  else if (isYesterday(date)) return "Gisteren"
  else if (isToday(date)) return "Vandaag"
  else if (isTomorrow(date)) return "Morgen"
  else if (differenceInCalendarDays(date, new Date()) == 2) return "Overmorgen"
  else return format(date, "eeeeee. d MMM yyyy", { locale: nl })
}

export function switchPreviousDay() {
  const currentDate = document.querySelector("[data-currentDay]").innerText
  const absoluteDate = getAbsoluteDate(currentDate)

  const previousDay = subDays(absoluteDate, 1)
  const relativePreviousDay = getRelativeDate(previousDay)

  document.querySelector("[data-currentDay]").innerText = relativePreviousDay
  setDateInUrl(previousDay)
  document.querySelector("[data-datePicker]").value = format(previousDay, "yyyy-MM-dd")
}

export function switchNextDay() {
  const currentDate = document.querySelector("[data-currentDay]").innerText
  const absoluteDate = getAbsoluteDate(currentDate)

  const nextDay = addDays(absoluteDate, 1)
  if (startOfDay(nextDay) > startOfDay(globalThis.datePickerMax)) return

  const relativeNextDay = getRelativeDate(nextDay)

  document.querySelector("[data-currentDay]").innerText = relativeNextDay
  setDateInUrl(nextDay)
  document.querySelector("[data-datePicker]").value = format(nextDay, "yyyy-MM-dd")
}

export function setDateInUrl(date) {
  if (isToday(date)) {
    history.replaceState(null, null, `${window.location.origin + window.location.pathname}`)
    return
  }

  const dateString = format(date, "dd-MM-yyyy")
  history.replaceState(null, null, `?datum=${dateString}`)
}

export function getDatePickerMax() {

  const date = new Date()
  if (new Date().getTimezoneOffset() == -60) date.setHours(9)
  else date.setHours(10)
  date.setMinutes(58)


  if (new Date() > date) return addHours(new Date(), 48)
  else {
    return addHours(new Date(), 24)
  }

}

export function isIOS() {
  return ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(navigator.platform) ||
    (navigator.userAgent.includes("Mac") && "ontouchend" in document)
}

export function checkWrapFlexNavBar(unHideNavBar) {
  const navBar = document.getElementById("locationDate")

  //This is the case when the page is not resized but loaded
  if (navBar.scrollWidth > navBar.clientWidth && globalThis.overflowWidth == 0) {
    navBar.style.flexWrap = "wrap"
    globalThis.overflowWidth = navBar.clientWidth
    navBar.classList.remove("hidden")
    return
  }

  //Check if navBar overflows and if so, update global variable overflowWidth with the largest value for which the content overflows
  //Any width under this critical number will overflow the navBar in any case, therefore the largest number is decisive
  //At this critical width we switch for wrapping the flexbox container or the text of the location
  if (navBar.scrollWidth > navBar.clientWidth && navBar.clientWidth > globalThis.overflowWidth) {
    globalThis.overflowWidth = navBar.clientWidth
  }

  //If navBar overflows, wrap flexbox container, else wrap the words of the location
  if (navBar.clientWidth < globalThis.overflowWidth) navBar.style.flexWrap = "wrap"
  else navBar.style.flexWrap = ""

  if (unHideNavBar) navBar.classList.remove("hidden")
}