const express = require('express');
const { ObjectId } = require('mongodb');
const connectDB = require('../db');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();


// backend/routes/authRoutes.js বা আপনার রাউটার ফাইলে

router.get('/profile', protect, async (req, res) => {
    try {
        // Ensure we're sending the complete user object
        const db = await connectDB();
        const user = await db.collection('users').findOne(
            { _id: new ObjectId(req.user._id) },
            { projection: { password: 0 } }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});


router.put('/profile', protect, async (req, res) => {
    try {
        const db = await connectDB();
        const { firstName, lastName } = req.body;

        const updateData = {
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
            updatedAt: new Date()
        };

        const result = await db.collection('users').updateOne(
            { _id: new ObjectId(req.user._id) },
            { $set: updateData }
        );

        if (result.modifiedCount === 0) {
            return res.status(400).json({
                success: false,
                message: 'No changes made'
            });
        }

        const updatedUser = await db.collection('users').findOne(
            { _id: new ObjectId(req.user._id) },
            { projection: { password: 0 } }
        );

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedUser
        });

    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});


router.get('/', protect, async (req, res) => {
    try {
        const db = await connectDB();
        const users = await db.collection('users')
            .find({}, { projection: { password: 0 } })
            .toArray();

        res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            data: users,
            count: users.length
        });

    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
});

module.exports = router;