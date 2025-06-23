// Tools to check user input
const { body, validationResult } = require('express-validator');

// Checking /request-otp input
const validateRequestOTP = [
    body('email').isEmail().withMessage('Please enter a valid email')
];

// Checking /verify-otp input
const validateVerifyOTP = [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('otp').isString().isLength({min: 6, max:6 }).withMessage('OTP must be 6 digits')
];

const validateCreateEvent = [
  body('title').notEmpty().withMessage('Title is required'),
  body('date').isDate().withMessage('Valid date is required'),
  body('time').matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time is required'),
  body('timezone').notEmpty().withMessage('Timezone is required'),
  body('isFree').isBoolean().withMessage('isFree must be a boolean'),
  body('requiresApproval').isBoolean().withMessage('requiresApproval must be a boolean'),
  body('isPrivate').isBoolean().withMessage('isPrivate must be a boolean'),
  body('ticketPrice').optional().isFloat({ min: 0 }).withMessage('Valid ticket price is required'),
  body('capacity').optional().isInt({ min: 1 }).withMessage('Valid capacity is required')
];

// Checks for input errors
const checkValidationResult = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array()});
    }
    next();
};

module.exports = {
    validateRequestOTP,
    validateVerifyOTP,
    validateCreateEvent,
    checkValidationResult
};