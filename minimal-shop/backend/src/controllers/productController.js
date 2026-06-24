import pool from '../config/db.js'
import { isNonEmptyString, isPositiveNumber, sanitizeString } from '../utils/validation.js'
import { isValidCategory, VALID_CATEGORIES } from '../utils/categories.js'

export async function getProducts(req, res) {
  const { category, search, sort } = req.query

  let query = 'SELECT * FROM products WHERE 1=1'
  const params = []

  if (category) {
    params.push(category)
    query += ` AND category = $${params.length}`
  }

  if (search) {
    params.push(`%${search}%`)
    query += ` AND (name ILIKE $${params.length} OR description ILIKE $${params.length})`
  }

  if (sort === 'price-asc') {
    query += ' ORDER BY price ASC'
  } else if (sort === 'price-desc') {
    query += ' ORDER BY price DESC'
  } else {
    query += ' ORDER BY created_date DESC'
  }

  const result = await pool.query(query, params)
  res.json({ products: result.rows })
}

export async function getProductById(req, res) {
  const { id } = req.params
  const result = await pool.query('SELECT * FROM products WHERE id = $1', [id])

  if (result.rows.length === 0) {
    return res.status(404).json({ message: 'Бараа олдсонгүй.' })
  }

  res.json({ product: result.rows[0] })
}

export async function createProduct(req, res) {
  const name = sanitizeString(req.body.name, 200)
  const description = sanitizeString(req.body.description, 2000)
  const { price, stock, category, image } = req.body

  if (!isNonEmptyString(name)) {
    return res.status(400).json({ message: 'Барааны нэрээ оруулна уу.' })
  }
  if (!isPositiveNumber(price)) {
    return res.status(400).json({ message: 'Үнэ зөв тоо байх ёстой.' })
  }
  if (!isPositiveNumber(stock)) {
    return res.status(400).json({ message: 'Үлдэгдэл зөв тоо байх ёстой.' })
  }
  if (!isValidCategory(category)) {
    return res.status(400).json({ message: `Ангилал зөв байх ёстой (${VALID_CATEGORIES.join(', ')}).` })
  }

  const result = await pool.query(
    `INSERT INTO products (name, description, price, image, category, stock)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [name, description, price, sanitizeString(image, 500), sanitizeString(category, 60), stock]
  )

  res.status(201).json({ product: result.rows[0] })
}

export async function updateProduct(req, res) {
  const { id } = req.params
  const existing = await pool.query('SELECT * FROM products WHERE id = $1', [id])

  if (existing.rows.length === 0) {
    return res.status(404).json({ message: 'Бараа олдсонгүй.' })
  }

  const current = existing.rows[0]
  const name = req.body.name !== undefined ? sanitizeString(req.body.name, 200) : current.name
  const description =
    req.body.description !== undefined ? sanitizeString(req.body.description, 2000) : current.description
  const price = req.body.price !== undefined ? req.body.price : current.price
  const stock = req.body.stock !== undefined ? req.body.stock : current.stock
  const category = req.body.category !== undefined ? sanitizeString(req.body.category, 60) : current.category
  const image = req.body.image !== undefined ? sanitizeString(req.body.image, 500) : current.image

  if (!isPositiveNumber(price) || !isPositiveNumber(stock)) {
    return res.status(400).json({ message: 'Үнэ, үлдэгдэл зөв тоо байх ёстой.' })
  }
  if (!isValidCategory(category)) {
    return res.status(400).json({ message: `Ангилал зөв байх ёстой (${VALID_CATEGORIES.join(', ')}).` })
  }

  const result = await pool.query(
    `UPDATE products SET name = $1, description = $2, price = $3, image = $4, category = $5, stock = $6
     WHERE id = $7 RETURNING *`,
    [name, description, price, image, category, stock, id]
  )

  res.json({ product: result.rows[0] })
}

export async function deleteProduct(req, res) {
  const { id } = req.params
  const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [id])

  if (result.rows.length === 0) {
    return res.status(404).json({ message: 'Бараа олдсонгүй.' })
  }

  res.json({ message: 'Бараа устгагдлаа.', id: result.rows[0].id })
}
