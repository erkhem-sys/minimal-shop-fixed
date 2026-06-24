import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../config/db.js'
import { isValidEmail, isNonEmptyString, sanitizeString } from '../utils/validation.js'

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

function toPublicUser(user) {
  return { id: user.id, name: user.name, phone: user.phone, email: user.email, role: user.role }
}

export async function register(req, res) {
  const name = sanitizeString(req.body.name, 120)
  const phone = sanitizeString(req.body.phone, 30)
  const email = sanitizeString(req.body.email, 160).toLowerCase()
  const { password } = req.body

  if (!isNonEmptyString(name) || !isNonEmptyString(phone)) {
    return res.status(400).json({ message: 'Нэр, утасны дугаараа бөглөнө үү.' })
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Имэйл хаяг буруу байна.' })
  }
  if (!isNonEmptyString(password) || password.length < 6) {
    return res.status(400).json({ message: 'Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой.' })
  }

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email])
  if (existing.rows.length > 0) {
    return res.status(409).json({ message: 'Энэ имэйл хаягаар бүртгэл үүссэн байна.' })
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const result = await pool.query(
    `INSERT INTO users (name, phone, email, password, role)
     VALUES ($1, $2, $3, $4, 'customer')
     RETURNING id, name, phone, email, role`,
    [name, phone, email, hashedPassword]
  )

  const user = result.rows[0]
  const token = signToken(user)
  res.status(201).json({ token, user: toPublicUser(user) })
}

export async function login(req, res) {
  const email = sanitizeString(req.body.email, 160).toLowerCase()
  const { password } = req.body

  if (!isValidEmail(email) || !isNonEmptyString(password)) {
    return res.status(400).json({ message: 'Имэйл, нууц үгээ зөв оруулна уу.' })
  }

  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
  const user = result.rows[0]

  if (!user) {
    return res.status(401).json({ message: 'Имэйл эсвэл нууц үг буруу байна.' })
  }

  const passwordMatches = await bcrypt.compare(password, user.password)
  if (!passwordMatches) {
    return res.status(401).json({ message: 'Имэйл эсвэл нууц үг буруу байна.' })
  }

  const token = signToken(user)
  res.json({ token, user: toPublicUser(user) })
}
