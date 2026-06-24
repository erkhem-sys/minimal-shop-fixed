import express from 'express'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import upload from '../middleware/upload.js'
import { uploadImage } from '../controllers/uploadController.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = express.Router()

router.post('/', authenticate, requireAdmin, upload.single('image'), asyncHandler(uploadImage))

export default router
