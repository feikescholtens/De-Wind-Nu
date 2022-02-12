import { redirect } from "../redirect.js"
redirect()

window.onload = async function() {

  const errors = await fetch("errors.json")
    .then(response => response.json())

  const params = new URLSearchParams(window.location.search)
  let error;
  for (const param of params) {
    error = param[1]
  }

  for (let i = 0; i < errors.length; i++) {
    if (error == errors[i][0]) {
      document.getElementById("error").innerHTML = `Er is een fout opgetreden!<br>${error}: ${errors[i][1]}`
      break
    } else {
      document.getElementById("error").innerHTML = `Er is een onbekende fout opgetreden!`
    }
  }

  window.history.replaceState("De Wind Nu: fout opgetreden", "De Wind Nu: fout opgetreden", `/fout/${error}`)
  document.querySelector("[data-goBack]").addEventListener("click", () => history.back())
}