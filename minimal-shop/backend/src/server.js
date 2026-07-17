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

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',')
app.use(
  cors({
    origin: allowedOrigins,
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
