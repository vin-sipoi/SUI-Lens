const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/authController');
const { validateRequestOTP, validateVerifyOTP, checkValidationResult } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');

// Define routes
router.post('/request-otp', validateRequestOTP, checkValidationResult, AuthController.requestOTP);
router.post('/verify-otp', validateVerifyOTP, checkValidationResult, AuthController.verifyOTP);
router.get('/profile', requireAuth, AuthController.getProfile);

module.exports = router;