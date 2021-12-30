export function directionToLetters(currentDirection) {

  let letters

  if (currentDirection < 11.25 || currentDirection > 348.75) letters = "N"
  else if ((currentDirection > 11.25) && (currentDirection < 33.75)) letters = "NNO"
  else if ((currentDirection > 33.75) && (currentDirection < 56.25)) letters = "NO"
  else if ((currentDirection > 56.25) && (currentDirection < 78.75)) letters = "NOO"
  else if ((currentDirection > 78.75) && (currentDirection < 101.25)) letters = "O"
  else if ((currentDirection > 101.25) && (currentDirection < 123.75)) letters = "ZOO"
  else if ((currentDirection > 123.75) && (currentDirection < 146.25)) letters = "ZO"
  else if ((currentDirection > 146.25) && (currentDirection < 168.75)) letters = "ZZO"
  else if ((currentDirection > 168.75) && (currentDirection < 191.25)) letters = "Z"
  else if ((currentDirection > 191.25) && (currentDirection < 213.75)) letters = "ZZW"
  else if ((currentDirection > 213.75) && (currentDirection < 236.25)) letters = "ZW"
  else if ((currentDirection > 236.25) && (currentDirection < 258.75)) letters = "ZWW"
  else if ((currentDirection > 258.75) && (currentDirection < 281.25)) letters = "W"
  else if ((currentDirection > 281.25) && (currentDirection < 303.75)) letters = "NNW";
  else if ((currentDirection > 303.75) && (currentDirection < 326.25)) letters = "NW"
  else if ((currentDirection > 326.25) && (currentDirection < 348.75)) letters = "NNW"

  return letters

}