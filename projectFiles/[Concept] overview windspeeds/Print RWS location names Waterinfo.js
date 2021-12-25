import { addMinutes } from "date-fns";
import fetch from "node-fetch";


const rawData = await fetch("https://waterinfo.rws.nl/api/theme?themeMap=Waterbeheer").then(response => response.json())
const latestValues = rawData.features[rawData.features.length - 1].features
let betterData = []

latestValues.forEach((measurement) => {
  for (let i = 0; i < measurement.properties.measurements.length; i++) {

    if (measurement.properties.measurements[i].parameterId.includes("Windsnelheid") || measurement.properties.measurements[i].parameterId.includes("Windrichting")) {
      betterData.push(measurement.properties.measurements[i])
    }


  }

})

console.log(betterData)

let names = []

betterData.forEach(location => names.push(location.locationCode))

names.sort()

names.forEach(name => console.log(name))

console.log(names.length)