function feedback() {
  if (document.getElementsByClassName("messageBox")[0] == undefined) {

    //Scroll to top
    document.body.scrollTop = document.documentElement.scrollTop = 0;

    //Define messageBox element
    let messageBox = document.createElement("div");
    messageBox.classList.add("messageBox");
    messageBox.innerHTML = `
    <h3>Geef feedback</h3>
    <p class="messageBoxP">Feedback wordt erg gewaardeerd. Dit kan in de vorm van fouten/bugs, tips, gewenste functies, noem
      maar op.
      Alles is mogelijk, vul onderstaand formulier in om feedback te verzenden.</p>
    
    <table id="feedbackForm">
      <tr>
        <td><label for="name">Je naam</label></td>
        <td><input id="name" type="text" placeholder="Optioneel"></td>
      </tr>
    
      <tr>
        <td><label for="email">Je e-mail</label></td>
        <td><input id="email" type="email" placeholder="Optioneel"></td>
      </tr>
    
    
      <tr>
        <td><label for="message">Je bericht*</label></td>
        <td><textarea oninput='this.style.height = "";this.style.height = this.scrollHeight + "px"' placeholder="Verplicht" id="message"></textarea></td>
      </tr>
    
    </table>
    
    <button id="send">Verzenden</button>
    `;

    //Make close button
    let close = document.createElement("div");
    close.classList.add("close");
    close.textContent = "✖";
    close.addEventListener("click", function () {
      messageBox.remove();
      document.removeEventListener("click", checkClickFunc);
    });

    //Add elements to the DOM
    messageBox.appendChild(close);
    document.body.appendChild(messageBox);

    //Handle when Send button is pressed
    document.getElementById("send").addEventListener("click", function () {

      //Set variables according to input fields
      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const DOM_message = document.getElementById("message");
      const message = DOM_message.value;

      if (message == "") {

        DOM_message.placeholder = "Vul een bericht in!";
        DOM_message.classList.add("fillIn");
        DOM_message.style.border = "2px red solid";

        //When typed again in the field, remove the red border
        DOM_message.addEventListener("input", removeRed);

        function removeRed() {
          DOM_message.placeholder = "Verplicht";
          DOM_message.classList.remove("fillIn");
          DOM_message.style.border = "2px grey solid";
          DOM_message.removeEventListener("input", removeRed);
        }

        //If it is not empty, proceed to send the data
      } else {

        //Remove the forum and Send button
        document.getElementById("feedbackForm").remove();
        document.getElementById("send").remove();

        //Add the loader to the messageBox
        let loaderbox = document.createElement("div");
        let loader = document.createElement("div");
        loaderbox.id = "loader_boxPop";
        loader.id = "loader";
        loaderbox.appendChild(loader);
        document.getElementsByClassName("messageBox")[0].appendChild(loaderbox);

        //Data for making the fetch command
        const data = {
          name: JSON.stringify(name),
          email: JSON.stringify(email),
          message: JSON.stringify(message)
        };
        const options = {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        };

        //Fetch the data to the server
        fetch("/addFeedback", options)
          .then(response => response.text())
          .then(data => {

            //If response is back, remove loader
            if (document.getElementById("loader_boxPop")) {
              document.getElementById("loader_boxPop").remove();
            }
            let message = document.createElement("p");

            //If display message if email sent was succesful or not
            if (data == "250 2.0.0 OK") {
              message.textContent = "Verzenden gelukt, bedankt voor de feedback!";
              message.classList.add("success");
            } else {
              message.innerHTML = "Verzenden mislukt. Contacteer <a href='mailto:dewindnu@gmail.com'>dewindnu@gmail.com</a>";
              message.classList.add("fail");
            }
            document.getElementsByClassName("messageBox")[0].appendChild(message);
          });
      }
    });

    let checkClickFunc = function checkClick(evt) {
      let element = document.getElementsByClassName("messageBox")[0];
      var elementClicked = element.contains(evt.target);
      if (!elementClicked && evt.target.innerHTML !== "Verzenden") {
        messageBox.remove();
        document.removeEventListener("click", checkClickFunc);
      }
    }

    setTimeout(function () {
      document.addEventListener("click", checkClickFunc);
    }, 50);
  }
}