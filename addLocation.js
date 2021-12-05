async function addLocation(request, response, locations, fs) {

  const {
    generateId
  } = require("./generateId");

  let new_location = request.body;

  const id = await generateId(locations);

  new_location.id = id;
  locations.push(new_location);

  fs.writeFile("locations.json", JSON.stringify(locations, null, 2), (err) => {
    if (err) {
      console.log(err)
      return
    }

    console.log("Added new location to the list!")
  })
}

module.exports = {
  addLocation
};