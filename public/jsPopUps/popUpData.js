export function givePopUpData() {
  return {
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
}