const sizeBoxToDrawIn = 350
let correctionMiddle //Can't set it here because the global variable isn't been assigned yet

//The canvas is 420 x 420, but the section in which is drawn in only 350 x 350
//The correctionMiddle is to correct that offset
//Space space outside the 350 x 350 box is used to displaying the text of the directions

function calcDecimalPlaces(angle) {
  const afterDecimalSeperator = String(angle).split(".")[1]
  if (afterDecimalSeperator == undefined) return 0
  else return afterDecimalSeperator.length
}

export function drawCanvasBackground(ctx) {
  correctionMiddle = (currentWindBoxSize - sizeBoxToDrawIn) / 2

  const directions = ["N", "NNO", "NO", "ONO", "O", "OZO", "ZO", "ZZO", "Z", "ZZW", "ZW", "WZW", "W", "WNW", "NW", "NNW"]

  const NoLines = 32
  const colourGradientInner = getComputedStyle(document.body).getPropertyValue('--BGColour')
  const colourGradientOuterPrimary = getComputedStyle(document.body).getPropertyValue('--lineColour2')
  const colourGradientOuterSecondary = getComputedStyle(document.body).getPropertyValue('--lineColour3')
  const colourGradientOuterTertiary = getComputedStyle(document.body).getPropertyValue('--lineColour1')
  ctx.lineWidth = 2

  for (let i = 0; i < NoLines; i++) {
    const angle = i * 360 / NoLines

    //Coordinates in canvas
    const x_outer = (sizeBoxToDrawIn / 2) * Math.cos((Math.PI / 180) * (angle - 90)) + 0.5 * sizeBoxToDrawIn + correctionMiddle
    const y_outer = (sizeBoxToDrawIn / 2) * Math.sin((Math.PI / 180) * (angle - 90)) + 0.5 * sizeBoxToDrawIn + correctionMiddle
    const x_inner = (sizeBoxToDrawIn - 250 + 7) * Math.cos((Math.PI / 180) * (angle - 90)) + 0.5 * sizeBoxToDrawIn + correctionMiddle
    const y_inner = (sizeBoxToDrawIn - 250 + 7) * Math.sin((Math.PI / 180) * (angle - 90)) + 0.5 * sizeBoxToDrawIn + correctionMiddle

    //Other properties
    const dx = x_inner - x_outer
    const dy = y_inner - y_outer
    const angleXAxis1 = Math.atan2(dy, dx)
    const length = Math.sqrt(dx * dx + dy * dy)

    ctx.translate(x_outer, y_outer)
    ctx.rotate(angleXAxis1)

    //Draw text
    ctx.textAlign = "center"
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--textColour3')

    if (calcDecimalPlaces(angle) === 0 || calcDecimalPlaces(angle) === 1) { //e.g. 0, 22.5, 45...
      const indexDirection = i / 2

      ctx.save()
      ctx.rotate(-Math.PI / 2)

      if (indexDirection % 4 == 0) ctx.font = "30px Times New Roman"
      else if (indexDirection % 2 == 0) ctx.font = "20px Times New Roman"
      else ctx.font = "12px Times New Roman"

      ctx.fillText(directions[indexDirection], 0, -10)
      ctx.rotate(-Math.PI / 2)
      ctx.restore()
    }

    //Draw radial lines
    const gradient = ctx.createLinearGradient(length, 0, 0, 0)
    gradient.addColorStop(0, colourGradientInner)

    if (calcDecimalPlaces(angle) === 0) gradient.addColorStop(1, colourGradientOuterPrimary)
    else if (calcDecimalPlaces(angle) === 1) gradient.addColorStop(1, colourGradientOuterSecondary)
    else if (calcDecimalPlaces(angle) === 2) gradient.addColorStop(1, colourGradientOuterTertiary)

    ctx.strokeStyle = gradient
    ctx.beginPath()
    ctx.moveTo(0, 0)

    ctx.lineTo(length, 0)

    ctx.stroke()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.restore()
  }
}

export function drawDirectionArrow(angle, ctx, arrowColor) {

  ctx.strokeStyle = arrowColor

  //Coordinates in canvas
  const x_outer = (sizeBoxToDrawIn / 2) * Math.cos((Math.PI / 180) * (angle - 90)) + 0.5 * sizeBoxToDrawIn + correctionMiddle
  const y_outer = (sizeBoxToDrawIn / 2) * Math.sin((Math.PI / 180) * (angle - 90)) + 0.5 * sizeBoxToDrawIn + correctionMiddle
  const x_inner = (sizeBoxToDrawIn - 250 + 7) * Math.cos((Math.PI / 180) * (angle - 90)) + 0.5 * sizeBoxToDrawIn + correctionMiddle
  const y_inner = (sizeBoxToDrawIn - 250 + 7) * Math.sin((Math.PI / 180) * (angle - 90)) + 0.5 * sizeBoxToDrawIn + correctionMiddle

  //Other properties
  const dx = x_inner - x_outer
  const dy = y_inner - y_outer
  const angleXAxis = Math.atan2(dy, dx)
  const length = Math.sqrt(dx * dx + dy * dy)

  ctx.translate(x_outer, y_outer)
  ctx.rotate(angleXAxis)
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(length, 0)
  ctx.moveTo(length - 14, -8)
  ctx.lineTo(length, 0)
  ctx.lineTo(length - 14, 8)
  ctx.lineWidth = 6
  ctx.stroke()
  ctx.setTransform(1, 0, 0, 1, 0, 0)

}