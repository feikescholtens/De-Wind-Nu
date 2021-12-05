function contact() {
  if (document.getElementsByClassName("messageBox")[0] == undefined) {

    //Scroll to top
    document.body.scrollTop = document.documentElement.scrollTop = 0;

    //Remove transform style element otherwise position fixed won't work
    document.body.style.transform = "unset";

    //Define messageBox element
    let messageBox = document.createElement("div");
    messageBox.classList.add("messageBox");
    messageBox.innerHTML = "<h3>Contact</h3><p class='messageBoxP'>E-mail: <a href='mailto:dewindnu@gmail.com'>dewindnu@gmail.com</a></p>";

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

    let checkClickFunc = function checkClick(evt) {
      let element = document.getElementsByClassName("messageBox")[0];
      var elementClicked = element.contains(evt.target);
      if (!elementClicked) {
        messageBox.remove();
        document.removeEventListener("click", checkClickFunc);
      }
    }

    setTimeout(function () {
      document.addEventListener("click", checkClickFunc);
    }, 50);
  }
}