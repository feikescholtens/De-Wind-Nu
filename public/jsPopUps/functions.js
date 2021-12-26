import { givePopUpData } from "./popUpData.js"
const popUpData = givePopUpData()

export function displayPopUp(content) {
  document.body.scrollTop = document.documentElement.scrollTop = 0;

  let messageBox = document.createElement("div")
  messageBox.classList.add("messageBox")
  messageBox.innerHTML = popUpData[content].html

  //Make close button
  let close = document.createElement("div")
  close.classList.add("close")
  close.textContent = "✖"
  close.addEventListener("click", function() {
    messageBox.remove()
    document.removeEventListener("click", checkClickFunc)
  });

  //Add elements to the DOM
  messageBox.appendChild(close)
  document.body.appendChild(messageBox)

  let checkClickFunc = function checkClick(evt) {
    let element = document.getElementsByClassName("messageBox")[0]
    var elementClicked = element.contains(evt.target)
    if (!elementClicked && evt.target.innerHTML !== "Verzenden") {
      messageBox.remove()
      document.removeEventListener("click", checkClickFunc)
    }
  }

  setTimeout(function() {
    document.addEventListener("click", checkClickFunc)
  }, 50);
}

//Feedback specific
export function emptyMessage(DOM_message) {
  DOM_message.placeholder = "Vul een bericht in!"
  DOM_message.classList.add("fillIn")
  DOM_message.style.border = "2px red solid"

  //When typed again in the field, remove the red border
  DOM_message.addEventListener("input", removeRed)

  function removeRed() {
    DOM_message.placeholder = "Verplicht"
    DOM_message.classList.remove("fillIn")
    DOM_message.style.border = "2px grey solid"
    DOM_message.removeEventListener("input", removeRed)
  }
}