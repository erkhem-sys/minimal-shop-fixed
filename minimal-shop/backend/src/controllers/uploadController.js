// Зураг хуулах controller.
// ЗАМ: одоогоор local disk дээр хадгална (/uploads).
// Cloud storage (Cloudinary, AWS S3, эсвэл Render Disk) ашиглах бол энэ файлыг тухайн
// үйлчилгээний SDK-р сольж, req.file.buffer-ийг шууд cloud руу upload хийгээд
// буцаж ирсэн public URL-ийг хариулна.

export function uploadImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: 'Зураг сонгогдоогүй байна.' })
  }

  const publicUrl = `${process.env.PUBLIC_BASE_URL || ''}/uploads/${req.file.filename}`

  res.status(201).json({
    url: publicUrl,
    filename: req.file.filename,
  })
}
