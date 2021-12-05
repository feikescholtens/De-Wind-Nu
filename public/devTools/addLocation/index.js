const name = document.getElementById("name");
const lat = document.getElementById("lat");
const lon = document.getElementById("lon");
const RWS = document.getElementById("RWS");
const KNMI = document.getElementById("KNMI");
const MVB = document.getElementById("MVB");
const RWS_id = document.getElementById("RWS_id");
const KNMI_id = document.getElementById("KNMI_id");
const MVB_id = document.getElementById("MVB_id");
const RWS_id_tr = document.getElementById("RWS_id_tr");
const KNMI_id_tr = document.getElementById("KNMI_id_tr");
const MVB_id_tr = document.getElementById("MVB_id_tr");
let data;
let pre = document.createElement("pre");

const RWS_dataset = {
  "location_id": "",
  "measurents": ["wind", "wind gusts"],
  "forecast": ["wind", "wind gusts"]
};

const KNMI_dataset = {
  "location_id": "",
  "measurents": ["wind", "wind gusts"],
  "forecast": ["wind", "wind gusts"]
};

const MVB_dataset = {
  "location_id": [],
  "measurents": ["wind", "wind gusts"],
  "forecast": ["wind", "wind gusts"]
};

pre.style.fontSize = "1.2em";

function updateJSON() {
  data = {
    "name": name.value,
    "lat": lat.value,
    "lon": lon.value,
    "datasets": ""
  }

  //R
  if (RWS.checked === true && KNMI.checked === false && MVB.checked === false) {
    data.datasets = {
      "Rijkswaterstaat": RWS_dataset
    };
    RWS_id_tr.classList.remove("hidden");
    KNMI_id_tr.classList.add("hidden");
    MVB_id_tr.classList.add("hidden");
    data.datasets.Rijkswaterstaat.location_id = RWS_id.value;
  }
  //RK
  if (RWS.checked === true && KNMI.checked === true && MVB.checked === false) {
    data.datasets = {
      "Rijkswaterstaat": RWS_dataset,
      "KNMI": KNMI_dataset
    };
    RWS_id_tr.classList.remove("hidden");
    KNMI_id_tr.classList.remove("hidden");
    MVB_id_tr.classList.add("hidden");
    data.datasets.Rijkswaterstaat.location_id = RWS_id.value;
    data.datasets.KNMI.location_id = KNMI_id.value;
  }
  //RKM
  if (RWS.checked === true && KNMI.checked === true && MVB.checked === true) {
    data.datasets = {
      "Rijkswaterstaat": RWS_dataset,
      "KNMI": KNMI_dataset,
      "MVB": MVB_dataset
    };
    RWS_id_tr.classList.remove("hidden");
    KNMI_id_tr.classList.remove("hidden");
    MVB_id_tr.classList.remove("hidden");
    data.datasets.Rijkswaterstaat.location_id = RWS_id.value;
    data.datasets.KNMI.location_id = KNMI_id.value;
    data.datasets.MVB.location_id = JSON.parse(MVB_id.value);
  }
  //KM
  if (RWS.checked === false && KNMI.checked === true && MVB.checked === true) {
    data.datasets = {
      "KNMI": KNMI_dataset,
      "MVB": MVB_dataset
    };
    RWS_id_tr.classList.add("hidden");
    KNMI_id_tr.classList.remove("hidden");
    MVB_id_tr.classList.remove("hidden");
    data.datasets.KNMI.location_id = KNMI_id.value;
    data.datasets.MVB.location_id = JSON.parse(MVB_id.value);
  }
  //K
  if (RWS.checked === false && KNMI.checked === true && MVB.checked === false) {
    data.datasets = {
      "KNMI": MVB_dataset
    };
    RWS_id_tr.classList.add("hidden");
    KNMI_id_tr.classList.remove("hidden");
    MVB_id_tr.classList.add("hidden");
    data.datasets.KNMI.location_id = KNMI_id.value;
  }
  //M
  if (RWS.checked === false && KNMI.checked === false && MVB.checked === true) {
    data.datasets = {
      "MVB": MVB_dataset
    };
    RWS_id_tr.classList.add("hidden");
    KNMI_id_tr.classList.add("hidden");
    MVB_id_tr.classList.remove("hidden");
    data.datasets.MVB.location_id = JSON.parse(MVB_id.value);
  }
  //RM
  if (RWS.checked === true && KNMI.checked === false && MVB.checked === true) {
    data.datasets = {
      "RWS": RWS_dataset,
      "MVB": MVB_dataset
    };
    RWS_id_tr.classList.remove("hidden");
    KNMI_id_tr.classList.add("hidden");
    MVB_id_tr.classList.remove("hidden");
    data.datasets.RWS.location_id = RWS_id.value;
    data.datasets.MVB.location_id = JSON.parse(MVB_id.value);
  }
  //
  if (RWS.checked === false && KNMI.checked === false && MVB.checked === false) {
    data.datasets = {};
    RWS_id_tr.classList.add("hidden");
    KNMI_id_tr.classList.add("hidden");
    MVB_id_tr.classList.add("hidden");
  }

  pre.textContent = JSON.stringify(data, undefined, 2);
  document.body.appendChild(pre);
}

name.addEventListener("input", updateJSON);
lat.addEventListener("input", updateJSON);
lon.addEventListener("input", updateJSON);
RWS.addEventListener("input", updateJSON);
KNMI.addEventListener("input", updateJSON);
MVB.addEventListener("input", updateJSON);
RWS_id.addEventListener("input", updateJSON);
KNMI_id.addEventListener("input", updateJSON);
MVB_id.addEventListener("input", updateJSON);

document.getElementById("submit").addEventListener("click", function () {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  };
  fetch("/addLocation", options);
});