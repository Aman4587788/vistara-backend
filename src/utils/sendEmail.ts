interface EmailOptions {
  email: string
  subject: string
  message: string
}

const sendEmail = async (options: EmailOptions): Promise<void> => {
  // If no SMTP configured, just log the email (no-op for production without email setup)
  if (!process.env.SMTP_HOST || !process.env.SMTP_EMAIL) {
    console.log(`[Email skipped - no SMTP config] To: ${options.email}, Subject: ${options.subject}`)
    return
  }

  // Lazy import to avoid crash if nodemailer has issues
  const nodemailer = await import('nodemailer')
  const transporter = nodemailer.default.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  })

  const message = {
    from: `${process.env.FROM_NAME || 'Vistara Service'} <${process.env.FROM_EMAIL || 'noreply@vistara.local'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  }

  const info = await transporter.sendMail(message)
  console.log('Message sent: %s', info.messageId)
}

export default sendEmail
