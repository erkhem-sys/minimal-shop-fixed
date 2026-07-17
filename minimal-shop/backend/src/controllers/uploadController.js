// Зураг хуулах controller.
// Render-ийн үнэгүй багц дээр /uploads хавтас deploy бүрд устдаг тул файлыг
// disk-д огт бичихгүй — оронд нь base64 data URI болгож шууд буцаана, ингэснээр
// дуудагч тал (бараа хадгалах controller) үүнийг шууд Postgres-д хадгална.

export function uploadImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: 'Зураг сонгогдоогүй байна.' })
  }

  const dataUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`

  res.status(201).json({ url: dataUrl })
}
