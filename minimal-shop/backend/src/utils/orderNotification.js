import resend, { isMailConfigured } from '../config/resend.js'

function formatMNT(amount) {
  return `${Number(amount).toLocaleString('mn-MN')}₮`
}

const DELIVERY_LABELS = { standard: 'Энгийн хүргэлт', express: 'Шуурхай хүргэлт', pickup: 'Өөрөө очиж авах' }
const PAYMENT_LABELS = {
  bank_transfer: 'Банкны шилжүүлэг',
  qr: 'QR төлбөр',
  cash_on_delivery: 'Хүргэлтээр төлөх',
}

// Шинэ захиалга орж ирэхэд admin-д имэйлээр мэдэгдэнэ. Имэйл тохируулаагүй
// эсвэл илгээхэд алдаа гарсан ч захиалгын үйл явцад саад болохгүйн тулд
// уг функцийг дуудагч тал "await"-гүйгээр дуудна (fire-and-forget).
export async function sendNewOrderEmail(order, items) {
  if (!isMailConfigured) return

  const itemsText = items
    .map((item) => `  • ${item.product_name} × ${item.quantity} — ${formatMNT(item.price * item.quantity)}`)
    .join('\n')

  const body = `Шинэ захиалга ирлээ (#${order.id})

Харилцагч: ${order.customer_name}
Утас: ${order.customer_phone}
Хаяг: ${order.customer_address}, ${order.customer_district}
Хүргэлт: ${DELIVERY_LABELS[order.delivery_method] || order.delivery_method}
Төлбөр: ${PAYMENT_LABELS[order.payment_method] || order.payment_method}

Бараа:
${itemsText}

Нийт дүн: ${formatMNT(order.total)}

Захиалгыг admin панелаас удирдана уу: https://minimal-shop-fixed.vercel.app/admin/orders`

  try {
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Минимал Хэрэглээ Шоп <onboarding@resend.dev>',
      to: process.env.NOTIFY_EMAIL,
      subject: `Шинэ захиалга #${order.id} — ${formatMNT(order.total)}`,
      text: body,
    })
    if (error) throw error
  } catch (err) {
    console.error('Захиалгын имэйл мэдэгдэл илгээхэд алдаа гарлаа:', err)
  }
}

// Захиалагч өөрөө захиалгаа хийсний баталгаа болгон энэ имэйлийг авна (admin-д
// зориулсан мэдэгдлээс өөр, харилцагчид зориулсан найрсаг өнгө аястай).
// Захиалгын маягтад имэйл заавал биш талбар тул зөвхөн өгсөн үед л дуудагдана.
export async function sendOrderConfirmationEmail(order, items) {
  if (!isMailConfigured) return

  const itemsText = items
    .map((item) => `  • ${item.product_name} × ${item.quantity} — ${formatMNT(item.price * item.quantity)}`)
    .join('\n')

  const body = `Сайн байна уу, ${order.customer_name}!

Таны захиалгыг бид хүлээн авлаа. Баярлалаа!

Захиалгын дугаар: #${order.id}

Бараа:
${itemsText}

Нийт дүн: ${formatMNT(order.total)}

Хүргэлт: ${DELIVERY_LABELS[order.delivery_method] || order.delivery_method}
Төлбөр: ${PAYMENT_LABELS[order.payment_method] || order.payment_method}
Хаяг: ${order.customer_address}, ${order.customer_district}

Бид удахгүй тантай холбогдож захиалгаа баталгаажуулна. Асуух зүйл байвал 80701907 дугаар руу залгаарай.

Хүндэтгэсэн,
Минимал Хэрэглээ Шоп`

  try {
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Минимал Хэрэглээ Шоп <onboarding@resend.dev>',
      to: order.customer_email,
      subject: `Таны захиалга #${order.id} хүлээн авагдлаа`,
      text: body,
    })
    if (error) throw error
  } catch (err) {
    console.error('Захиалгын баталгаажуулах имэйл илгээхэд алдаа гарлаа:', err)
  }
}
