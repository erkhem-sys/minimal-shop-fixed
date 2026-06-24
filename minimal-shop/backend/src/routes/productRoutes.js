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

// Нийтэд нээлттэй
router.get('/', asyncHandler(getProducts))
router.get('/:id', asyncHandler(getProductById))

// Зөвхөн админ
router.post('/', authenticate, requireAdmin, asyncHandler(createProduct))
router.put('/:id', authenticate, requireAdmin, asyncHandler(updateProduct))
router.delete('/:id', authenticate, requireAdmin, asyncHandler(deleteProduct))

export default router
