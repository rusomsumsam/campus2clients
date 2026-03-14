const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');
const connectDB = require('../db');
const UserModel = require('../models/userModel');
const OTPModel = require('../models/otpModel');
const { generateOTP, generateOTPExpiry } = require('../utils/otpGenerator');
const { sendEmailOTP } = require('../utils/emailService');
const { sendSMSOTP } = require('../utils/smsService');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const db = await connectDB();
        const userModel = new UserModel(db);
        const otpModel = new OTPModel(db);

        const { firstName, lastName, email, phone, password, countryCode } = req.body;

        // Validation
        if (!firstName || !lastName || !email || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        
        // Check if user exists
        const existingUser = await userModel.findUserByEmail(email) || await userModel.findUserByPhone(phone);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email or phone'
            });
        }

        // Create user
        const newUser = await userModel.createUser({
            firstName,
            lastName,
            email,
            phone,
            password,
            countryCode
        });
        

        // Generate OTPs
        const emailOTP = generateOTP();
        const phoneOTP = generateOTP();
        

        // Store OTPs
    
        await otpModel.createOTP(newUser._id, email, phone, emailOTP, 'email');
        await otpModel.createOTP(newUser._id, email, phone, phoneOTP, 'phone');
        

        // Send OTPs (don't let failures block registration)
    
        const emailSent = await sendEmailOTP(email, emailOTP).catch(err => {
            console.error('Email sending failed:', err);
            return { success: false };
        });

        
        const smsSent = await sendSMSOTP(phone, phoneOTP).catch(err => {
            console.error('SMS sending failed:', err);
            return { success: false };
        });

        // Convert ObjectId to string for frontend
        const response = {
            success: true,
            message: 'Registration successful. Please verify your email and phone.',
            data: {
                userId: newUser._id.toString(), // Convert ObjectId to string
                email: newUser.email,
                phone: newUser.phone,
                emailOTPSent: emailSent.success || false,
                phoneOTPSent: smsSent.success || false
            }
        };

    
        res.status(201).json(response);

    } catch (error) {
        console.error('=== REGISTRATION ERROR ===');
        console.error('Error details:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP (email or phone)
// @access  Public
router.post('/verify-otp', async (req, res) => {
    try {
        const db = await connectDB();
        const userModel = new UserModel(db);
        const otpModel = new OTPModel(db);

        const { email, phone, otp, type } = req.body; // type: 'email' or 'phone'

        console.log('OTP verification request:', { email, phone, otp, type });

        if (!otp || !type || (!email && !phone)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide OTP and verification type'
            });
        }

        // Verify OTP
        const verifiedOTP = await otpModel.verifyOTP(email, phone, otp, type);

        if (!verifiedOTP) {
            // Check if OTP exists but is expired
            const latestOTP = await otpModel.findLatestOTP(email, phone, type);
            if (latestOTP.length > 0) {
                const otpRecord = latestOTP[0];
                if (new Date() > otpRecord.expiresAt) {
                    return res.status(400).json({
                        success: false,
                        message: 'OTP has expired. Please request a new one.'
                    });
                }
            }

            return res.status(400).json({
                success: false,
                message: 'Invalid OTP. Please check and try again.'
            });
        }

        console.log('OTP verified successfully:', verifiedOTP);

        // Update user verification status
        if (type === 'email' && email) {
            await userModel.verifyEmail(email);
        } else if (type === 'phone' && phone) {
            await userModel.verifyPhone(phone);
        }

        // Get updated user
        const user = email ?
            await userModel.findUserByEmail(email) :
            await userModel.findUserByPhone(phone);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if both verified
        const bothVerified = user.isEmailVerified && user.isPhoneVerified;

        if (bothVerified) {
            // Clean up OTPs
            await otpModel.deleteUserOTPs(user._id);

            // Generate token
            const token = generateToken(user._id);

            res.json({
                success: true,
                message: 'Both email and phone verified successfully',
                data: {
                    token,
                    user: {
                        id: user._id.toString(),
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        phone: user.phone,
                        isEmailVerified: user.isEmailVerified,
                        isPhoneVerified: user.isPhoneVerified
                    }
                }
            });
        } else {
            res.json({
                success: true,
                message: `${type} verified successfully. Please verify your ${type === 'email' ? 'phone' : 'email'}`,
                data: {
                    isEmailVerified: user.isEmailVerified,
                    isPhoneVerified: user.isPhoneVerified
                }
            });
        }

    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// @route   POST /api/auth/resend-otp
// @desc    Resend OTP
// @access  Public
router.post('/resend-otp', async (req, res) => {
    try {
        const db = await connectDB();
        const otpModel = new OTPModel(db);

        const { email, phone, type } = req.body; // type: 'email' or 'phone'

        console.log('Resend OTP request:', { email, phone, type });

        if (!type || (!email && !phone)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email or phone and verification type'
            });
        }

        // Find user
        const userModel = new UserModel(db);
        const user = email ?
            await userModel.findUserByEmail(email) :
            await userModel.findUserByPhone(phone);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if already verified
        if ((type === 'email' && user.isEmailVerified) ||
            (type === 'phone' && user.isPhoneVerified)) {
            return res.status(400).json({
                success: false,
                message: `${type} already verified`
            });
        }

        // Generate new OTP
        const newOTP = generateOTP();
        console.log(`New ${type} OTP generated:`, newOTP);

        // Store new OTP
        await otpModel.createOTP(user._id, user.email, user.phone, newOTP, type);

        // Send OTP
        let sent;
        if (type === 'email') {
            sent = await sendEmailOTP(user.email, newOTP);
        } else {
            sent = await sendSMSOTP(user.phone, newOTP);
        }

        if (!sent.success) {
            console.warn(`${type} OTP sending may have failed:`, sent.error);
        }

        res.json({
            success: true,
            message: `OTP resent to your ${type}`,
            data: {
                sent: sent.success || false
            }
        });

    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// auth.routes.js - Update the login route

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const db = await connectDB();
        const userModel = new UserModel(db);

        const { email, password, rememberMe } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user
        const user = await userModel.findUserByEmail(email);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if verified
        if (!user.isEmailVerified || !user.isPhoneVerified) {
            return res.status(403).json({
                success: false,
                message: 'Please verify your email and phone before logging in',
                data: {
                    isEmailVerified: user.isEmailVerified,
                    isPhoneVerified: user.isPhoneVerified,
                    email: user.email,
                    phone: user.phone
                }
            });
        }

        // Generate token
        const token = generateToken(user._id);

        // Set cookie options
        const cookieOptions = {
            httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
            secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
            sameSite: 'strict', // CSRF protection
            maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000 // 30 days if remember me, else 24 hours
        };

        // Set cookie
        res.cookie('token', token, cookieOptions);

        // Send response (without token in body for security)
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id.toString(),
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phone: user.phone,
                    isEmailVerified: user.isEmailVerified,
                    isPhoneVerified: user.isPhoneVerified
                }
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// auth.routes.js - Add logout route

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', protect, async (req, res) => {
    try {
        // Clear the cookie
        res.cookie('token', '', {
            httpOnly: true,
            expires: new Date(0),
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
    res.json({
        success: true,
        data: req.user
    });
});

module.exports = router;