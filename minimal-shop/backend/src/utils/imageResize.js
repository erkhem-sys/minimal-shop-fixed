import sharp from 'sharp'

// Утасны камерын зураг ихэвчлэн 3000-4000px өргөнтэй, хэдэн MB хэмжээтэй байдаг тул
// шахалгүйгээр base64 болгож Postgres-д хадгалахад бараа бүрийн жагсаалт хэт хүнд
// (700KB+ хариу) болж, ачаалахад удаан болгодог байсан. Тиймээс зураг бүрийг
// хадгалахын өмнө шаардлагатай хэмжээ хүртэл нь шахна.
export async function resizeImageDataUri(dataUri, { maxWidth, quality }) {
  const match = /^data:image\/[a-zA-Z0-9.+-]+;base64,(.+)$/.exec(dataUri || '')
  if (!match) return dataUri || ''

  const inputBuffer = Buffer.from(match[1], 'base64')
  const outputBuffer = await sharp(inputBuffer)
    .rotate() // EXIF orientation-ийг зөв харуулна (утасны зураг ихэвчлэн эргэсэн metadata-той)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .jpeg({ quality })
    .toBuffer()

  return `data:image/jpeg;base64,${outputBuffer.toString('base64')}`
}

// Дэлгэрэнгүй/hero/QR зурагт зориулсан хэмжээ — эрчимтэй боловч чанар мэдэгдэхүйц алдагдахгүй.
export function resizeDetailImage(dataUri) {
  return resizeImageDataUri(dataUri, { maxWidth: 1100, quality: 78 })
}

// Барааны жагсаалт (нүүр хуудас, "Бүх бараа") дээрх жижиг карт зурагт зориулсан hэмжээ.
export function resizeThumbImage(dataUri) {
  return resizeImageDataUri(dataUri, { maxWidth: 360, quality: 62 })
}
