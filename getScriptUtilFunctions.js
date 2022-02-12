export function calcInterpolation(array, times, startInterpolationIndex) {
  let interpolatedData = []

  for (let i = startInterpolationIndex; i < array.length; i++) {
    let j

    if (!array[i]) {
      for (j = i + 1; j < array.length; j++) {
        if (array[j]) break
      }

      const startIndex = i - 1,
        stopIndex = j
      const startValue = parseFloat(array[startIndex]),
        stopValue = parseFloat(array[stopIndex])

      for (let k = startIndex; k < stopIndex - 1; k++) {
        const value = startValue + ((stopValue - startValue) / (stopIndex - startIndex)) * (k + 1 - startIndex)
        if (value) interpolatedData.push({ time: times[k + 1], index: k + 1, value: value })
      }
      i = j
    }
  }

  for (let k = startInterpolationIndex; k < times.length; k++) {
    if (!array[k]) {
      const interpolatedValue = interpolatedData.filter(element => element.index == k)[0].value
      array[k] = interpolatedValue
    }
  }

  return array
}