//Import dependencies
import express from "express"
import path from "path"
import cors from "cors"
import { readFileSync } from "fs"
import { getData } from "./getData.js"
import { getOverviewData } from "./getOverviewData.js"
import { addLocation } from "./addLocation.js"
import { addFeedback } from "./addFeedback.js"

//Define variables
const __dirname = path.resolve()
const app = express()
const port = process.env.PORT || 3000
const locations = JSON.parse(readFileSync("locations.json"))
const locationsString = JSON.stringify(locations)

//Initialize Express
app.listen(port, () => console.log("server running at port " + port))
app.use(express.json({ limit: "500kb" }))

app.use("/", express.static(path.resolve(__dirname, "public/homepage")))
app.use("/wind/", express.static(path.resolve(__dirname, "public/windPage")))
app.use("/error", express.static(path.resolve(__dirname, "public/errorPage")))

app.use("/jsPopUps", express.static(path.resolve(__dirname, "public/jsPopUps")))
app.use("/images", cors(), express.static(path.resolve(__dirname, "public/images")))
app.use("/generalStyles.css", express.static(path.resolve(__dirname, "public/generalStyles.css")))
app.use("/redirect.js", express.static(path.resolve(__dirname, "public/redirect.js")))

app.set("view-engine", "ejs")
app.set("views", path.join(__dirname, "/public/windPage/"))

//Add location API and DOTENV, only on localhost
if (port == 3000) {
  const dotenv = await import("dotenv")
  dotenv.config()

  app.post("/addLocation", (request) => addLocation(request, locations))

  app.use("/devTools/addLocation", express.static(path.resolve(__dirname, "public/devTools/addLocation")))
  app.use("/devTools/stations", express.static(path.resolve(__dirname, "public/devTools/stations")))
  app.use("/devTools/compareKNMI&RWS", express.static(path.resolve(__dirname, "public/devTools/compareKNMI&RWS")))
}

//Homepage API
app.get("/", (request, response) => response.render(path.join(__dirname, "/public/homepage/index.ejs"), { locationsString }))

//Server wind page API
app.get("/wind/:id", async (request, response) => {
  const dataText = await getData(request, response, locations)
  const data = JSON.stringify(dataText)

  if (data) response.render(path.join(__dirname, "/public/windPage/index.ejs"), { data })
})

//Overview API
app.get("/getOverviewData/:dataSource", (request, response) => getOverviewData(request, response, locations))

//Add data to database when feedback received
app.post("/addFeedback", (request, response) => addFeedback(request, response))

//Fetching and extracting test file using public KNMI keys
import schedule from 'node-schedule'
import fetch from "node-fetch"
import { createWriteStream, createReadStream, unlink } from "fs"
import { add } from "date-fns"
import tar from "tar-fs"

async function fetchFile() {
  app.use("/harm40_v1_p3_2022012912/HA40_N55_202201291200_04800_GB", express.static(path.resolve(__dirname, "public/harm40_v1_p3_2022012912/HA40_N55_202201291200_04800_GB")))


  unlink("public/harm40_v1_p3_2022012912.tar", () => {});
  const date = add(new Date(), { seconds: 5 });
  const j = schedule.scheduleJob(date, async () => {
    console.log("Fetching test file")
    const res = await fetch("https://knmi-kdp-datasets-eu-west-1.s3.eu-west-1.amazonaws.com/harmonie_arome_cy40_p3/0.2/harm40_v1_p3_2022012912.tar?response-content-disposition=attachment%3B%20filename%3D%22harm40_v1_p3_2022012912.tar%22&x-user=5ecb8b07b2f1b500011d5297&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAZWFCFU66J3AJUBMX%2F20220129%2Feu-west-1%2Fs3%2Faws4_request&X-Amz-Date=20220129T210602Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEM3%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCWV1LXdlc3QtMSJIMEYCIQCDzyxLL5AxyqRihCA7zsfLEbiK1fmNe8TzjpxNFHAfvgIhAKDHlZcC4iISwJVml97d2ux1QCs1X91V9%2FS4w9JExL0aKrECCPb%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQAhoMNjY2MDYwMDQwMTI0IgxGcNJuOZ5%2BKna4CpAqhQK%2FVSrBnfyiJl5jtBrUBMAPYM%2FwrWEoZm%2B8cP1pgGJLldIH7n%2Fwr0sZ1oa%2FRlkRpJbnCDg%2F%2FDq5WS7pRfogjoKyzGDLamf%2Bf5Cx5CA%2FGCfb7IN1suxmcD4bPlIUGM8Fo%2BvUUm1l5wRddUsIpiIpyELTIJd%2FisnZTIWjkvwbDNad2h3go9BNRp16BtMbrNXIQHeHYBACj1IZkFyij6GiNl%2BAMNFU25OTIHXtIsPDaiYVewa4BSKB%2BITN9qUHefT34im5CzhuVR94Ts68yHXUGQ6%2BU2PQ6pDj7XWX77Yo6tz4RX9%2B3akhqtNDnWL8M7BQQOP1KQCqXEjQPgArsCpED7g6kfdiuB4woMzWjwY6mQEXO4qyyx7sEEeFSyDpNVYLcPfv1sDzgM2RC%2F8pTIxTQTspbQ30V5GvzUrxr2jsHORhf5irJYwbdckfc8cTF23l3LBbWItK0rqy9psXWA0TaFcZfGbqH8NxvjmIWP8gR5hFs9XcS64VUoRPS35h2DuqryFGR%2Bv6YXMGUGvK%2Bb5ArXf%2FJmMGvOula%2BVH%2BC5c9uoZFxZrBYth2R4%3D&X-Amz-Signature=261378d42cd118d1db3d73bfd3de1914b72df02cc912fdaa0196d433805a8dd1");
    const fileStreamData = createWriteStream("public/harm40_v1_p3_2022012912.tar");
    await new Promise((resolve, reject) => {
      res.body.pipe(fileStreamData);
      res.body.on("error", reject);
      fileStreamData.on("finish", () => {
        resolve()
        console.log("Finisched fetching test file!")
      });
    });

    var tarFile = "public/harm40_v1_p3_2022012912.tar";
    var target = "public/harm40_v1_p3_2022012912";

    // extracting a directory
    createReadStream(tarFile).pipe(tar.extract(target));

    unlink("public/harm40_v1_p3_2022012912.tar", () => {});

  });
  console.log(j.pendingInvocations[0].fireDate)
}

import EcLib from "eccodes-lib"
const data = readFileSync("test.grib2")

const libA = new EcLib()
libA.load([data])
  .then(() => console.log(libA.getEnv()))



//If unknown url is typed in
app.use("/*", (request, response) => response.redirect("/"))