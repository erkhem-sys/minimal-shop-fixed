import express from 'express'
import { getSettings, updateSettings } from '../controllers/settingsController.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = express.Router()

// Нийтэд нээлттэй — нүүр хуудас энэ эндпойнтоос hero зураг/текстээ уншина.
router.get('/', asyncHandler(getSettings))

// Зөвхөн админ
router.put('/', authenticate, requireAdmin, asyncHandler(updateSettings))

export default router
