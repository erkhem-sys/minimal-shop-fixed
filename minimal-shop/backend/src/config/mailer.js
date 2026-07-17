import nodemailer from 'nodemailer'

// GMAIL_USER/GMAIL_APP_PASSWORD тохируулаагүй үед (жишээ нь локал хөгжүүлэлт)
// имэйл илгээхийг тэмдэглээд алгасна — захиалга үүсгэхэд саад болохгүй.
export const isMailConfigured = Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD)

const transporter = isMailConfigured
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })
  : null

export default transporter
