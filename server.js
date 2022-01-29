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

app.use("/harm40_v1_p3_2022012912.tar", express.static(path.resolve(__dirname, "public/harm40_v1_p3_2022012912.tar")))
import schedule from 'node-schedule'
import fetch from "node-fetch"
import { createWriteStream } from "fs"
const date = new Date(2022, 0, 29, 21, 15, 30);
const j = schedule.scheduleJob(date, async () => {
  console.log("Fetching test file")
  const res = await fetch("https://knmi-kdp-datasets-eu-west-1.s3.eu-west-1.amazonaws.com/harmonie_arome_cy40_p3/0.2/harm40_v1_p3_2022012912.tar?response-content-disposition=attachment%3B%20filename%3D%22harm40_v1_p3_2022012912.tar%22&x-user=5ecb8b07b2f1b500011d5297&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAZWFCFU66F3E5CNO5%2F20220129%2Feu-west-1%2Fs3%2Faws4_request&X-Amz-Date=20220129T195205Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEMv%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCWV1LXdlc3QtMSJHMEUCIQCh%2FcLVQOboHJmal%2FYrBRWaXdMbH%2BhNwWhsHDYbW4SDCAIgGvS6cKP7Xmo6p7O66OGdq2NSPJidOxRO1JAGSPr6mkUqsQII9P%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARACGgw2NjYwNjAwNDAxMjQiDM7IzqIk1jht%2FT2DhCqFAjYEs%2FN0Bc2bn7HfkExgkdnYNHt9VYJMn3Io2UiXkIzvBLTQiU%2F2B8jQEx49VKiG5W4YVMEbO%2Bd9yhN5imZqTglTAuzzuSAKTQr11lX%2BIbHQJUWUpLjVmepyGXQXgZT6UYwkN1Wt82UleRgOJawIyRGvuNMUM6EOUzDkZ%2F8hsGbFe8tK0NWpjzvaaxI2BPTx43VqeVksFx2V%2B9ILQq5hKLnHXOW7UW5T%2BcwtQ56niBQ4hfzM3lwPeBvvXqY5q%2BH95bpLLTxLMq8WJ82PEPfwJ45rXoTpC1IjVP%2BUAYtd6%2Fd%2FMfT1TQBbs8ZWqt8WST0hqi4sZ5X6iXo4mux6nnKlw0Z1rb%2FX7jCyndaPBjqaAdCp3RAe6Uv1mvhzORGwTmRtuu2WC69Wr8lEv%2FoKTSRJnSOMkBmW62TVryyPW0G4VJWzXoKKERHUHAiWDU4SiEHdH01zrClLtsfVIsaVlrzRghiYRBluiLv2JkQA%2B9CeBQri9YTyG1yoFwpBb25b5JDpC6qHvJ6zq5G8yJb90SRD5gp%2BH9k1yEQq1godSld5E8B2ni72xDDs0s0%3D&X-Amz-Signature=a1fc420853dfdb9b4f5daa86e81c009809007d0c31f1d4b01fe4428765aa3605");
  const fileStreamData = createWriteStream("public/harm40_v1_p3_2022012912.tar");
  await new Promise((resolve, reject) => {
    res.body.pipe(fileStreamData);
    res.body.on("error", reject);
    fileStreamData.on("finish", () => {
      resolve()
      console.log("Finisched fetching test file!")
    });
  });
});
console.log(j.pendingInvocations[0].fireDate)

//If unknown url is typed in
app.use("/*", (request, response) => response.redirect("/"))