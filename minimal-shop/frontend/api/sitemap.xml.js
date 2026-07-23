// Vercel serverless function — /sitemap.xml руу rewrite хийгдэж ирнэ (vercel.json үзнэ үү).
// Барааны жагсаалт нь admin панелаас байнга өөрчлөгддөг тул static файлын оронд
// хүсэлт бүрт backend-ээс шууд татаж, XML-ийг тухай бүрд нь үүсгэнэ.

const SITE_URL = 'https://minimalheregleeshop.com'
const API_URL = process.env.VITE_API_URL || 'https://minimal-shop-fixed.onrender.com/api'

const STATIC_PATHS = ['', '/products', '/about', '/contact']

export default async function handler(req, res) {
  let products = []
  try {
    const response = await fetch(`${API_URL}/products`)
    if (response.ok) {
      const data = await response.json()
      products = data.products || []
    }
  } catch {
    // Backend хүрэхгүй бол (жишээ нь Render сэрж байгаа үе) статик хуудсуудаар л хязгаарлана.
  }

  const urls = [
    ...STATIC_PATHS.map((path) => `${SITE_URL}${path}`),
    ...products.map((p) => `${SITE_URL}/products/${p.id}`),
  ]

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${url}</loc></url>`).join('\n')}
</urlset>`

  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.status(200).send(body)
}
