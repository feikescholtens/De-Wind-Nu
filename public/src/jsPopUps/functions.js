import { popUpData } from "./popUpData.js"

export function displayPopUpWithName(name) {
  if (!document.getElementsByClassName("messageBox")[0])
    displayPopUp(name)
}

export function displayPopUp(content) {
  window.location.hash = content

  let messageBox = document.createElement("div")
  messageBox.classList.add("messageBox")
  messageBox.innerHTML = `<div class="scrollWrapper">${popUpData[content].html}</div>`

  //Make close button
  let close = document.createElement("div")
  close.classList.add("close")
  close.setAttribute("title", "Sluit popup")
  close.innerHTML = `<div>
  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 96 960 960" width="24"><path d="M480 642 282 840q-14 14-33 14t-33-14q-14-14-14-33t14-33l198-198-198-198q-14-14-14-33t14-33q14-14 33-14t33 14l198 198 198-198q14-14 33-14t33 14q14 14 14 33t-14 33L546 576l198 198q14 14 14 33t-14 33q-14 14-33 14t-33-14L480 642Z"/></svg>
  </div>`
  close.addEventListener("click", removePopUp)

  //Add elements to the DOM
  messageBox.appendChild(close)
  document.body.appendChild(messageBox)

  //Blur the background
  function addCSSWithClassName(css, className) {
    const cssElement = document.createElement("style")
    cssElement.classList.add(className)
    document.head.appendChild(cssElement).innerHTML = css
  }

  if (document.body.classList.contains("dark")) addCSSWithClassName("body > *:not(.messageBox) { filter: blur(35px) brightness(0); }", "cssBlurBackground")
  else addCSSWithClassName("body > *:not(.messageBox) { filter: blur(35px) }", "cssBlurBackground")
  ///////

  const checkClickFunc = function(evt) {
    const element = document.getElementsByClassName("messageBox")[0]
    const elementClicked = element.contains(evt.target)
    if (!elementClicked && evt.target.innerHTML !== "Verzenden")
      removePopUp()
  }

  setTimeout(() => document.addEventListener("click", checkClickFunc), 10) //Wihtout the timer the popup gets closed immediately after clicking

  function removePopUp() {

    messageBox.remove()
    document.querySelector(".cssBlurBackground").remove() //Remove blur from the background
    history.replaceState(null, null, " ") //Removes hash from URL
    document.removeEventListener("click", checkClickFunc)
    //To show user popup about making choice about location preference: (location preference can never be already chosen when user has first visit)
    if (document.querySelector(".circleCurrentLocation")) document.querySelector(".circleCurrentLocation").click()

  }
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