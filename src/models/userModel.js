// models/userModel.js
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb'); // Add this line

class UserModel {
    constructor(db) {
        this.collection = db.collection('users');
    }

    async createUser(userData) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        const user = {
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email.toLowerCase(),
            phone: userData.phone,
            password: hashedPassword,
            countryCode: userData.countryCode,

            isEmailVerified: false,
            isPhoneVerified: false,

            userType: "general",
            admin: false,

            wallet: [
                {
                    totalEarning: "",
                    
                }

            ],

            ban: false,

            violation: [],

            createdAt: new Date(),
            updatedAt: new Date()
        };


        const result = await this.collection.insertOne(user);
        return { ...user, _id: result.insertedId };
    }

    async findUserByEmail(email) {
        return await this.collection.findOne({ email: email.toLowerCase() });
    }

    async findUserByPhone(phone) {
        return await this.collection.findOne({ phone });
    }

    async findUserById(id) {
        return await this.collection.findOne({ _id: new ObjectId(id) }); // Now ObjectId is defined
    }

    async verifyEmail(email) {
        return await this.collection.updateOne(
            { email: email.toLowerCase() },
            {
                $set: {
                    isEmailVerified: true,
                    updatedAt: new Date()
                }
            }
        );
    }

    async verifyPhone(phone) {
        return await this.collection.updateOne(
            { phone },
            {
                $set: {
                    isPhoneVerified: true,
                    updatedAt: new Date()
                }
            }
        );
    }
}

module.exports = UserModel;