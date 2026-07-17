import express from 'express'
import { register, login, updateMe } from '../controllers/authController.js'
import { authenticate } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = express.Router()

router.post('/register', asyncHandler(register))
router.post('/login', asyncHandler(login))
router.put('/me', authenticate, asyncHandler(updateMe))

export default router
