import { displayPopUp } from "./functions.js"

export function credit() {
  if (!document.getElementsByClassName("messageBox")[0]) {

    displayPopUp("credit")
  }
}