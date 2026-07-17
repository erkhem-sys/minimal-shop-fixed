import express from 'express'
import { getSettings, updateSettings } from '../controllers/settingsController.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = express.Router()

// Нийтэд нээлттэй — нүүр хуудас энэ эндпойнтоос hero зураг/текстээ уншина.
router.get('/', asyncHandler(getSettings))

// heroImage base64 байж болох тул том хязгаартай, гэхдээ зөвхөн
// authenticate/requireAdmin давсны дараа л энэ parser ажиллана.
router.put('/', authenticate, requireAdmin, express.json({ limit: '5mb' }), asyncHandler(updateSettings))

export default router
