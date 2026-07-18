import resend, { isMailConfigured } from '../config/resend.js'

// Нууц үг сэргээх холбоос бүхий имэйл. Имэйл тохируулаагүй эсвэл илгээхэд алдаа
// гарсан ч хүсэлтийн урсгалд саад болохгүйн тулд дуудагч тал "await"-гүйгээр дуудна.
export async function sendPasswordResetEmail(user, resetUrl) {
  if (!isMailConfigured) return

  const body = `Сайн байна уу, ${user.name}!

Та нууц үгээ сэргээх хүсэлт илгээсэн байна. Доорх холбоос дээр дарж шинэ нууц үг тохируулна уу (холбоос 1 цагийн дараа хүчингүй болно):

${resetUrl}

Хэрэв та энэ хүсэлтийг илгээгээгүй бол энэ имэйлийг үл тоомсорлож болно — таны нууц үг өөрчлөгдөхгүй.

Хүндэтгэсэн,
Минимал Хэрэглээ Шоп`

  try {
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Минимал Хэрэглээ Шоп <onboarding@resend.dev>',
      to: user.email,
      subject: 'Нууц үг сэргээх хүсэлт',
      text: body,
    })
    if (error) throw error
  } catch (err) {
    console.error('Нууц үг сэргээх имэйл илгээхэд алдаа гарлаа:', err)
  }
}
