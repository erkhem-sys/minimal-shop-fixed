// Барааны бичлэгийн холбоос (YouTube / Facebook / Instagram) -ыг iframe-ээр
// шууд суулгаж болох embed URL болгож хөрвүүлнэ. Танихгүй холбоос бол null
// буцаана — дуудагч тал энэ үед энгийн "Бичлэг үзэх" линк харуулна.

export function getEmbeddableVideoUrl(url) {
  if (!url || typeof url !== 'string') return null
  const trimmed = url.trim()
  if (!trimmed) return null

  const youtubeMatch = trimmed.match(
    /(?:youtube\.com\/watch\?v=|youtube\.com\/shorts\/|youtu\.be\/)([\w-]{6,})/
  )
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`
  }

  if (/facebook\.com|fb\.watch/i.test(trimmed)) {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(trimmed)}&show_text=false`
  }

  if (/instagram\.com\/(reel|p|tv)\//i.test(trimmed)) {
    const cleanPath = trimmed.split('?')[0].replace(/\/$/, '')
    return `${cleanPath}/embed`
  }

  return null
}

export function isVideoUrl(url) {
  return Boolean(url && typeof url === 'string' && url.trim())
}
