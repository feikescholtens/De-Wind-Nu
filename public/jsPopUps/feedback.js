import { displayPopUp, emptyMessage } from "./functions.js"

export async function displayPopUpFeedback() {

  if (!document.getElementsByClassName("messageBox")[0]) {

    displayPopUp("feedback")

    const popUpBox = document.getElementsByClassName("messageBox")[0]

    document.querySelector("[data-send]").addEventListener("click", async () => {

      //Set variables according to input fields
      const name = document.querySelector("[data-name]").value,
        email = document.querySelector("[data-email]").value,
        messageContainer = document.querySelector("[data-message]"),
        message = messageContainer.value

      if (message == "") emptyMessage(messageContainer)
      else {

        document.querySelector("[data-feedbackForm]").remove()
        document.querySelector("[data-send]").remove()

        //Add the loader to the messageBox
        document.getElementsByClassName("markerContainer center hidden")[0].classList.remove("hidden")

        //Data for making the fetch command
        const dataBody = {
          name: JSON.stringify(name),
          email: JSON.stringify(email),
          message: JSON.stringify(message)
        }
        const options = {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(dataBody)
        }

        //Fetch the data to the server
        const data = await fetch("/addFeedback", options)
          .then(response => response.text())

        document.getElementsByClassName("markerContainer center")[0].remove()

        const responseMessage = document.createElement("p")

        //If display message if email sent was succesful or not
        if (data == "250 2.0.0 OK") {
          responseMessage.textContent = "Verzenden gelukt, bedankt voor de feedback!"
          responseMessage.classList.add("success")
        } else {
          responseMessage.innerHTML = "Verzenden mislukt. Contacteer <a href='mailto:dewindnu@gmail.com'>dewindnu@gmail.com</a>"
          responseMessage.classList.add("fail")
        }
        popUpBox.appendChild(responseMessage)

      }
    })

  }
}