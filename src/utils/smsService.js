// utils/smsService.js
const axios = require('axios');

const sendSMSOTP = async (phone, otp) => {
    try {
        // Format phone number (remove any non-numeric characters)
        const formattedPhone = phone.replace(/\D/g, '');

        const apiKey = process.env.BULK_SMS_API_KEY;
        const senderId = process.env.SENDER_ID || 'CampusClients'; // Use SENDER_ID from env, fallback to 'CampusClients'
        const message = `Your verification OTP is: ${otp}. This code will expire in ${process.env.OTP_EXPIRE_MINUTES} minutes.`;

        console.log('Sending SMS with:', {
            apiKey: apiKey ? 'Present' : 'Missing',
            senderId,
            phone: formattedPhone,
            message
        });

        // BulkSMSBD API format - using senderid parameter
        const response = await axios.get(process.env.BULK_SMS_API_URL, {
            params: {
                api_key: apiKey,
                type: 'text',
                number: formattedPhone,
                senderid: senderId, // Using the sender ID from environment
                message: message
            }
        });

        console.log('SMS API Response:', response.data);

        // Check different response formats (BulkSMSBD might return different status codes)
        if (response.data) {
            // Some APIs return response_code, others return status_code
            const responseCode = response.data.response_code || response.data.status_code;

            if (responseCode === 202 || responseCode === 200 || responseCode === 1001) {
                return {
                    success: true,
                    data: response.data,
                    message: 'SMS sent successfully'
                };
            } else {
                return {
                    success: false,
                    error: response.data.error_message || 'SMS sending failed',
                    details: response.data
                };
            }
        } else {
            return { success: false, error: 'No response from SMS provider' };
        }
    } catch (error) {
        console.error('SMS sending error:', error);

        // Log more details about the error
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('SMS API Error Response:', error.response.data);
            console.error('SMS API Error Status:', error.response.status);
            return {
                success: false,
                error: `SMS provider error: ${error.response.status}`,
                details: error.response.data
            };
        } else if (error.request) {
            // The request was made but no response was received
            console.error('SMS API No Response:', error.request);
            return { success: false, error: 'No response from SMS provider' };
        } else {
            // Something happened in setting up the request that triggered an Error
            return { success: false, error: error.message };
        }
    }
};

module.exports = { sendSMSOTP };