export function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

export function isPositiveNumber(value) {
  const n = Number(value)
  return !Number.isNaN(n) && n >= 0
}

export function sanitizeString(value, maxLength = 500) {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, maxLength)
}
