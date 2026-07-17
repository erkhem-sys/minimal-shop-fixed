import multer from 'multer'
import path from 'path'
import crypto from 'crypto'
import { isCloudinaryConfigured } from '../config/cloudinary.js'

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve('uploads'))
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`
    cb(null, uniqueName)
  },
})

// Cloudinary тохируулагдсан бол файлыг санах ойд хадгалаад, controller-т
// шууд Cloudinary руу дамжуулна (disk-д бичихгүй тул Render-ийн ephemeral
// disk-ийн асуудлаас зайлсхийнэ).
const memoryStorage = multer.memoryStorage()

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

function fileFilter(req, file, cb) {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Зөвхөн JPEG, PNG, WEBP, GIF зураг оруулах боломжтой.'))
  }
}

const upload = multer({
  storage: isCloudinaryConfigured ? memoryStorage : diskStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
})

export default upload
