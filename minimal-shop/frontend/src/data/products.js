// Категори лэйблийн lookup — зөвхөн UI-д харуулах нэрсийг агуулна.
// Бодит барааны өгөгдөл (нэр, үнэ, зураг, үлдэгдэл г.м.) бүгд backend
// API-аас (GET /api/products) ирнэ, эндээс ИРЭХГҮЙ.
//
// АНХААР: id утгууд нь backend-ийн src/utils/categories.js дотор байгаа
// VALID_CATEGORIES-тэй ХАРИЛЦАН АДИЛ байх ёстой.
export const CATEGORIES = [
  { id: 'home', name: 'Гэр ахуй' },
  { id: 'electronics', name: 'Цахилгаан хэрэгсэл' },
  { id: 'accessories', name: 'Дагалдах хэрэгсэл' },
]
