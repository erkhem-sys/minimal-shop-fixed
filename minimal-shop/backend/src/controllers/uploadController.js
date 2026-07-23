// Зураг хуулах controller.
// Render-ийн үнэгүй багц дээр /uploads хавтас deploy бүрд устдаг тул файлыг
// disk-д огт бичихгүй — оронд нь base64 data URI болгож шууд буцаана, ингэснээр
// дуудагч тал (бараа хадгалах controller) үүнийг шууд Postgres-д хадгална.

import { resizeDetailImage } from '../utils/imageResize.js'

// Үүнээс бага хэмжээтэй файлыг (жишээ нь QR код screenshot) шахахгүй орхино —
// аль хэдийн жижиг тул шахах шаардлагагүй, мөн QR кодыг lossy JPEG-ээр дахин
// кодлохоос сэргийлж, уншигдах чадварыг нь эрсдэлд оруулахгүй.
const SKIP_COMPRESSION_UNDER_BYTES = 300_000

export async function uploadImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: 'Зураг сонгогдоогүй байна.' })
  }

  const rawDataUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`

  // Утасны камерын зураг ихэвчлэн хэдэн MB хэмжээтэй байдаг тул шахалгүйгээр
  // хадгалбал сайтыг удаашруулна — том файлыг хадгалахаас өмнө шахна.
  const dataUrl =
    req.file.buffer.length > SKIP_COMPRESSION_UNDER_BYTES
      ? await resizeDetailImage(rawDataUrl)
      : rawDataUrl

  res.status(201).json({ url: dataUrl })
}
