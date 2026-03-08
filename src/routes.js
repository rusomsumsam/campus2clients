const express = require("express");
const router = express.Router();

const sellProductRoutes = require("./routes/demo.routes");
const signupRoutes = require("./routes/signup.routes");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");

// এখানে শুধু route register থাকবে
router.use("/sell-product", sellProductRoutes);
router.use("/signup", signupRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);

module.exports = router;