import pool from '../config/db.js'
import { isNonEmptyString, isPositiveNumber, sanitizeString } from '../utils/validation.js'
import { isValidCategory, VALID_CATEGORIES } from '../utils/categories.js'
import { resizeThumbImage } from '../utils/imageResize.js'

const MAX_PRODUCT_IMAGES = 6
// Зураг нь base64 data URI (жишээ нь data:image/jpeg;base64,...) хэлбэрээр
// хадгалагддаг тул sanitizeString-ийн 500 тэмдэгтийн хязгаар энд тохирохгүй —
// тайрвал зургийг эвдэнэ. Оронд нь зөвхөн санамсаргүй хэт том утгаас
// хамгаалах зорилготой өндөр дээвэр (~2MB зурагт хүрэлцэхүйц) ашиглана.
const MAX_IMAGE_VALUE_LENGTH = 3_000_000

function sanitizeImageValue(value) {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, MAX_IMAGE_VALUE_LENGTH)
}

// Барааны зургийн жагсаалтыг шалгаж цэвэрлэнэ. Массив биш бол null буцааж алдаа
// мэдэгдэнэ; хоосон утгуудыг хасаж, дээд тал нь MAX_PRODUCT_IMAGES ширхэгээр хязгаарлана.
function sanitizeImageList(value) {
  if (value === undefined) return []
  if (!Array.isArray(value)) return null
  const cleaned = value.map(sanitizeImageValue).filter(Boolean)
  return cleaned.slice(0, MAX_PRODUCT_IMAGES)
}

// Барааны жагсаалт (нүүр хуудас, бүх бараа хуудас) дээр ProductCard зөвхөн
// үндсэн зураг (image) болон нэмэлт зургийн ТОО-г л ("N зурагтай" тэмдэг)
// харуулдаг тул images массивын бодит base64 агуулгыг энд дамжуулах шаардлагагүй.
// Тэдгээрийг илгээвэл (бараа тус бүрт хэдэн зураг × ~100-300KB) хариу хэт том
// (~1.4MB+) болж, удаан ачаалагдах шалтгаан болдог байсан.
export async function getProducts(req, res) {
  const { category, search, sort, featured } = req.query

  let query = `SELECT id, name, description, price, category, stock, created_date, video, is_featured,
    COALESCE(NULLIF(image_thumb, ''), image) AS image,
    COALESCE(array_length(images, 1), 0) AS image_count
    FROM products WHERE 1=1`
  const params = []

  if (category) {
    params.push(category)
    query += ` AND category = $${params.length}`
  }

  if (search) {
    params.push(`%${search}%`)
    query += ` AND (name ILIKE $${params.length} OR description ILIKE $${params.length})`
  }

  if (featured === 'true') {
    query += ' AND is_featured = true'
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

  const images = sanitizeImageList(req.body.images)
  if (images === null) {
    return res.status(400).json({ message: 'Зургийн жагсаалт буруу байна.' })
  }
  const video = sanitizeString(req.body.video, 500)
  const isFeatured = Boolean(req.body.is_featured)

  const cleanImage = sanitizeImageValue(image)
  const imageThumb = await resizeThumbImage(cleanImage)

  const result = await pool.query(
    `INSERT INTO products (name, description, price, image, image_thumb, images, video, category, stock, is_featured)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [name, description, price, cleanImage, imageThumb, images, video, sanitizeString(category, 60), stock, isFeatured]
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
  const image = req.body.image !== undefined ? sanitizeImageValue(req.body.image) : current.image

  if (!isPositiveNumber(price) || !isPositiveNumber(stock)) {
    return res.status(400).json({ message: 'Үнэ, үлдэгдэл зөв тоо байх ёстой.' })
  }
  if (!isValidCategory(category)) {
    return res.status(400).json({ message: `Ангилал зөв байх ёстой (${VALID_CATEGORIES.join(', ')}).` })
  }

  let images = current.images
  if (req.body.images !== undefined) {
    images = sanitizeImageList(req.body.images)
    if (images === null) {
      return res.status(400).json({ message: 'Зургийн жагсаалт буруу байна.' })
    }
  }
  const video = req.body.video !== undefined ? sanitizeString(req.body.video, 500) : current.video
  const isFeatured = req.body.is_featured !== undefined ? Boolean(req.body.is_featured) : current.is_featured

  // Зөвхөн үндсэн зураг өөрчлөгдсөн үед л дахин жижигрүүлж (шахаж) шинэ thumb үүсгэнэ —
  // өөрчлөгдөөгүй бол хуучин thumb-аа хэвээр үлдээнэ (дэмий ажил хийхгүйн тулд).
  const imageThumb =
    req.body.image !== undefined ? await resizeThumbImage(image) : current.image_thumb

  const result = await pool.query(
    `UPDATE products SET name = $1, description = $2, price = $3, image = $4, image_thumb = $5, images = $6, video = $7,
       category = $8, stock = $9, is_featured = $10
     WHERE id = $11 RETURNING *`,
    [name, description, price, image, imageThumb, images, video, category, stock, isFeatured, id]
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
