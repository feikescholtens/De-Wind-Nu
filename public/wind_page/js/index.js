//Get the ID from the URL
let id = window.location.pathname.split("/")[2];

//Global variables for the charts (they need to be global because of other .js files!)
let data = [];
let data_unit = [];
let unit;
let dataset;
let decimals;
let units;
let times;

//Check if an ID is set, otherwise redirect to error page
if (id !== undefined && id !== '') {
  getData();
} else {
  window.location.href = window.location.origin + "/error?e=47";
}

//Fetch the data from the server
async function getData() {
  await fetch("/getData/" + id)
    .then(response => response.json())
    .then(data_fetched => {
      if (Object.keys(data_fetched)[0] == "error") {
        window.location.href = `${window.location.origin}/error?e=${data_fetched.error}`;
      } else {
        processData(data_fetched);
      }
    });
};