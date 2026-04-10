import nodemailer from 'nodemailer'

interface EmailOptions {
  email: string
  subject: string
  message: string
}

const sendEmail = async (options: EmailOptions): Promise<void> => {
  let transporter

  // Use defined SMTP transport if available in .env
  if (process.env.SMTP_HOST && process.env.SMTP_EMAIL) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    })
  } else {
    // Generate test SMTP service account from ethereal.email if no .env config
    const testAccount = await nodemailer.createTestAccount()
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    })
  }

  const message = {
    from: `${process.env.FROM_NAME || 'Vistara Service'} <${process.env.FROM_EMAIL || 'noreply@vistara.local'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  }

  const info = await transporter.sendMail(message)

  console.log('Message sent: %s', info.messageId)
  
  // Preview only available when sending through an Ethereal account
  if (!process.env.SMTP_HOST) {
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
  }
}

export default sendEmail
