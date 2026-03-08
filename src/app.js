// server.js or app.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser'); // Add this
const connectDB = require("./db");

const app = express();

/* ---------- Express CORS Middleware ----------- */
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://abhijatyo.com",
        "https://www.abhijatyo.com"
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true // Important for cookies
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Add cookie parser middleware

// 🔒 Prevent caching middleware
app.use((req, res, next) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");
    next();
});

// ✅ Health check route
app.get("/", (req, res) => {
    res.json({ success: true, message: "Server is running" });
});

// 🔥 All Routes Import
const routes = require("./routes");

app.use("/api", routes);

module.exports = app;