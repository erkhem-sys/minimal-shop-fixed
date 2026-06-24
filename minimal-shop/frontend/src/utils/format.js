// Үнийг "28,000₮" хэлбэрээр форматлана.
export function formatPrice(value) {
  return `${Number(value).toLocaleString('mn-MN')}₮`
}

export function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('mn-MN', { year: 'numeric', month: 'long', day: 'numeric' })
}
