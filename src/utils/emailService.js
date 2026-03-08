const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD.replace(/ /g, '') // Remove spaces from password
    }
});

const sendEmailOTP = async (email, otp) => {
    try {
        const mailOptions = {
            from: process.env.SMTP_FROM_EMAIL,
            to: email,
            subject: 'Email Verification OTP',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #47C682;">Email Verification</h2>
                    <p>Your OTP for email verification is:</p>
                    <h1 style="color: #86D245; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
                    <p>This OTP will expire in ${process.env.OTP_EXPIRE_MINUTES} minutes.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email sending error:', error);
        return { success: false, error: error.message };
    }
};

module.exports = { sendEmailOTP };