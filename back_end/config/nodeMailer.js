import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: "vmec ahaz ewhw vnpr",
    },
})

export default transporter;