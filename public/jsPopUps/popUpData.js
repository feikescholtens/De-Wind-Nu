export const popUpData = {
  about: { html: `
    <h3 class="popUpTitle">Over</h3>
    <p class='messageBoxP'>
    De Wind Nu verzamelt actuele weerdata van meetstations door heel Nederland. Deze kunnen gebruikt worden voor het informeren van surfers of zeilers.
    <br><br>
    Bij het openen van de website is het overzicht weergegeven met de wind- snelheden en richtingen in Beaufort. 
    Opties zoals als de kaart tegels, met keuze tussen de standaardtegels van OpenStreetMap en tegels van hogere resolutie van Mapbox, 
    kunnen onderaan veranderd worden (scroll op de witte balk bovenaan). Ook kan er een zeekaart toegevoegd worden.
    <br><br>
    Na het klikken op een van de locaties wordt de data van de dezelfde dag getoond voor deze locatie.
    Bovenaan zijn de naam van de locatie en de bron weergegeven. Onder het eerste kopje zijn de gegevens van de recentste meting weergegeven. 
    Daaronder is een grafiek te zien met de gemeten windsnelheden (gemiddelde snelheid over de afgelopen 10 minuten) en de windvlagen (maximale, 3 seconde durende, 
      windstoot in de afgelopen 10 minuten). Eronder is nog een grafiek weergegeven met de gegevens over de windrichting (windrichting ten opzichte van het ware Noorden), 
      indien deze beschikbaar zijn. Tenslotte zijn onderaan nog wat instellingen weergegeven. Zo kunnen bijvoorbeeld de eenheden of het aantal decimalen gewijzigd worden. 
      Ook is het mogelijk de data te laten interpoleren.
      </p>
    <h4 class="popUpHeading">Fouten / bugs</h4>
    <p class='messageBoxP'>
    Het gebeurt regelmatig dat je een fout (in rode tekst) krijgt tijdens het gebruik van de website. 
    Indien dit het geval is, is dit een probleem buiten het bereik van De Wind Nu. Andere problemen, zoals het niet laden van de website na 10 seconden, 
    waarden van <i>undefined</i>, <i>NaN</i> of negatieve getallen die getoond worden, of het ontbreken van elementen op de website, 
    zijn bugs en deze kunnen gerapporteerd worden met het formulier onderaan de website.
    </p>
    ` },
  disclaimer: { html: `
    <h3 class="popUpTitle">Disclaimer</h3>
    <p class='messageBoxP'>
    Gebruikers dienen niet te vertrouwen op de informatie die getoond wordt op deze website. Gebruik is dan ook op eigen risico en het is altijd de verantwoordelijkheid
    van de gebruiker om zich te informeren over het weer en daarnaar te handelen. Bij het gebruik van deze website gaat de gebruiker hiermee akkoord.
      <br><br>
    <i>Aan dewindnu.nl en de gegevens die hier getoond worden kunnen door gebruikers of andere personen geen rechten worden ontleend.</i>
    </p>
    ` },
  credit: { html: `
   <h3 class="popUpTitle">Credit / bronvermelding</h3>
   <p class='messageBoxP'>De Wind Nu is non-profit en heeft als doel om surfers te informeren over het weer. Dit is
     mogelijk gemaakt door de data van <a target='_blank' href='https://waterberichtgeving.rws.nl/'>Rijkswaterstaat</a>, het KNMI en 
     het Meetnet Vlaamse Banken. 
     Data van Rijkswaterstaat is van de meetpalen van het <i>Rijkswaterstaat waterdata</i>-
     netwerk. Data van het KNMI is aangeleverd door 
     <a target='_blank' href='https://www.buienradar.nl'>Buienradar.nl</a>. Het Meetnet Vlaamse Banken van de Vlaamse Hydrografie 
     (zie <a href="https://www.agentschapmdk.be/nl/vlaamse-hydrografie" target="_blank">Vlaamse Hydrografie | Agentschap MDK</a>) 
     levert de winddata van voor de Belgische kust.
     Niemand verdient geld aan deze website. 
     <br><br>
     Hier volgt een lijst met alle gebruikte toepassingen van de front-end: 
     <ul>
     <li>Mapbox</li>
     <li>OpenStreetMap</li>
     <li>OpenSeaMap</li>
     <li>ChartJS</li>
     </ul></p>` },
  feedback: { html: `<h3 class="popUpTitle">Geef feedback</h3>
     <p class="messageBoxP">Feedback wordt erg gewaardeerd. Dit kan in de vorm van fouten/bugs, tips, gewenste functies, noem
       maar op.
       Alles is mogelijk, vul onderstaand formulier in om feedback te verzenden.</p>
     <table data-feedbackForm>
       <tr>
         <td><label for="name">Je naam</label></td>
         <td><input data-name id="name" type="text" placeholder="Optioneel"></td>
       </tr>
       <tr>
         <td><label for="email">Je e-mail</label></td>
         <td><input data-email id="email" type="email" placeholder="Optioneel"></td>
       </tr>
       <tr>
         <td><label for="message">Je bericht*</label></td>
         <td><textarea data-message oninput='this.style.height = "";this.style.height = this.scrollHeight + "px"' placeholder="Verplicht" id="message"></textarea></td>
       </tr>
     </table>
     <button data-send id="send">Verzenden</button>` },
  contact: { html: `<h3 class="popUpTitle">Contact</h3><p class='messageBoxP'>E-mail: <a href='mailto:dewindnu@gmail.com'>dewindnu@gmail.com</a></p>` }
}