// Зөвшөөрөгдсөн category утгууд.
// Frontend-ийн src/data/products.js дотор байгаа CATEGORIES-тэй id-ууд нь
// ХАРИЛЦАН АДИЛ байх ёстой — аль нэгийг өөрчилбөл нөгөөг нь мөн шинэчил.
export const VALID_CATEGORIES = ['home', 'electronics', 'accessories']

export function isValidCategory(value) {
  return VALID_CATEGORIES.includes(value)
}
