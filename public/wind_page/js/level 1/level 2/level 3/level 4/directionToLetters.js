function directionToLetters(actuele_richting) {

  //Define the variable
  let letters;

  //Check for every part of the circle if the direction falls in between
  if (actuele_richting < 11.25 || actuele_richting > 348.75) {
    letters = "N";
  } else if ((actuele_richting > 11.25) && (actuele_richting < 33.75)) {
    letters = "NNO";
  } else if ((actuele_richting > 33.75) && (actuele_richting < 56.25)) {
    letters = "NO";
  } else if ((actuele_richting > 56.25) && (actuele_richting < 78.75)) {
    letters = "NOO";
  } else if ((actuele_richting > 78.75) && (actuele_richting < 101.25)) {
    letters = "O";
  } else if ((actuele_richting > 101.25) && (actuele_richting < 123.75)) {
    letters = "ZOO";
  } else if ((actuele_richting > 123.75) && (actuele_richting < 146.25)) {
    letters = "ZO";
  } else if ((actuele_richting > 146.25) && (actuele_richting < 168.75)) {
    letters = "ZZO";
  } else if ((actuele_richting > 168.75) && (actuele_richting < 191.25)) {
    letters = "Z";
  } else if ((actuele_richting > 191.25) && (actuele_richting < 213.75)) {
    letters = "ZZW";
  } else if ((actuele_richting > 213.75) && (actuele_richting < 236.25)) {
    letters = "ZW";
  } else if ((actuele_richting > 236.25) && (actuele_richting < 258.75)) {
    letters = "ZWW";
  } else if ((actuele_richting > 258.75) && (actuele_richting < 281.25)) {
    letters = "W";
  } else if ((actuele_richting > 281.25) && (actuele_richting < 303.75)) {
    letters = "NNW";
  } else if ((actuele_richting > 303.75) && (actuele_richting < 326.25)) {
    letters = "NW";
  } else if ((actuele_richting > 326.25) && (actuele_richting < 348.75)) {
    letters = "NNW";
  }

  //And return the set letters
  return letters;
}