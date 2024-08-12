import nodemailer from "nodemailer";
import jwtUtil from "./jwt.util";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_KEY,
  },
});

interface ISendEmail {
  email: string;
  subject: string;
  body: string;
}
export const sendEmail = async ({ email, subject, body }: ISendEmail) => {
  console.info("Sending email");
  const info = await transporter.sendMail({
    from: "Projects <no-reply>",
    subject,
    to: email,
    html: body,
  });
  console.info("Email sended");
  return info ? info.messageId : null;
};

export const sendValidationEmail = async (email: string) => {
  const FE_URL = process.env.APP_FE_URL as string;

  const verifyToken = jwtUtil.createEmailToken({ email });
  const verificationLink = FE_URL + "/verify-email?token=" + verifyToken;
  const subject = "Test Subject";
  const body = `<body><h2>Email verification</h2><a href="${verificationLink}">Verify Email</a><p>Or visit this url</p><p>${verificationLink}</p><p>This link will expired in 10 minutes</p></body>`;
  await sendEmail({ email, body, subject });
};
