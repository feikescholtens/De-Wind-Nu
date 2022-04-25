import { redirect, updateLocalVariables } from "../globalFunctions.js"
redirect()
updateLocalVariables()

window.onload = async function() {
  document.querySelector("[data-goBack]").addEventListener("click", () => {
    if (document.referrer.indexOf(window.location.host) !== -1) history.back()
    else window.location.replace(window.location.origin)
  })
}