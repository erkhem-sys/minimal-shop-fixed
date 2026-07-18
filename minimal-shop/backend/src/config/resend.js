import { Resend } from 'resend'

// RESEND_API_KEY/NOTIFY_EMAIL тохируулаагүй үед (жишээ нь локал хөгжүүлэлт)
// имэйл илгээхийг тэмдэглээд алгасна — захиалга үүсгэхэд саад болохгүй.
// SMTP (Gmail) -ийн оронд HTTP API ашигладаг шалтгаан: Render-ийн үнэгүй
// багц гарах чиглэлийн SMTP холболтыг хориглодог (ETIMEDOUT), харин HTTP
// хүсэлт хориглогддоггүй.
export const isMailConfigured = Boolean(process.env.RESEND_API_KEY && process.env.NOTIFY_EMAIL)

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export default resend
