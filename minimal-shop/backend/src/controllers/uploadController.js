// Зураг хуулах controller.
// Cloudinary тохируулагдсан бол файлыг тэнд байнга хадгалж, тогтмол URL
// буцаана (Render-ийн үнэгүй багц deploy бүрд local disk-ээ цэвэрлэдэг тул).
// Тохируулаагүй бол хуучны байдлаар local disk дээр хадгална (/uploads) —
// энэ нь локал хөгжүүлэлтэд л ашиглагдана.

import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary.js'

export async function uploadImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: 'Зураг сонгогдоогүй байна.' })
  }

  if (isCloudinaryConfigured) {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'minimal-shop', resource_type: 'image' },
        (err, uploaded) => (err ? reject(err) : resolve(uploaded))
      )
      stream.end(req.file.buffer)
    })

    return res.status(201).json({ url: result.secure_url, filename: result.public_id })
  }

  const publicUrl = `${process.env.PUBLIC_BASE_URL || ''}/uploads/${req.file.filename}`

  res.status(201).json({
    url: publicUrl,
    filename: req.file.filename,
  })
}
