import { redirect } from "../redirect.js"
redirect()

window.onload = async function() {
  document.querySelector("[data-goBack]").addEventListener("click", () => {
    if (document.referrer.indexOf(window.location.host) !== -1) history.back()
    else window.location.replace(window.location.origin)
  })
}