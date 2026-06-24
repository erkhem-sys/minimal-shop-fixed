// Backend-ээс ирсэн зургийн зам (image) хоёр янзаар ирж болно:
//  1) Бүрэн URL (admin-аас upload хийсэн бараа — uploadController нь
//     PUBLIC_BASE_URL-ийг урдаас залгаж бүрэн URL болгож хадгалдаг)
//  2) Харьцангуй зам, жишээ нь "/uploads/hook-set9.jpeg" (seed өгөгдөл)
//
// Frontend, backend нь production-д ӨӨР домэйн дээр байрлах тул (Vercel /
// Render) харьцангуй замыг шууд ашиглавал зураг харагдахгүй болно.
// Иймд VITE_API_URL-ээс backend-ийн "origin"-ийг гаргаж аваад харьцангуй
// замын урд залгаж бүрэн URL болгоно.

const API_BASE = import.meta.env.VITE_API_URL || '/api'

// "http://localhost:4000/api" -> "http://localhost:4000"
// "https://my-backend.onrender.com/api/" -> "https://my-backend.onrender.com"
// "/api" (proxy ашиглах тохиргоо) -> "" (харьцангуй хэвээр үлдээнэ)
const BACKEND_ORIGIN = API_BASE.replace(/\/api\/?$/, '')

export function resolveImageUrl(path) {
  if (!path) return ''
  // Аль хэдийн бүрэн URL эсвэл data: URI бол өөрчлөхгүй
  if (/^(https?:)?\/\//i.test(path) || path.startsWith('data:')) {
    return path
  }
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${BACKEND_ORIGIN}${normalizedPath}`
}
