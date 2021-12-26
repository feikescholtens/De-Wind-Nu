import { displayPopUp } from "./functions.js"

export function contact() {
  if (!document.getElementsByClassName("messageBox")[0]) {

    displayPopUp("feedback")
  }
}