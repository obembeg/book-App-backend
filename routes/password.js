const express = require("express");
const router = express.Router();
const forgotPassword = require("../services/forgetPassword");
const resetPassword = require("../services/resetPassword");

const rateLimit = require("express-rate-limit");

const forgotPasswordLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // Maximum 5 requests
  message: {
    message: "Too many password reset requests. Please try again later.",
  },
});

const resetPasswordLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: {
    message: "Too many password reset requests. Please try again later.",
  },
});

router.post("/reset-password", resetPasswordLimiter, resetPassword);

router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);




module.exports = router;
