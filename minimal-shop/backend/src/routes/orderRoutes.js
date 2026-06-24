import express from 'express'
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
} from '../controllers/orderController.js'
import { authenticate, requireAdmin, optionalAuthenticate } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = express.Router()

// Захиалга нэвтрэлгүйгээр ч өгөх боломжтой (зочин захиалга), гэхдээ нэвтэрсэн бол user_id холбоно.
router.post('/', optionalAuthenticate, asyncHandler(createOrder))

// Захиалгын жагсаалт харахын тулд нэвтэрсэн байх ёстой (өөрийнхөө захиалгыг харна, админ бол бүгдийг)
router.get('/', authenticate, asyncHandler(getOrders))
router.get('/:id', authenticate, asyncHandler(getOrderById))

// Захиалгын төлөв шинэчлэх — зөвхөн админ
router.put('/:id', authenticate, requireAdmin, asyncHandler(updateOrderStatus))

export default router
