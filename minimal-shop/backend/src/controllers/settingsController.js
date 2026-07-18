import pool from '../config/db.js'
import { sanitizeString } from '../utils/validation.js'

// Нүүр хуудасны hero хэсэг болон checkout-ийн төлбөрийн мэдээллийн анхны
// (админ хараахан засаагүй үеийн) утгууд.
const DEFAULTS = {
  heroImage: '',
  heroEyebrow: 'ЦАХИМ ДЭЛГҮҮР · УЛААНБААТАР',
  heroTitle: 'Зөв хэрэгсэл. Хялбар амьдрал.',
  heroSubtitle: 'Өдөр тутмын хэрэгцээт ухаалаг бүтээгдэхүүнүүд. Илүүц зүйлгүй — зөвхөн ашиглах л бараа.',
  bankName: 'Хас Банк',
  bankAccount: 'MN960032005005824809',
  bankAccountHolder: 'Эрхэмээ Оюунчимэг',
  qrImage: '',
  qrNote: '80701907 - Эрхэмээ',
}

const SETTINGS_KEYS = Object.keys(DEFAULTS)

// heroImage/qrImage нь base64 data URI байж болох тул бусад текст талбаруудаас
// тэс өөр, хамаагүй том хязгаартай байх ёстой (тайрвал зургийг эвдэнэ).
function maxLengthFor(key) {
  if (key === 'heroImage' || key === 'qrImage') return 3_000_000
  if (key === 'heroSubtitle') return 500
  return 200
}

export async function getSettings(req, res) {
  const result = await pool.query('SELECT key, value FROM settings')

  const settings = { ...DEFAULTS }
  for (const row of result.rows) {
    if (SETTINGS_KEYS.includes(row.key) && row.value) {
      settings[row.key] = row.value
    }
  }

  res.json({ settings })
}

export async function updateSettings(req, res) {
  const updates = SETTINGS_KEYS.filter((key) => req.body[key] !== undefined).map((key) => [
    key,
    sanitizeString(req.body[key], maxLengthFor(key)),
  ])

  for (const [key, value] of updates) {
    await pool.query(
      `INSERT INTO settings (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = $2`,
      [key, value]
    )
  }

  const result = await pool.query('SELECT key, value FROM settings')
  const settings = { ...DEFAULTS }
  for (const row of result.rows) {
    if (SETTINGS_KEYS.includes(row.key) && row.value) {
      settings[row.key] = row.value
    }
  }

  res.json({ settings })
}
