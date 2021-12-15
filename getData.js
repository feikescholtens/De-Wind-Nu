async function getData(request, response, locations, fetchData, moment, MVBAPIKey, fs) {

  //Import the handleErrors function
  const {
    handleFetchErrors
  } = require("./handleFetchErrors");

  //Check once again if the ID is valid
  if (request.params.id !== "" && request.params.id.length == 4 && /^\d+$/.test(request.params.id) == true) {

    //Get the location ID's for the spot from the database so the requests can be made
    for (let i = 0; i < locations.length; i++) {
      if (locations[i].id == request.params.id) {

        //Fetch by calling the dedicated function
        let data_fetched = new Promise(async (resolve, reject) => {
          return fetchData(locations[i], moment, MVBAPIKey, resolve, reject, fs);
        });

        data_fetched.then((data_fetched) => {

          //Check for error (which is in the first key of the object data_fetched.data)
          if (Object.keys(data_fetched.data)[0] == "error") {
            console.log("data" + JSON.stringify(data_fetched))

            handleFetchErrors(data_fetched, response);

            //If there are no errors: proceed
          } else {

            //Put the name of the spot in the data that's going to be returned
            data_fetched.name = locations[i].name;

            //If only one dataset was fetched, we need to check if the data is empty
            if (Object.keys(data_fetched.data).length == 1) {

              if (data_fetched.data.Rijkswaterstaat) {

                //Check if the times or dates array is empty, that means there are no measurements
                if (data_fetched.data.Rijkswaterstaat[0].length == 0 || data_fetched.data.Rijkswaterstaat[1].length == 0) {
                  response.json({
                    error: "14"
                  });

                  //If that's not the case check if wind speed, wind gusts and wind direction are empty, this makes the data useless so send back an error
                } else if (data_fetched.data.Rijkswaterstaat[2].length == 0 && data_fetched.data.Rijkswaterstaat[3].length == 0 && data_fetched.data.Rijkswaterstaat[4].length == 0) {
                  response.json({
                    error: "80"
                  });

                  //In every other case, send the (not empty) data
                } else {
                  response.json({
                    Rijkswaterstaat: data_fetched.data.Rijkswaterstaat,
                    name: data_fetched.name
                  });
                }
              }

              if (data_fetched.data.KNMI) {

                //Check if the times or dates array is empty, that means there are no measurements
                if (data_fetched.data.KNMI[0].length == 0 || data_fetched.data.KNMI[1].length == 0) {
                  response.json({
                    error: "33"
                  });

                  //If that's not the case check if wind speed, wind gusts and wind direction are empty, this makes the data useless so send back an error
                } else if (data_fetched.data.KNMI[2].length == 0 && data_fetched.data.KNMI[3].length == 0 && data_fetched.data.KNMI[4].length == 0) {
                  response.json({
                    error: "85"
                  });

                  //In every other case, send the (not empty) data
                } else {
                  response.json({
                    KNMI: data_fetched.data.KNMI,
                    name: data_fetched.name
                  });
                }
              }

              if (data_fetched.data.MVB) {

                //Check if the times or dates array is empty, that means there are no measurements
                if (data_fetched.data.MVB[0].length == 0 || data_fetched.data.MVB[1].length == 0) {
                  response.json({
                    error: "91"
                  });

                  //If that's not the case check if wind speed, wind gusts and wind direction are empty, this makes the data useless so send back an error
                } else if (data_fetched.data.MVB[2].length == 0 && data_fetched.data.MVB[3].length == 0 && data_fetched.data.MVB[4].length == 0) {
                  response.json({
                    error: "78"
                  });

                  //In every other case, send the (not empty) data
                } else {
                  response.json({
                    MVB: data_fetched.data.MVB,
                    name: data_fetched.name
                  });
                }
              }

              //Otherwise just send back all the data als almost always one dataset will contain data, there is no need to check if both are empty
            } else {
              console.log(data_fetched);
              let reponseBack = {
                "name": data_fetched.name
              };
              if (data_fetched.data.Rijkswaterstaat) {
                reponseBack.Rijkswaterstaat = data_fetched.data.Rijkswaterstaat;
              }
              if (data_fetched.data.KNMI) {
                reponseBack.KNMI = data_fetched.data.KNMI;
              }
              if (data_fetched.data.MVB) {
                reponseBack.MVB = data_fetched.data.MVB;
              }

              response.json({
                reponseBack
              });
            }
          }

        });

        return
      }
    }
    response.json({
      error: "23"
    });

    //Otherwise report that the ID was invalid
  } else {
    response.json({
      error: "56"
    });
  }
}

//Export the function to the main file
module.exports = {
  getData
};