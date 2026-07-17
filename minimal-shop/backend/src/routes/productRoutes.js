import express from 'express'
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = express.Router()

// Зураг base64 хэлбэрээр дамждаг тул (6 зураг хүртэл) энэ router-т л том
// хязгаартай JSON parser хэрэгтэй. authenticate/requireAdmin-ийн ДАРАА байрлуулснаар
// эрхгүй хүсэлт том body-г бүрэн уншиж/задлахаас өмнө шууд цуцлагдана.
const parseLargeJson = express.json({ limit: '20mb' })

// Нийтэд нээлттэй
router.get('/', asyncHandler(getProducts))
router.get('/:id', asyncHandler(getProductById))

// Зөвхөн админ
router.post('/', authenticate, requireAdmin, parseLargeJson, asyncHandler(createProduct))
router.put('/:id', authenticate, requireAdmin, parseLargeJson, asyncHandler(updateProduct))
router.delete('/:id', authenticate, requireAdmin, asyncHandler(deleteProduct))

export default router
