document.querySelectorAll("[data-goBackHome]").forEach(element => element.addEventListener("click", () => {
  if (document.referrer !== "") {
    window.location.replace(document.referrer)
  } else {
    window.location.replace("https://dewindnu.nl")
  }
}))