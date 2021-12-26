export function drawDirectionArrow(angle, ctx, arrowColor) {

  //Set color for the arrow
  ctx.strokeStyle = arrowColor;

  //Get coordinates in the canvas
  let x_outer = (currentWindBoxSize / 2) * Math.cos((Math.PI / 180) * (angle - 90)) + 0.5 * currentWindBoxSize;
  let y_outer = (currentWindBoxSize / 2) * Math.sin((Math.PI / 180) * (angle - 90)) + 0.5 * currentWindBoxSize;
  let x_inner = (currentWindBoxSize - 250 + 7) * Math.cos((Math.PI / 180) * (angle - 90)) + 0.5 * currentWindBoxSize;
  let y_inner = (currentWindBoxSize - 250 + 7) * Math.sin((Math.PI / 180) * (angle - 90)) + 0.5 * currentWindBoxSize;

  //Get other properties (differnce in x and y, angle, and length)
  var dx = x_inner - x_outer;
  var dy = y_inner - y_outer;
  var angle = Math.atan2(dy, dx);
  var length = Math.sqrt(dx * dx + dy * dy);

  //Draw the arrow itself (code from the internet)
  ctx.translate(x_outer, y_outer);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(length, 0);
  ctx.moveTo(length - 14, -8);
  ctx.lineTo(length, 0);
  ctx.lineTo(length - 14, 8);
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}