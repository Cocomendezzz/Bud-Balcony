// Height conversions. Values stored in the project's chosen unit; we show the other inline.

export function cmToImperial(cm) {
  if (cm == null || cm === '') return ''
  const inches = cm / 2.54
  if (inches >= 12) {
    const ft = Math.floor(inches / 12)
    const rem = Math.round(inches - ft * 12)
    return rem ? `${ft}′ ${rem}″` : `${ft}′`
  }
  return `${round1(inches)} in`
}

export function inToCm(inches) {
  if (inches == null || inches === '') return ''
  return round1(inches * 2.54)
}

export function cmToIn(cm) {
  if (cm == null || cm === '') return ''
  return round1(cm / 2.54)
}

// Given a value in the active unit, return a readable string in the OTHER unit.
export function convertedLabel(value, unit) {
  if (value === '' || value == null || isNaN(Number(value))) return ''
  const v = Number(value)
  if (unit === 'cm') return cmToImperial(v)
  // unit is inches -> show cm
  return `${round1(v * 2.54)} cm`
}

function round1(n) { return Math.round(n * 10) / 10 }
