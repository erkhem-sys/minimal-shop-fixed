import express from 'express'
import { register, login, updateMe, forgotPassword, resetPassword } from '../controllers/authController.js'
import { authenticate } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = express.Router()

// Энэ router-т ирэх body-нууд (нэвтрэх/бүртгүүлэх/мэдээлэл засах) бүгд жижиг
// текст талбарууд тул бага хязгаартай байх ёстой.
router.use(express.json({ limit: '20kb' }))

router.post('/register', asyncHandler(register))
router.post('/login', asyncHandler(login))
router.put('/me', authenticate, asyncHandler(updateMe))
router.post('/forgot-password', asyncHandler(forgotPassword))
router.post('/reset-password', asyncHandler(resetPassword))

export default router
