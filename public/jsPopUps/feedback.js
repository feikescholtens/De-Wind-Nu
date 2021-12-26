import { displayPopUp, emptyMessage } from "./functions.js"

export async function feedback() {
  if (!document.getElementsByClassName("messageBox")[0]) {

    displayPopUp("feedback")

    //Handle when Send button is pressed
    document.getElementById("send").addEventListener("click", async () => {

      //Set variables according to input fields
      const name = document.getElementById("name").value,
        email = document.getElementById("email").value,
        DOM_message = document.getElementById("message"),
        message = DOM_message.value

      if (message == "") emptyMessage(DOM_message)
      else {

        document.getElementById("feedbackForm").remove()
        document.getElementById("send").remove()

        //Add the loader to the messageBox
        const loaderbox = document.createElement("div")
        const loader = document.createElement("div")
        loaderbox.id = "loader_boxPop"
        loader.id = "loader"
        loaderbox.appendChild(loader)
        document.getElementsByClassName("messageBox")[0].appendChild(loaderbox)

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

        //If response is back, remove loader
        if (document.getElementById("loader_boxPop")) {
          document.getElementById("loader_boxPop").remove()
        }
        const responseMessage = document.createElement("p")

        //If display message if email sent was succesful or not
        if (data == "250 2.0.0 OK") {
          responseMessage.textContent = "Verzenden gelukt, bedankt voor de feedback!"
          responseMessage.classList.add("success")
        } else {
          responseMessage.innerHTML = "Verzenden mislukt. Contacteer <a href='mailto:dewindnu@gmail.com'>dewindnu@gmail.com</a>"
          responseMessage.classList.add("fail")
        }
        document.getElementsByClassName("messageBox")[0].appendChild(responseMessage)

      }
    });

  }
}