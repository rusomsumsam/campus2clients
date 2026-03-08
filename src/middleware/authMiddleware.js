// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const connectDB = require('../db');

const protect = async (req, res, next) => {
    let token;

    // Check for token in cookies first, then in Authorization header
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, no token'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const db = await connectDB();
        const user = await db.collection('users').findOne(
            { _id: new ObjectId(decoded.id) },
            { projection: { password: 0 } }
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, token failed'
        });
    }
};

module.exports = { protect };