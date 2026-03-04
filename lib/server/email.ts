import nodemailer from "nodemailer";

export async function sendVerificationEmail(to: string, code: string): Promise<void> {
  const user = process.env.GMAIL_USER;
  const appPassword = process.env.GMAIL_APP_PASSWORD;

  if (!user || !appPassword) {
    throw new Error(
      "Email service is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in .env.local."
    );
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user,
      pass: appPassword,
    },
  });

  await transporter.sendMail({
    from: `"CourseMate" <${user}>`,
    to,
    subject: "Your CourseMate verification code",
    text: `Your CourseMate verification code is ${code}. It expires in 10 minutes.`,
    html: `<p>Your CourseMate verification code is <strong>${code}</strong>.</p><p>It expires in 10 minutes.</p>`,
  });
}
