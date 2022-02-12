import { displayPopUpWithName } from "./jsPopUps/functions.js"

export function redirect() {
  if (window.location.host == "dewindnu.herokuapp.com") window.location.replace(`https://dewindnu.nl${window.location.pathname}`)
  if (["over", "feedback", "credit", "contact", "disclaimer"].includes(location.hash.substring(1)))
    displayPopUpWithName(location.hash.substring(1))
}