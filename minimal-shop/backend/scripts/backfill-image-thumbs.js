// Одоо байгаа бараануудын зургийг шахаж, жагсаалтад зориулсан жижиг thumb
// үүсгэдэг нэг удаагийн script. Зураг шахалгүйгээр (утасны камерын хэмжээгээрээ)
// хадгалагдсан байсан тул барааны жагсаалт хэт хүнд (700KB+ хариу) байсныг засна.
//
// Ажиллуулах: node scripts/backfill-image-thumbs.js

import pool from '../src/config/db.js'
import { resizeDetailImage, resizeThumbImage } from '../src/utils/imageResize.js'

async function main() {
  const { rows } = await pool.query('SELECT id, image, images FROM products ORDER BY id')
  console.log(`${rows.length} бараа олдлоо.`)

  for (const product of rows) {
    const beforeLength = (product.image || '').length
    const newImage = product.image ? await resizeDetailImage(product.image) : product.image
    const newThumb = newImage ? await resizeThumbImage(newImage) : ''

    const newImages = []
    for (const img of product.images || []) {
      newImages.push(img ? await resizeDetailImage(img) : img)
    }

    await pool.query(
      'UPDATE products SET image = $1, image_thumb = $2, images = $3 WHERE id = $4',
      [newImage, newThumb, newImages, product.id]
    )

    console.log(
      `#${product.id}: image ${beforeLength} -> ${newImage.length} chars, thumb ${newThumb.length} chars, ${newImages.length} gallery images recompressed`
    )
  }

  console.log('Дууслаа.')
  await pool.end()
}

main().catch((err) => {
  console.error('Backfill script амжилтгүй боллоо:', err)
  process.exit(1)
})
