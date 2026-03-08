// backend/routes/user-registration.js
const express = require("express");
const { ObjectId } = require("mongodb");
const connectDB = require("../db");

const router = express.Router();

// Get all users from user collection
router.post("/manual-reg", async (req, res) => {
    try {
        const db = await connectDB();
        const userCollection = db.collection("users");

        res.status(200).json({
            success: true,
            message: "Users registration successfull",
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