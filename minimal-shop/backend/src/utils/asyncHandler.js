// Express-д async controller-уудын алдааг автоматаар errorHandler рүү дамжуулах wrapper.
// Ашиглах нь: router.get('/', asyncHandler(getProducts))
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
