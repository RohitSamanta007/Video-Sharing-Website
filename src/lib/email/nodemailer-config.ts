import nodemailer from "nodemailer"

const transpoter = nodemailer.createTransport({
    host: process.env.HOST_NAME,
    port: 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    }
})

export default transpoter;