// Seed data script — танай 3 бодит бараа болон admin хэрэглэгчийг үүсгэнэ.
// Ажиллуулах: npm run seed

import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import pool from '../src/config/db.js'

dotenv.config()

const PRODUCTS = [
  {
    name: 'Ханын наадаг хадаас (20ш)',
    description:
      'Хана цоолохгүйгээр бэхждэг наадаг хадаас. Хуссан гөлгөр гадаргуу дээр наахад тохиромжтой, өнгөгүй цэвэр харагдана. Зураг, цаг, жааз, тавиур тогтооход тохиромжтой. Багцад 20 ширхэг хадаас орсон.',
    price: 18000,
    image: '/uploads/hook-set9.jpeg',
    category: 'home',
    stock: 64,
  },
  {
    name: 'K9 Утасгүй микрофон',
    description:
      'Утасгүй lavalier микрофон, 2 ширхэгтэй багц. iPhone (Lightning) болон Android (Type-C) төхөөрөмжтэй шууд холбогддог. Тусдаа апп шаардлагагүй — Plug & Play горимтой. Vlog, ярилцлага, live stream, хичээл сургалтад тохиромжтой.',
    price: 50000,
    image: '/uploads/mic-studio.jpeg',
    category: 'electronics',
    stock: 21,
  },
  {
    name: 'Олон үйлдэлт вакуум битүүмжлэгч',
    description:
      'Хүнсний хадгалах хугацааг 6 дахин уртасгадаг вакуум битүүмжлэгч машин. Хуурай болон нойтон хүнс хоёуланд тохиромжтой, 3 шатлалт температурын хяналттай. Type-C цэнэглэлттэй, соронзоор хөргөгчинд бэхэлж хадгалах боломжтой. Багцад 50 вакуум уут дагалдана.',
    price: 79900,
    image: '/uploads/vacuum-lifestyle.jpeg',
    category: 'home',
    stock: 15,
  },
]

async function seed() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // Admin хэрэглэгч
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@minimalshop.mn'
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin12345!'
    const hashedPassword = await bcrypt.hash(adminPassword, 10)

    await client.query(
      `INSERT INTO users (name, phone, email, password, role)
       VALUES ($1, $2, $3, $4, 'admin')
       ON CONFLICT (email) DO NOTHING`,
      ['Админ', '80701907', adminEmail, hashedPassword]
    )

    // Бараанууд
    for (const p of PRODUCTS) {
      const existing = await client.query('SELECT id FROM products WHERE name = $1', [p.name])
      if (existing.rows.length === 0) {
        await client.query(
          `INSERT INTO products (name, description, price, image, category, stock)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [p.name, p.description, p.price, p.image, p.category, p.stock]
        )
      }
    }

    await client.query('COMMIT')
    console.log('✅ Seed data амжилттай нэмэгдлээ.')
    console.log(`   Admin нэвтрэх: ${adminEmail} / ${adminPassword}`)
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('❌ Seed алдаа:', err)
    process.exitCode = 1
  } finally {
    client.release()
    await pool.end()
  }
}

seed()
