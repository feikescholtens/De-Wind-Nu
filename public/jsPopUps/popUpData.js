export const popUpData = {
  welkom: { html: `
    <h3 style="font-size: 24px;" class="popUpTitle">De Wind Nu | Welkom!</h3>
    <p class='messageBoxP'>
    De Wind Nu verzamelt actuele weerdata van meetstations door heel Nederland. Deze kunnen gebruikt worden voor het informeren van surfers of zeilers.
    <br><br>
    Zodra je deze boodschap wegklikt zie je een kaart met alle beschikbare locaties. 
    In dit overzicht zijn ook de wind- krachten en richtingen weergegeven.</p>
    <br>
    <div id="gridWrapper">
      <div><button class="windPageButton popupRWS">Groene</button></div><div>locaties zijn van Rijkswaterstaat</div>
      <div><button class="windPageButton popupKNMI">Blauwe</button></div><div>locaties zijn van het KNMI</div>
      <div><button class="windPageButton popupMVB">Rode</button></div><div>locaties zijn van het Meetnet Vlaamse Banken</div>
      <div><button class="windPageButton popupVLINDER">Gele</button></div><div>locaties zijn van het VLINDER project van de UGent (deze voldoen niet aan de officiële eisen voor meetstations 
        en kunnen daarom lagere waardes aangeven)</div>
    </div><br>
    <p class='messageBoxP'>
    Bijna elke locatie bevat ook de laatste windvoorspelling van het KNMI.
    Na het klikken op een van de locaties wordt de data van vandaag getoond voor deze locatie. Onderaan zijn opties te vinden,
    om bijvoorbeeld de eenheid te veranderen of om een tabel weer te geven in plaats van de grafieken.
    <br><br>
    Veel plezier en houdt het veilig op het water!
    <br><br>
    <i>PS: Deze informatie is ook onder elke pagina te vinden onder het "Over" kopje!</i></p>
    ` },
  over: { html: `
    <h3 class="popUpTitle">Over</h3>
    <p class='messageBoxP'>
    De Wind Nu verzamelt actuele weerdata van meetstations door heel Nederland. Deze kunnen gebruikt worden voor het informeren van surfers of zeilers.
    <br><br>
    Bij het openen van de website is een overzicht weergegeven met de wind- krachten en richtingen.
    Opties zoals als de kaart tegels, met keuze tussen de standaardtegels van OpenStreetMap en tegels van hogere resolutie van Mapbox, 
    kunnen onderaan veranderd worden (scroll op de witte balk bovenaan). Ook kan er een zeekaart toegevoegd worden.</p>
    <br>
    <div id="gridWrapper">
      <div><button class="windPageButton popupRWS">Groene</button></div><div>locaties zijn van Rijkswaterstaat</div>
      <div><button class="windPageButton popupKNMI">Blauwe</button></div><div>locaties zijn van het KNMI</div>
      <div><button class="windPageButton popupMVB">Rode</button></div><div>locaties zijn van het Meetnet Vlaamse Banken</div>
      <div><button class="windPageButton popupVLINDER">Gele</button></div><div>locaties zijn van het VLINDER project van de UGent (deze voldoen niet aan de officiële eisen voor meetstations 
        en kunnen daarom lagere waardes aangeven)</div>
    </div><br>
    <p class='messageBoxP'>
    Na het klikken op een van de locaties wordt de data van vandaag getoond voor deze locatie. Deze data is standaard weergegeven als twee grafieken,
    maar er kan boven het tweede kopje ook gekozen worden voor een tabel (dit kan overigens ook onderaan de pagina gekozen worden). 
    Alle tijden op de website zijn in de Midden-Europese (zomer)tijd.
    <br><br>
    Bovenaan is de naam van de locatie weergegeven. Onder het eerste kopje zijn de gegevens van de recentste metingen en de voorspellingen voor dit tijdstip weergegeven. 
    Daaronder is een grafiek te zien met de gemeten windsnelheden (gemiddelde snelheid over de afgelopen 10 minuten) en de windvlagen (maximale, 3 seconde durende, 
      windstoot in de afgelopen 10 minuten). 
      
      <br>&nbsp;&nbsp;&nbsp;&nbsp;Eronder is nog een grafiek weergegeven met de gegevens over de windrichting (windrichting ten opzichte van het ware Noorden), 
      indien deze beschikbaar zijn. 
      <br><br>
      Tenslotte zijn onderaan nog wat instellingen weergegeven. Zo kunnen bijvoorbeeld de eenheden of het aantal decimalen gewijzigd worden. 
      Ook is het mogelijk de data te laten interpoleren.</p>
      
      <h4 class="popUpHeading">Informatie over metingen en voorspellingen</h4>
      <p class='messageBoxP'>
      Metingen worden gemaakt, in het geval van het KNMI, 
      door meetstations in kleine veldjes op open plekken, welke een uitgebreid arsenaal aan meetinstrumenten bevatten. Zo kan het KNMI bijvoorbeeld zicht, 
      wolkenhoogte en luchtdruk meten, naast de meer bekende parameters als temperatuur en wind. Rijkswaterstaat en het Meetnet Vlaamse Banken hebben minder geavanceerde stations,
      en meten voornamelijk de wind met meetpalen (vaak in of nabij zee). Het VLINDER project is onderdeel van de UGent in België. Dit is een netwerk van kleine meetstations welke maar een handvol parameters meten.
      Deze meetstations liggen meestal niet op open plekken en liggen niet op de juiste hoogte om aan de eisen van een officieel meetstation
      te voldoen. Daarom geven ze een stuk lagere waardes aan. Deze afwijzing kan je zien door te kijken naar het verschil met de voorspellingslijn (bij de officiële meetstations is dit verschil een stuk kleiner).
      <br>&nbsp;&nbsp;&nbsp;&nbsp;De voorspellingen, die ook in de grafieken zijn weergegeven, komen uit het HARMONIE-AROME Cy40 model van het KNMI. Dit model
      bevat 39 parameters - dus niet alleen wind - en berekent de voorspelling voor elk uur van de komende twee dagen over een gebied, met de grootte van Frankrijk, 
      waarin Nederland centraal ligt. Dit wordt gedaan op supercomputers,
      elke dag om 00:00, 06:00, 12:00 en 18:00 (UTC), wat ongeveer drie uur duurt per run. Als dit klaar is worden de 
      voorspellingen zo snel mogelijk geupdate op de site. Onderaan de pagina is te zien van welke run je de voorspellingen bekijkt. Voorspellingen 
      van vóór de tijd van de meest recente run, zijn van de vorige run, aangezien het model alleen in de toekomst de wind berekent.
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
   <p class='messageBoxP'>De Wind Nu is non-profit en heeft als doel om surfers te informeren over het weer. Niemand verdient geld aan deze website. Dit is
     mogelijk gemaakt door de data van de volgende bronnen: </p>
     <ul>
     <li><a target='_blank' href='https://rijkswaterstaat.nl/'>Rijkswaterstaat</a> waterdata;</li>
     <li>KNMI, aangeleverd door de website van <a target='_blank' href='https://www.buienradar.nl'>Buienradar.nl</a>;</li>
     <li>Meetnet Vlaamse Banken, van de Vlaamse Hydrografie 
     (zie <a href="https://www.agentschapmdk.be/nl/vlaamse-hydrografie" target="_blank">Vlaamse Hydrografie | Agentschap MDK</a>);</li>
     <li><a target='_blank' href='https://vlinder.ugent.be/'>VLINDER.nl</a> project van de UGent.</li>
     </ul>
     
     <p class='messageBoxP'>
     Hier volgt een lijst met alle gebruikte toepassingen aan de front-end: 
     <ul>
     <li>Mapbox;</li>
     <li>OpenStreetMap;</li>
     <li>OpenSeaMap;</li>
     <li>ChartJS.</li>
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