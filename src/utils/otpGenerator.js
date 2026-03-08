const crypto = require('crypto');

const generateOTP = () => {
    // Generate 6-digit OTP
    return crypto.randomInt(100000, 999999).toString();
};

const generateOTPExpiry = () => {
    const expiryMinutes = parseInt(process.env.OTP_EXPIRE_MINUTES) || 10;
    return new Date(Date.now() + expiryMinutes * 60 * 1000);
};

module.exports = {
    generateOTP,
    generateOTPExpiry
};