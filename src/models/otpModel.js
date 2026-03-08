// models/otpModel.js
const { ObjectId } = require('mongodb');

class OTPModel {
    constructor(db) {
        this.collection = db.collection('otps');
    }

    async createOTP(userId, email, phone, otp, type) {
        const otpData = {
            userId: new ObjectId(userId),
            email: email.toLowerCase(),
            phone,
            otp,
            type,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
        };

        const result = await this.collection.insertOne(otpData);
        return result;
    }

    async verifyOTP(email, phone, otp, type) {
        try {
            // Build the query
            const query = {};

            if (email) {
                query.email = email.toLowerCase();
            }
            if (phone) {
                query.phone = phone;
            }

            query.otp = otp;
            query.type = { $in: [type, 'both'] };
            query.expiresAt = { $gt: new Date() };

            console.log('OTP verification query:', JSON.stringify(query, null, 2));

            // First, find the OTP document
            const otpDocument = await this.collection.findOne(query);

            if (!otpDocument) {
                console.log('No OTP found matching query');
                return null;
            }

            console.log('OTP found:', otpDocument);

            // Delete the OTP document after finding it
            await this.collection.deleteOne({ _id: otpDocument._id });

            return otpDocument;
        } catch (error) {
            console.error('Error in verifyOTP:', error);
            throw error;
        }
    }

    async deleteUserOTPs(userId) {
        return await this.collection.deleteMany({ userId: new ObjectId(userId) });
    }

    async findLatestOTP(email, phone, type) {
        const query = {};

        if (email) {
            query.email = email.toLowerCase();
        }
        if (phone) {
            query.phone = phone;
        }

        query.type = { $in: [type, 'both'] };

        return await this.collection
            .find(query)
            .sort({ createdAt: -1 })
            .limit(1)
            .toArray();
    }
}

module.exports = OTPModel;