//TESTING NEW KNMI API
import { sub, format, parseISO } from "date-fns"


const TimeWithMostLikelyAFile = sub(parseISO(new Date().toISOString().replace('Z', '')), { minutes: 10 + 6 })
const StingWithMostLikelyAFile = format(TimeWithMostLikelyAFile, "yyyyMMddHHmm")

const fileName = `KMDS__OPER_P___10M_OBS_L2_${StingWithMostLikelyAFile}.nc`

console.log(fileName)

import * as hdf5 from "jsfive"

const file = readFileSync("./TEST.nc")
const data = new hdf5.File(file.buffer)

// console.log(data.keys)

// log(f.get("station").value.indexOf("06310"))

log(data.get("ff").value[33])
log(data.get("dd").value[33])
log(data.get("gff").value[33])