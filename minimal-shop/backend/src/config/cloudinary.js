import { v2 as cloudinary } from 'cloudinary'

// Render-ийн үнэгүй багц нь тогтмол disk дэмждэггүй тул deploy бүрд
// /uploads доторх файлууд устдаг. Cloudinary тохируулагдсан бол зургийг
// тэнд байнга хадгална; тохируулаагүй бол local disk руу буцаж хадгална
// (локал хөгжүүлэлтэд Cloudinary шаардлагагүй байх зорилготой).
export const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET
)

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

export default cloudinary
