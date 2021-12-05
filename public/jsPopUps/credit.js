function credit() {
  if (document.getElementsByClassName("messageBox")[0] == undefined) {

    //Scroll to top
    document.body.scrollTop = document.documentElement.scrollTop = 0;

    //Remove transform style element otherwise position fixed won't work
    document.body.style.transform = "unset";

    //Define messageBox element
    let messageBox = document.createElement("div");
    messageBox.classList.add("messageBox");
    messageBox.innerHTML = `<h3>Credit / bronvermelding</h3>
    <p class='messageBoxP'>De Wind Nu is non-profit en heeft als doel om surfers te informeren over het weer. Dit is
      mogelijk gemaakt door de data van <a target='_blank' href='https://waterberichtgeving.rws.nl/'>Rijkswaterstaat</a>, het KNMI en het ECMWF. 
      Data van Rijkswaterstaat is van de meetpalen van het <i>Waterberichtgeving</i>-
      platform en de voorspellingen zijn door Rijkswaterstaat geleverd en berekend door het 
      <a href="https://www.ecmwf.int/" target="_blank">ECMWF</a>. Data van het KNMI is aangeleverd door 
      <a target='_blank' href='https://www.buienradar.nl'>Buienradar.nl</a>. Het Meetnet Vlaamse Banken van de Vlaamse Hydrografie (zie <a href="https://www.agentschapmdk.be/nl/vlaamse-hydrografie" target="_blank">Vlaamse Hydrografie | Agentschap MDK</a>) levert de winddata van voor de Belgische kust.
      Niemand verdient geld aan deze website. Hier volgt een lijst met alle gebruikte toepassingen: <ul>
      <li>Rijkswaterstaat</li>
      <li>Het Europees Centrum voor Weersverwachtingen op Middellange Termijn / ECMWF</li>
      <li>Koninklijk Nederlands Meteorologisch Instituut / KNMI</li>
      <li>Agentschap Maritieme Dienstverlening en Kust</li>
      <li>Mapbox</li>
      <li>OpenStreetMap</li>
      <li>OpenSeaMap</li>
      </ul></p>`;

    //Make close button
    let close = document.createElement("div");
    close.classList.add("close");
    close.textContent = "✖";
    close.addEventListener("click", function () {
      messageBox.remove();
      document.removeEventListener("click", checkClickFunc);
    });

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