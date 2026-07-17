import multer from 'multer'

// Зургийг санах ойд хадгалаад (disk-д бичихгүй), controller нь base64 болгож
// шууд Postgres-ийн image/images баганад хадгална — Render-ийн үнэгүй багц дээр
// deploy бүрд disk устдаг тул файл системд итгэхгүй, өгөгдлийн сан руу шууд хадгална.
const storage = multer.memoryStorage()

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

function fileFilter(req, file, cb) {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Зөвхөн JPEG, PNG, WEBP, GIF зураг оруулах боломжтой.'))
  }
}

const upload = multer({
  storage,
  fileFilter,
  // base64 хэлбэрээр DB-д хадгалах тул жижигхэн хэмжээгээр хязгаарлана
  // (DB мөр хэт том болохоос сэргийлнэ).
  limits: { fileSize: 1.5 * 1024 * 1024 }, // 1.5MB
})

export default upload
