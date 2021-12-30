export function drawDirectionArrow(angle, ctx, arrowColor) {

  ctx.strokeStyle = arrowColor

  //Coordinates in canvas
  const x_outer = (currentWindBoxSize / 2) * Math.cos((Math.PI / 180) * (angle - 90)) + 0.5 * currentWindBoxSize
  const y_outer = (currentWindBoxSize / 2) * Math.sin((Math.PI / 180) * (angle - 90)) + 0.5 * currentWindBoxSize
  const x_inner = (currentWindBoxSize - 250 + 7) * Math.cos((Math.PI / 180) * (angle - 90)) + 0.5 * currentWindBoxSize
  const y_inner = (currentWindBoxSize - 250 + 7) * Math.sin((Math.PI / 180) * (angle - 90)) + 0.5 * currentWindBoxSize

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