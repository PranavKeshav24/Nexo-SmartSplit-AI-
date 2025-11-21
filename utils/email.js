// utils/email.js
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * Sends a password reset email to the user.
 * @param {string} toEmail - The recipient's email address.
 * @param {string} token - The secure, unhashed reset token.
 */
async function sendResetEmail(toEmail, token) {
    const resetLink = `http://localhost:3000/reset-password?token=${token}`; // Frontend link

    await transporter.sendMail({
        from: `"SmartSplit AI" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: "SmartSplit AI Password Reset Request",
        html: `
            <p>You requested a password reset. Click the link below to set a new password:</p>
            <p><a href="${resetLink}">Reset Password Link</a></p>
            <p>This link expires in 1 hour.</p>
        `,
    });
    console.log(`Email sent successfully to: ${toEmail}`);
}

module.exports = { sendResetEmail };