const transformation = require('transform-coordinates')
 
const transform = transformation('EPSG:25831', '4326') // WGS 84 to Soldner Berlin
 
console.error(transform.forward({x: 548021.699409974, y: 5722952.98003529}))
// {
// 	x: 25405.407133664165,
// 	y: 19607.826100560924,
// 	z: -40.94089552294463
// }