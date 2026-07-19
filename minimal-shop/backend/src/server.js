import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import rateLimit from 'express-rate-limit'

import authRoutes from './routes/authRoutes.js'
import productRoutes from './routes/productRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'
import settingsRoutes from './routes/settingsRoutes.js'
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()

app.set('trust proxy', 1)

// --- Security middleware ---
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))

// CORS_ORIGIN-д зааснаас гадна тухайн домэйн бүрийн "www." хувилбарыг ч
// автоматаар зөвшөөрнө — учир нь Vercel зэрэг hosting нь бэр домэйныг www
// хувилбар руу чиглүүлдэг тул хоёуланг нь гараар тус тусад нь бичиж мартах
// эрсдэлээс сэргийлнэ (мөн орон зайг trim хийж, санамсаргүй хоосон зай орсноос
// болж бүхэл origin таарахгүй болохоос сэргийлнэ).
const configuredOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const allowedOrigins = new Set()
for (const origin of configuredOrigins) {
  allowedOrigins.add(origin)
  try {
    const url = new URL(origin)
    const altHost = url.hostname.startsWith('www.') ? url.hostname.slice(4) : `www.${url.hostname}`
    allowedOrigins.add(`${url.protocol}//${altHost}`)
  } catch {
    // Буруу хэлбэртэй origin байвал алгасна — доор cors() өөрөө хориглоно.
  }
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true)
      } else {
        callback(new Error('CORS-оор хориглогдсон домэйн.'))
      }
    },
    credentials: true,
  })
)

// JSON body parser-ийг энд бүх route-д нэг стандарт хязгаараар зуучлуулахгүй —
// route бүр өөрийн router файлдаа тохирсон хязгаараар (жишээ нь base64 зураг
// авдаг products/settings route-д томоор) express.json()-ийг тусад нь тохируулна.
// Учир нь эндээс нэг удаа нийтлэг бага хязгаараар зарлачихвал (жишээ нь 2mb)
// доор тухайн route-д зарлах илүү өндөр хязгаар хэзээ ч хүчин төгөлдөр болохгүй
// (эхний parser аль хэдийн biye-ийг хэрэглээд/цуцлаад дуусчихсан байна).

// Бүх /api эндпойнтод хязгаарлалт тогтооно (DoS, brute-force-оос хамгаална)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api', apiLimiter)

// Нэвтрэх/бүртгүүлэх эндпойнтод илүү хатуу хязгаарлалт (brute-force хамгаалалт)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Хэт олон оролдлого хийсэн байна. Дараа дахин оролдоно уу.' },
})
app.use('/api/auth', authLimiter)

// Static файл — зураг хадгалах сан (local storage сонголтод)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

// --- Routes ---
app.get('/api/health', (req, res) => res.json({ status: 'ok' }))
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/settings', settingsRoutes)

app.use(notFoundHandler)
app.use(errorHandler)

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`✅ Minimal Shop backend ажиллаж байна: http://localhost:${PORT}`)
})
