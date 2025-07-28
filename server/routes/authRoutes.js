const express = require('express');
const router = express.Router();
const Joi = require('joi');
const rateLimit = require('express-rate-limit');
const { signup, loginWithEmailPassword, loginWithGoogle, logout, refreshToken, checkAuth } = require('../controllers/authController');
const verifyToken = require('../middleware/authenticateToken');

// Rate Limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit to 5 requests per IP per window
  message: {
    error: 'Too many login attempts. Please try again later.',
  },
});

// Joi Validation for signup inputs
const signupSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  username: Joi.string().trim().required().messages({
    'any.required': 'Username is required',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'any.required': 'Password is required',
  }),
});

// Joi Validation for email-password login inputs
const emailPasswordLoginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required',
  }),
});

// Joi Validation for Google login inputs
const googleLoginSchema = Joi.object({
  googleToken: Joi.string().required().messages({
    'any.required': 'Google token is required',
    'string.base': 'Invalid Google token format',
  }),
});

// Route for user signup
router.post('/signup', async (req, res, next) => {
  try {
    const { error } = signupSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ errors: error.details });
    }

    await signup(req, res);
  } catch (err) {
    next(err);
  }
});

// Route for email-password login
router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { error } = emailPasswordLoginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ errors: error.details });
    }

    await loginWithEmailPassword(req, res);
  } catch (err) {
    next(err);
  }
});

// Route for Google login
router.post('/login/google', async (req, res, next) => {
  try {
    const { error } = googleLoginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ errors: error.details });
    }

    await loginWithGoogle(req, res);
  } catch (err) {
    next(err);
  }
});

// Route for refreshing the access token
router.post('/refresh-token', async (req, res, next) => {
  try {
    await refreshToken(req, res);
  } catch (err) {
    next(err);
  }
});

// Route for checking user authentication
router.get('/check-auth', verifyToken, checkAuth);

// Route for user logout
router.post('/logout', verifyToken, logout);

module.exports = router;
