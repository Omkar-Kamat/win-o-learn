import { body, validationResult } from 'express-validator';
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res
            .status(400)
            .json({ success: false, message: 'Validation failed', errors: errors.array() });
    }
    next();
};
const passwordValidation = (field = 'password') => 
    body(field)
        .notEmpty()
        .withMessage(`${field} is required`)
        .isLength({ min: 8 })
        .withMessage(`${field} must be at least 8 characters`)
        .matches(/[A-Z]/)
        .withMessage(`${field} must contain at least one uppercase letter`)
        .matches(/[0-9]/)
        .withMessage(`${field} must contain at least one number`)
        .matches(/[!@#$%^&*(),.?":{}|<>]/)
        .withMessage(`${field} must contain at least one special character`);

export const validateSignup = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email address')
        .normalizeEmail(),
    passwordValidation('password'),
    body('role').optional().isIn(['participant', 'organizer', 'judge']).withMessage('Invalid role'),
    handleValidationErrors,
];
export const validateLogin = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email address')
        .normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
    handleValidationErrors,
];
export const validateChangePassword = [
    body('oldPassword').notEmpty().withMessage('Old password is required'),
    passwordValidation('newPassword'),
    handleValidationErrors,
];
export const validateForgotPassword = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email address')
        .normalizeEmail(),
    handleValidationErrors,
];
export const validateResetPassword = [
    passwordValidation('password'),
    handleValidationErrors,
];
